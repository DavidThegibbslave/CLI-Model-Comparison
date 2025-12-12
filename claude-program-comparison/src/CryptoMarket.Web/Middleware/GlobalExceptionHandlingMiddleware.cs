using System.Net;
using System.Text.Json;
using CryptoMarket.Application.DTOs.Common;
using FluentValidation;

namespace CryptoMarket.Web.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public GlobalExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlingMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var errorResponse = new ErrorResponse
        {
            Error = new ErrorDetails
            {
                Timestamp = DateTime.UtcNow,
                Path = context.Request.Path
            }
        };

        switch (exception)
        {
            case ValidationException validationEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.Error.Code = "VALIDATION_ERROR";
                errorResponse.Error.Message = "One or more validation errors occurred.";
                errorResponse.Error.Details = validationEx.Errors.Select(e => new ValidationError
                {
                    Field = e.PropertyName,
                    Message = e.ErrorMessage
                }).ToList();
                break;

            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.Error.Code = "AUTHENTICATION_REQUIRED";
                errorResponse.Error.Message = "Authentication is required to access this resource.";
                break;

            case KeyNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse.Error.Code = "RESOURCE_NOT_FOUND";
                errorResponse.Error.Message = exception.Message;
                break;

            case InvalidOperationException invalidOpEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.Error.Code = "INVALID_OPERATION";
                errorResponse.Error.Message = invalidOpEx.Message;
                break;

            case ArgumentException argEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.Error.Code = "INVALID_ARGUMENT";
                errorResponse.Error.Message = argEx.Message;
                break;

            case HttpRequestException httpEx:
                context.Response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
                errorResponse.Error.Code = "EXTERNAL_API_ERROR";
                errorResponse.Error.Message = "An error occurred while communicating with external services.";

                // Include more details in development
                if (_environment.IsDevelopment())
                {
                    errorResponse.Error.Message += $" Details: {httpEx.Message}";
                }
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse.Error.Code = "INTERNAL_SERVER_ERROR";
                errorResponse.Error.Message = "An unexpected error occurred. Please try again later.";

                // Only expose stack trace in development
                if (_environment.IsDevelopment())
                {
                    errorResponse.Error.Details = new List<ValidationError>
                    {
                        new ValidationError
                        {
                            Field = "StackTrace",
                            Message = exception.StackTrace ?? "No stack trace available"
                        },
                        new ValidationError
                        {
                            Field = "ExceptionType",
                            Message = exception.GetType().Name
                        }
                    };
                }
                break;
        }

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = _environment.IsDevelopment()
        };

        var json = JsonSerializer.Serialize(errorResponse, options);
        await context.Response.WriteAsync(json);
    }
}
