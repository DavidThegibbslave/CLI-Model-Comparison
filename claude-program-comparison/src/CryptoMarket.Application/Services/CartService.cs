using CryptoMarket.Application.DTOs.Store;
using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Application.Interfaces.Services;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace CryptoMarket.Application.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly ICryptoHoldingRepository _holdingRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly ICryptoService _cryptoService;
    private readonly ILogger<CartService> _logger;

    public CartService(
        ICartRepository cartRepository,
        IPortfolioRepository portfolioRepository,
        ICryptoHoldingRepository holdingRepository,
        ITransactionRepository transactionRepository,
        ICryptoService cryptoService,
        ILogger<CartService> logger)
    {
        _cartRepository = cartRepository;
        _portfolioRepository = portfolioRepository;
        _holdingRepository = holdingRepository;
        _transactionRepository = transactionRepository;
        _cryptoService = cryptoService;
        _logger = logger;
    }

    public async Task<CartDto> GetCartAsync(Guid userId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId);

        if (cart == null)
        {
            throw new InvalidOperationException("Cart not found for user");
        }

        return await MapToCartDtoAsync(cart);
    }

    public async Task<CartDto> AddToCartAsync(Guid userId, AddToCartDto addToCartDto)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId);

        if (cart == null)
        {
            throw new InvalidOperationException("Cart not found for user");
        }

        // Fetch current crypto data
        var cryptoDetail = await _cryptoService.GetCryptoDetailAsync(addToCartDto.CryptoId);

        if (cryptoDetail == null)
        {
            throw new InvalidOperationException($"Cryptocurrency '{addToCartDto.CryptoId}' not found");
        }

        // Check if item already exists in cart
        var existingItem = cart.Items.FirstOrDefault(i => i.CryptoId == addToCartDto.CryptoId);

        if (existingItem != null)
        {
            // Update existing item
            existingItem.Amount += addToCartDto.Amount;
            existingItem.PriceAtAdd = cryptoDetail.CurrentPrice;
        }
        else
        {
            // Add new item
            var cartItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                CryptoId = cryptoDetail.Id,
                Symbol = cryptoDetail.Symbol,
                Name = cryptoDetail.Name,
                Amount = addToCartDto.Amount,
                PriceAtAdd = cryptoDetail.CurrentPrice,
                AddedAt = DateTime.UtcNow
            };

            cart.Items.Add(cartItem);
        }

        await _cartRepository.UpdateAsync(cart);

        _logger.LogInformation("Added {Amount} {Symbol} to cart for user {UserId}",
            addToCartDto.Amount, cryptoDetail.Symbol, userId);

        return await MapToCartDtoAsync(cart);
    }

    public async Task<CartDto> UpdateCartItemAsync(Guid userId, Guid cartItemId, UpdateCartItemDto updateDto)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId);

        if (cart == null)
        {
            throw new InvalidOperationException("Cart not found for user");
        }

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);

        if (item == null)
        {
            throw new InvalidOperationException("Cart item not found");
        }

        if (updateDto.Amount <= 0)
        {
            throw new ArgumentException("Amount must be greater than 0");
        }

        item.Amount = updateDto.Amount;

        await _cartRepository.UpdateAsync(cart);

        _logger.LogInformation("Updated cart item {ItemId} to amount {Amount} for user {UserId}",
            cartItemId, updateDto.Amount, userId);

        return await MapToCartDtoAsync(cart);
    }

    public async Task<CartDto> RemoveFromCartAsync(Guid userId, Guid cartItemId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId);

        if (cart == null)
        {
            throw new InvalidOperationException("Cart not found for user");
        }

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);

        if (item == null)
        {
            throw new InvalidOperationException("Cart item not found");
        }

        cart.Items.Remove(item);

        await _cartRepository.UpdateAsync(cart);

        _logger.LogInformation("Removed cart item {ItemId} for user {UserId}", cartItemId, userId);

        return await MapToCartDtoAsync(cart);
    }

    public async Task<CartDto> ClearCartAsync(Guid userId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId);

        if (cart == null)
        {
            throw new InvalidOperationException("Cart not found for user");
        }

        cart.Items.Clear();

        await _cartRepository.UpdateAsync(cart);

        _logger.LogInformation("Cleared cart for user {UserId}", userId);

        return await MapToCartDtoAsync(cart);
    }

    public async Task<CheckoutResultDto> CheckoutAsync(Guid userId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId);

        if (cart == null)
        {
            throw new InvalidOperationException("Cart not found for user");
        }

        if (!cart.Items.Any())
        {
            throw new InvalidOperationException("Cart is empty");
        }

        var portfolio = await _portfolioRepository.GetByUserIdAsync(userId);

        if (portfolio == null)
        {
            throw new InvalidOperationException("Portfolio not found for user");
        }

        var purchasedCryptos = new List<string>();
        decimal totalValue = 0;

        // Process each cart item
        foreach (var item in cart.Items.ToList())
        {
            // Fetch current price
            var cryptoDetail = await _cryptoService.GetCryptoDetailAsync(item.CryptoId);

            if (cryptoDetail == null)
            {
                _logger.LogWarning("Cryptocurrency {CryptoId} not found during checkout, skipping", item.CryptoId);
                continue;
            }

            var currentPrice = cryptoDetail.CurrentPrice;
            var transactionValue = item.Amount * currentPrice;
            totalValue += transactionValue;

            // Create or update holding
            var holding = await _holdingRepository.GetByPortfolioAndCryptoAsync(portfolio.Id, item.CryptoId);

            if (holding == null)
            {
                // Create new holding
                holding = new CryptoHolding
                {
                    Id = Guid.NewGuid(),
                    PortfolioId = portfolio.Id,
                    CryptoId = item.CryptoId,
                    Symbol = item.Symbol,
                    Name = item.Name,
                    Amount = item.Amount,
                    AveragePurchasePrice = currentPrice,
                    FirstPurchaseDate = DateTime.UtcNow
                };

                await _holdingRepository.CreateAsync(holding);
            }
            else
            {
                // Update existing holding - calculate new average price
                var totalCost = (holding.Amount * holding.AveragePurchasePrice) + (item.Amount * currentPrice);
                holding.Amount += item.Amount;
                holding.AveragePurchasePrice = totalCost / holding.Amount;

                await _holdingRepository.UpdateAsync(holding);
            }

            // Create transaction record
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                PortfolioId = portfolio.Id,
                CryptoId = item.CryptoId,
                Symbol = item.Symbol,
                Type = TransactionType.Buy,
                Amount = item.Amount,
                PriceAtTransaction = currentPrice,
                Timestamp = DateTime.UtcNow
            };

            await _transactionRepository.CreateAsync(transaction);

            purchasedCryptos.Add($"{item.Symbol} ({item.Amount})");
        }

        // Clear cart after successful checkout
        cart.Items.Clear();
        await _cartRepository.UpdateAsync(cart);

        _logger.LogInformation("Checkout completed for user {UserId}. Purchased {Count} cryptocurrencies worth {Value}",
            userId, purchasedCryptos.Count, totalValue);

        return new CheckoutResultDto
        {
            Success = true,
            Message = "Purchase completed successfully! Your cryptocurrencies have been added to your portfolio.",
            ItemsPurchased = purchasedCryptos.Count,
            TotalValue = totalValue,
            PurchasedCryptos = purchasedCryptos
        };
    }

    private async Task<CartDto> MapToCartDtoAsync(Cart cart)
    {
        var cartDto = new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt,
            Items = new List<CartItemDto>()
        };

        foreach (var item in cart.Items)
        {
            // Fetch current price for each item
            var cryptoDetail = await _cryptoService.GetCryptoDetailAsync(item.CryptoId);
            var currentPrice = cryptoDetail?.CurrentPrice ?? item.PriceAtAdd;

            cartDto.Items.Add(new CartItemDto
            {
                Id = item.Id,
                CryptoId = item.CryptoId,
                Symbol = item.Symbol,
                Name = item.Name,
                Amount = item.Amount,
                PriceAtAdd = item.PriceAtAdd,
                CurrentPrice = currentPrice,
                AddedAt = item.AddedAt
            });
        }

        return cartDto;
    }
}
