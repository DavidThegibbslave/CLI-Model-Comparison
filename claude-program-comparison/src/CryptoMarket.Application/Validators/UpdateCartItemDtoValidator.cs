using CryptoMarket.Application.DTOs.Store;
using FluentValidation;

namespace CryptoMarket.Application.Validators;

public class UpdateCartItemDtoValidator : AbstractValidator<UpdateCartItemDto>
{
    public UpdateCartItemDtoValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be greater than 0.")
            .LessThanOrEqualTo(1000000)
            .WithMessage("Amount cannot exceed 1,000,000.")
            .PrecisionScale(18, 8, true)
            .WithMessage("Amount cannot have more than 8 decimal places.");
    }
}
