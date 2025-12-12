using CryptoMarket.Application.DTOs.Cart;
using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Application.Interfaces.Services;
using CryptoMarket.Application.Services;
using CryptoMarket.Domain.Entities;
using Microsoft.Extensions.Logging;
using Moq;

namespace CryptoMarket.Tests.Unit.Services;

public class CartServiceTests
{
    private readonly Mock<ICartRepository> _cartRepositoryMock;
    private readonly Mock<ICartItemRepository> _cartItemRepositoryMock;
    private readonly Mock<ICryptoService> _cryptoServiceMock;
    private readonly Mock<IPortfolioService> _portfolioServiceMock;
    private readonly Mock<ILogger<CartService>> _loggerMock;
    private readonly CartService _cartService;

    public CartServiceTests()
    {
        _cartRepositoryMock = new Mock<ICartRepository>();
        _cartItemRepositoryMock = new Mock<ICartItemRepository>();
        _cryptoServiceMock = new Mock<ICryptoService>();
        _portfolioServiceMock = new Mock<IPortfolioService>();
        _loggerMock = new Mock<ILogger<CartService>>();

        _cartService = new CartService(
            _cartRepositoryMock.Object,
            _cartItemRepositoryMock.Object,
            _cryptoServiceMock.Object,
            _portfolioServiceMock.Object,
            _loggerMock.Object
        );
    }

