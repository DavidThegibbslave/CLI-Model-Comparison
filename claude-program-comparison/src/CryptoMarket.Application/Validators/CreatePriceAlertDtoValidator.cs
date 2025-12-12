using CryptoMarket.Application.DTOs.Alerts;
using FluentValidation;

namespace CryptoMarket.Application.Validators;

public class CreatePriceAlertDtoValidator : AbstractValidator<CreatePriceAlertDto>
{
    public CreatePriceAlertDtoValidator()
    {
        RuleFor(x => x.CryptoId)
            .NotEmpty()
            .WithMessage("Cryptocurrency ID is required.")
            .MinimumLength(2)
            .WithMessage("Cryptocurrency ID must be at least 2 characters.")
            .MaximumLength(100)
            .WithMessage("Cryptocurrency ID cannot exceed 100 characters.")
            .Matches("^[a-z0-9-]+$")
            .WithMessage("Cryptocurrency ID can only contain lowercase letters, numbers, and hyphens.");

        RuleFor(x => x.TargetPrice)
            .GreaterThan(0)
            .WithMessage("Target price must be greater than 0.")
            .LessThanOrEqualTo(10000000)
            .WithMessage("Target price cannot exceed 10,000,000.");
    }
}
