using CryptoMarket.Application.DTOs.Store;
using FluentValidation;

namespace CryptoMarket.Application.Validators;

public class AddToCartDtoValidator : AbstractValidator<AddToCartDto>
{
    public AddToCartDtoValidator()
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

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be greater than 0.")
            .LessThanOrEqualTo(1000000)
            .WithMessage("Amount cannot exceed 1,000,000.")
            .PrecisionScale(18, 8, true)
            .WithMessage("Amount cannot have more than 8 decimal places.");
    }
}
