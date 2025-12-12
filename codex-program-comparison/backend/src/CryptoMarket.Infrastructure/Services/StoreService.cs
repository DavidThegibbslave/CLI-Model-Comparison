using System.Collections.Concurrent;
using CryptoMarket.Application.DTOs.Store;
using CryptoMarket.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace CryptoMarket.Infrastructure.Services;

public class StoreService : IStoreService
{
    private readonly ILogger<StoreService> _logger;
    private static readonly List<ProductDto> _products = SeedProducts();
    private static readonly ConcurrentDictionary<Guid, CartState> _carts = new();

    public StoreService(ILogger<StoreService> logger)
    {
        _logger = logger;
    }

    public Task<IReadOnlyList<ProductDto>> GetProductsAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<ProductDto>>(_products);
    }

    public Task<ProductDto?> GetProductAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        return Task.FromResult<ProductDto?>(product);
    }

    public Task<CartDto> GetCartAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var cart = _carts.GetOrAdd(userId, CreateCart);
        return Task.FromResult(MapCart(cart));
    }

    public Task<CartDto> AddItemAsync(Guid userId, AddCartItemRequest request, CancellationToken cancellationToken = default)
    {
        var product = _products.FirstOrDefault(p => p.Id == request.ProductId);
        if (product == null)
        {
            throw new InvalidOperationException("Product not found");
        }

        var cart = _carts.GetOrAdd(userId, CreateCart);
        var item = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
        if (item == null)
        {
            item = new CartItemState
            {
                Id = Guid.NewGuid(),
                ProductId = request.ProductId,
                ProductName = product.Name,
                UnitPrice = product.Price,
                Quantity = Math.Max(request.Quantity, 1)
            };
            cart.Items.Add(item);
        }
        else
        {
            item.Quantity += Math.Max(request.Quantity, 1);
        }

        return Task.FromResult(MapCart(cart));
    }

    public Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId, CancellationToken cancellationToken = default)
    {
        var cart = _carts.GetOrAdd(userId, CreateCart);
        cart.Items.RemoveAll(i => i.Id == itemId);
        return Task.FromResult(MapCart(cart));
    }

    public Task<CheckoutResponse> CheckoutAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var cart = _carts.GetOrAdd(userId, CreateCart);
        cart.Items.Clear();
        var response = new CheckoutResponse
        {
            CartId = cart.Id,
            ClearedAt = DateTime.UtcNow,
            Message = "Cart cleared (demo only, no payment)."
        };
        _logger.LogInformation("Demo checkout completed for user {UserId} cart {CartId}", userId, cart.Id);
        return Task.FromResult(response);
    }

    private static CartState CreateCart(Guid userId)
    {
        return new CartState
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static CartDto MapCart(CartState state)
    {
        var items = state.Items.Select(i => new CartItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice
        }).ToList();

        return new CartDto
        {
            Id = state.Id,
            UserId = state.UserId,
            CreatedAt = state.CreatedAt,
            Items = items
        };
    }

    private static List<ProductDto> SeedProducts()
    {
        return new List<ProductDto>
        {
            NewProduct("Ledger Nano S Plus", "Hardware wallet for secure storage.", 79m, "hardware", "https://dummyimage.com/ledger"),
            NewProduct("Trezor Model T", "Touchscreen hardware wallet.", 219m, "hardware", "https://dummyimage.com/trezor"),
            NewProduct("Crypto Hoodie", "Comfort cotton hoodie with crypto print.", 49m, "merch", "https://dummyimage.com/hoodie"),
            NewProduct("BTC Cap", "Baseball cap with Bitcoin logo.", 25m, "merch", "https://dummyimage.com/cap"),
            NewProduct("DeFi Guide eBook", "Practical intro to DeFi basics.", 15m, "digital", "https://dummyimage.com/ebook"),
            NewProduct("NFT Art Poster", "A3 poster of generative art.", 29m, "merch", "https://dummyimage.com/poster"),
            NewProduct("GPU Rig Frame", "Open-air mining frame (demo).", 120m, "hardware", "https://dummyimage.com/frame"),
            NewProduct("Crypto Stickers Pack", "20-pack vinyl stickers.", 9m, "merch", "https://dummyimage.com/stickers"),
            NewProduct("Developer Tee", "Soft tee for devs.", 27m, "merch", "https://dummyimage.com/tshirt"),
            NewProduct("Cold Storage Bundle", "Bundle of wallet + accessories.", 159m, "bundle", "https://dummyimage.com/bundle"),
            NewProduct("Charting Course", "Video course on technical analysis.", 59m, "digital", "https://dummyimage.com/course"),
            NewProduct("Risk Meter Dashboard", "Dashboard skin for risk meter demo.", 19m, "digital", "https://dummyimage.com/dashboard")
        };
    }

    private static ProductDto NewProduct(string name, string description, decimal price, string category, string imageUrl)
    {
        return new ProductDto
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            Price = price,
            Category = category,
            ImageUrl = imageUrl
        };
    }

    private class CartState
    {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
        public DateTime CreatedAt { get; init; }
        public List<CartItemState> Items { get; } = new();
    }

    private class CartItemState
    {
        public Guid Id { get; init; }
        public Guid ProductId { get; init; }
        public string ProductName { get; init; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; init; }
    }
}
