using CryptoMarket.Web.Middleware;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CryptoMarket.Web.Filters;

public class ValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState
                .Where(kvp => kvp.Value?.Errors.Count > 0)
                .Select(kvp => new { field = kvp.Key, messages = kvp.Value!.Errors.Select(e => e.ErrorMessage) });

            context.Result = new BadRequestObjectResult(new
            {
                error = new { code = "validation_error", message = "Validation failed", details = errors }
            });
            return;
        }

        await next();
    }
}