    [Fact]
    public async Task GetCartAsync_UserHasCart_ReturnsCartDto()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cart = new Cart
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CartItems = new List<CartItem>
            {
                new CartItem
                {
                    Id = Guid.NewGuid(),
                    CryptoId = "bitcoin",
                    Symbol = "BTC",
                    Name = "Bitcoin",
                    Amount = 0.5m,
                    PriceAtAdd = 50000m,
                    CurrentPrice = 52000m
                }
            }
        };

        _cartRepositoryMock.Setup(x => x.GetByUserIdWithItemsAsync(userId))
            .ReturnsAsync(cart);

        // Act
        var result = await _cartService.GetCartAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(cart.Id, result.Id);
        Assert.Equal(cart.UserId, result.UserId);
        Assert.Single(result.Items);
        Assert.Equal(26000m, result.TotalValue); // 0.5 * 52000
        Assert.Equal(1, result.TotalItems);
    }

    [Fact]
    public async Task AddToCartAsync_NewItem_AddsSuccessfully()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var request = new AddToCartRequest
        {
            CryptoId = "ethereum",
            Amount = 1.5m
        };

        var cart = new Cart
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CartItems = new List<CartItem>()
        };

        _cartRepositoryMock.Setup(x => x.GetByUserIdWithItemsAsync(userId))
            .ReturnsAsync(cart);

        _cryptoServiceMock.Setup(x => x.GetCryptoDetailAsync(request.CryptoId))
            .ReturnsAsync(new Application.DTOs.Crypto.CryptoDetail
            {
                Id = "ethereum",
                Symbol = "eth",
                Name = "Ethereum",
                CurrentPrice = 3000m
            });

        // Act
        var result = await _cartService.AddToCartAsync(userId, request);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Items);
        Assert.Equal("ethereum", result.Items[0].CryptoId);
        Assert.Equal(1.5m, result.Items[0].Amount);
        Assert.Equal(3000m, result.Items[0].PriceAtAdd);

        _cartItemRepositoryMock.Verify(x => x.AddAsync(It.IsAny<CartItem>()), Times.Once);
    }

    [Fact]
    public async Task AddToCartAsync_ExistingItem_UpdatesAmount()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var existingItemId = Guid.NewGuid();
        var request = new AddToCartRequest
        {
            CryptoId = "bitcoin",
            Amount = 0.3m
        };

        var cart = new Cart
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CartItems = new List<CartItem>
            {
                new CartItem
                {
                    Id = existingItemId,
                    CryptoId = "bitcoin",
                    Symbol = "BTC",
                    Name = "Bitcoin",
                    Amount = 0.5m,
                    PriceAtAdd = 50000m,
                    CurrentPrice = 52000m
                }
            }
        };

        _cartRepositoryMock.Setup(x => x.GetByUserIdWithItemsAsync(userId))
            .ReturnsAsync(cart);

        _cryptoServiceMock.Setup(x => x.GetCryptoDetailAsync(request.CryptoId))
            .ReturnsAsync(new Application.DTOs.Crypto.CryptoDetail
            {
                Id = "bitcoin",
                Symbol = "btc",
                Name = "Bitcoin",
                CurrentPrice = 52000m
            });

        // Act
        var result = await _cartService.AddToCartAsync(userId, request);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Items);
        Assert.Equal(0.8m, result.Items[0].Amount); // 0.5 + 0.3

        _cartItemRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<CartItem>()), Times.Once);
        _cartItemRepositoryMock.Verify(x => x.AddAsync(It.IsAny<CartItem>()), Times.Never);
    }

    [Fact]
    public async Task UpdateCartItemAsync_ValidItem_UpdatesSuccessfully()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var itemId = Guid.NewGuid();
        var request = new UpdateCartItemRequest
        {
            Amount = 2.5m
        };

        var cartItem = new CartItem
        {
            Id = itemId,
            Cart = new Cart { UserId = userId },
            CryptoId = "bitcoin",
            Symbol = "BTC",
            Name = "Bitcoin",
            Amount = 1.0m,
            PriceAtAdd = 50000m,
            CurrentPrice = 52000m
        };

        _cartItemRepositoryMock.Setup(x => x.GetByIdWithCartAsync(itemId))
            .ReturnsAsync(cartItem);

        _cartRepositoryMock.Setup(x => x.GetByUserIdWithItemsAsync(userId))
            .ReturnsAsync(cartItem.Cart);

        // Act
        var result = await _cartService.UpdateCartItemAsync(userId, itemId, request);

        // Assert
        Assert.NotNull(result);
        _cartItemRepositoryMock.Verify(x => x.UpdateAsync(It.Is<CartItem>(i => i.Amount == 2.5m)), Times.Once);
    }

    [Fact]
    public async Task RemoveCartItemAsync_ValidItem_RemovesSuccessfully()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var itemId = Guid.NewGuid();

        var cartItem = new CartItem
        {
            Id = itemId,
            Cart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CartItems = new List<CartItem>()
            },
            CryptoId = "bitcoin",
            Symbol = "BTC",
            Name = "Bitcoin",
            Amount = 1.0m
        };

        cartItem.Cart.CartItems.Add(cartItem);

        _cartItemRepositoryMock.Setup(x => x.GetByIdWithCartAsync(itemId))
            .ReturnsAsync(cartItem);

        _cartRepositoryMock.Setup(x => x.GetByUserIdWithItemsAsync(userId))
            .ReturnsAsync(cartItem.Cart);

        // Act
        var result = await _cartService.RemoveCartItemAsync(userId, itemId);

        // Assert
        Assert.NotNull(result);
        _cartItemRepositoryMock.Verify(x => x.DeleteAsync(itemId), Times.Once);
    }

    [Fact]
    public async Task CheckoutAsync_ValidCart_CreatesTransactionsAndClearsCart()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cart = new Cart
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CartItems = new List<CartItem>
            {
                new CartItem
                {
                    Id = Guid.NewGuid(),
                    CryptoId = "bitcoin",
                    Symbol = "BTC",
                    Name = "Bitcoin",
                    Amount = 0.5m,
                    PriceAtAdd = 50000m,
                    CurrentPrice = 52000m
                },
                new CartItem
                {
                    Id = Guid.NewGuid(),
                    CryptoId = "ethereum",
                    Symbol = "ETH",
                    Name = "Ethereum",
                    Amount = 2.0m,
                    PriceAtAdd = 3000m,
                    CurrentPrice = 3100m
                }
            }
        };

        _cartRepositoryMock.Setup(x => x.GetByUserIdWithItemsAsync(userId))
            .ReturnsAsync(cart);

        _portfolioServiceMock.Setup(x => x.AddPurchaseAsync(userId, It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _cartService.CheckoutAsync(userId);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(2, result.ItemsPurchased);
        Assert.Equal(32200m, result.TotalValue); // (0.5 * 52000) + (2.0 * 3100)
        Assert.Equal(2, result.PurchasedCryptos.Count);

        _portfolioServiceMock.Verify(x => x.AddPurchaseAsync(userId, It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()), Times.Exactly(2));
        _cartItemRepositoryMock.Verify(x => x.DeleteRangeAsync(It.IsAny<IEnumerable<Guid>>()), Times.Once);
    }

    [Fact]
    public async Task CheckoutAsync_EmptyCart_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cart = new Cart
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CartItems = new List<CartItem>()
        };

        _cartRepositoryMock.Setup(x => x.GetByUserIdWithItemsAsync(userId))
            .ReturnsAsync(cart);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _cartService.CheckoutAsync(userId)
        );

        _portfolioServiceMock.Verify(x => x.AddPurchaseAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<decimal>(), It.IsAny<decimal>()), Times.Never);
    }
}
