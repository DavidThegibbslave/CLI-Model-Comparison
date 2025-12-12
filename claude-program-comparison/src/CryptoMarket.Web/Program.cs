using System.Text;
using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Application.Interfaces.Services;
using CryptoMarket.Application.Services;
using CryptoMarket.Infrastructure.BackgroundJobs;
using CryptoMarket.Infrastructure.Data;
using CryptoMarket.Infrastructure.ExternalServices;
using CryptoMarket.Infrastructure.ExternalServices.CoinGecko;
using CryptoMarket.Infrastructure.Repositories;
using CryptoMarket.Infrastructure.ExternalServices.Mock;
using CryptoMarket.Web.Hubs;
using CryptoMarket.Web.Middleware;
using CryptoMarket.Web.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithEnvironmentName()
    .WriteTo.Console()
    .WriteTo.File(
        path: "logs/cryptomarket-.log",
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllersWithViews();

// Database Configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(
        connectionString,
        sqliteOptions =>
        {
            // Raise command timeout to avoid slow startup queries timing out on constrained systems
            sqliteOptions.CommandTimeout(60);
        }));

// Memory Cache
builder.Services.AddMemoryCache();

// Rate Limiting Configuration
builder.Services.AddOptions();
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? new[] { "http://localhost:3000", "http://localhost:5173" };

            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// JWT Authentication Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured.");
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // SignalR support - token from query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// SignalR
builder.Services.AddSignalR();

var featureFlags = builder.Configuration.GetSection("FeatureFlags");
var useMockCrypto = featureFlags.GetValue<bool>("UseMockCryptoData");
var enablePriceJob = featureFlags.GetValue<bool>("EnablePriceUpdateJob");

// HttpClient for External APIs (only if external data enabled)
if (!useMockCrypto)
{
    builder.Services.AddHttpClient("CoinGecko", client =>
    {
        var baseUrl = builder.Configuration.GetSection("CoinGecko")["BaseUrl"] ?? "https://api.coingecko.com/api/v3/";
        var timeoutSeconds = builder.Configuration.GetValue<int>("CoinGecko:RequestTimeoutSeconds", 30);
        client.BaseAddress = new Uri(baseUrl);
        client.DefaultRequestHeaders.Add("Accept", "application/json");
        client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
    });
}

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CryptoMarket.Application.Validators.RegisterDtoValidator>();

// Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
if (useMockCrypto)
{
    builder.Services.AddSingleton<ICryptoService, MockCryptoService>();
}
else
{
    builder.Services.AddScoped<ICryptoService, CoinGeckoService>();
}
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IPortfolioService, PortfolioService>();
builder.Services.AddScoped<IPriceAlertService, PriceAlertService>();

// Infrastructure Services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IPortfolioRepository, PortfolioRepository>();
builder.Services.AddScoped<ICryptoHoldingRepository, CryptoHoldingRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IPriceAlertRepository, PriceAlertRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();

// SignalR Broadcasting Service
builder.Services.AddSingleton<IHubBroadcaster, HubBroadcaster>();

// Background Services (skip when using mock/offline data)
if (!useMockCrypto && enablePriceJob)
{
    builder.Services.AddHostedService<PriceUpdateJob>();
}

var app = builder.Build();

// Configure the HTTP request pipeline
// Global exception handling (must be early in pipeline)
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

var enableHttpsRedirect = builder.Configuration.GetValue<bool>("EnableHttpsRedirection", false);

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// Request logging
app.UseSerilogRequestLogging();

// Security Headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    await next();
});

if (enableHttpsRedirect)
{
    app.UseHttpsRedirection();
}
app.UseStaticFiles();

app.UseRouting();

// Rate Limiting
app.UseIpRateLimiting();

// CORS
app.UseCors("AllowFrontend");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map Controllers
app.MapControllers();

// Map SignalR Hubs
app.MapHub<PriceUpdateHub>("/hubs/prices");

// Map default MVC route
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Seed Database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        await DbInitializer.SeedAsync(context, logger);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the database");
    }
}

try
{
    Log.Information("Starting CryptoMarket application");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
