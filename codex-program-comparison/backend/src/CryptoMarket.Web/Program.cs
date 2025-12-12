using System.Text;
using CryptoMarket.Application.Interfaces;
using CryptoMarket.Application.Options;
using CryptoMarket.Infrastructure.Data;
using CryptoMarket.Infrastructure.Repositories;
using CryptoMarket.Infrastructure.Services;
using CryptoMarket.Infrastructure.ExternalApis;
using CryptoMarket.Application.Services;
using CryptoMarket.Web.BackgroundServices;
using CryptoMarket.Web.Filters;
using CryptoMarket.Web.Hubs;
using CryptoMarket.Web.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configuration & logging
builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console();
});

// DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["DB_CONNECTION"];
if (string.IsNullOrWhiteSpace(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase("CryptoMarket"));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
}

builder.Services.AddScoped<ICryptoDataService, CryptoDataService>();
builder.Services.Configure<AuthTokenOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.Configure<CryptoApiOptions>(builder.Configuration.GetSection("CryptoApi"));
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<ICryptoAnalysisService, CryptoAnalysisService>();
builder.Services.AddScoped<ICryptoMarketService, CryptoMarketService>();
builder.Services.AddSingleton<IStoreService, StoreService>();
builder.Services.AddScoped<IPortfolioService, PortfolioService>();
builder.Services.AddScoped<IAlertService, AlertService>();
builder.Services.AddHttpClient<IExternalCryptoApiClient, CoinGeckoClient>();
builder.Services.AddResponseCompression(options =>
{
    options.Providers.Add<GzipCompressionProvider>();
});

// Caching (Redis optional)
var redisConnection = builder.Configuration.GetConnectionString("Redis") ?? builder.Configuration["REDIS_CONNECTION"];
if (!string.IsNullOrWhiteSpace(redisConnection))
{
    builder.Services.AddStackExchangeRedisCache(options => options.Configuration = redisConnection);
}
else
{
    builder.Services.AddDistributedMemoryCache();
}

// Controllers + SignalR
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
});
builder.Services.AddSignalR();
builder.Services.AddHostedService<MarketPriceBackgroundService>();

// CORS
const string DefaultCorsPolicy = "DefaultCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(DefaultCorsPolicy, policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        policy.WithOrigins(
                allowedOrigins.Length > 0
                    ? allowedOrigins
                    : new[]
                    {
                        "https://localhost:4173",
                        "http://localhost:4173",
                        "https://localhost:5173",
                        "http://localhost:5173",
                        "https://127.0.0.1:4173",
                        "http://127.0.0.1:4173",
                        "https://127.0.0.1:5173",
                        "http://127.0.0.1:5173"
                    })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Rate limiting (fixed window)
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", limiterOptions =>
    {
        limiterOptions.PermitLimit = 100;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueLimit = 50;
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Authentication (JWT)
var jwtConfig = builder.Configuration.GetSection("Jwt").Get<AuthTokenOptions>() ?? new AuthTokenOptions();
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig.Key));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = true;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateIssuer = true,
            ValidIssuer = jwtConfig.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtConfig.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
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

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseResponseCompression();
app.UseSerilogRequestLogging();
app.UseCors(DefaultCorsPolicy);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<MarketHub>("/hubs/market").RequireRateLimiting("fixed");

app.Run();
