using CryptoMarket.Application.DTOs.Store;
using CryptoMarket.Application.Interfaces;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CryptoMarket.Infrastructure.Services;

public class StoreService : IStoreService
{
    private readonly AppDbContext _context;

    public StoreService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> GetProductsAsync()
    {
        return await _context.Products
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                Category = p.Category
            })
            .ToListAsync();
    }

    public async Task<ProductDto?> GetProductAsync(Guid id)
    {
        var p = await _context.Products.FindAsync(id);
        if (p == null) return null;

        return new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            ImageUrl = p.ImageUrl,
            Category = p.Category
        };
    }

    public async Task<CartDto> GetCartAsync(Guid userId)
    {
        var cart = await GetOrCreateCartAsync(userId);

        return new CartDto
        {
            Id = cart.Id,
            Items = cart.Items.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                Price = i.Product.Price,
                Quantity = i.Quantity,
                ImageUrl = i.Product.ImageUrl
            }).ToList()
        };
    }

    public async Task AddToCartAsync(Guid userId, AddToCartRequest request)
    {
        var cart = await GetOrCreateCartAsync(userId);
        var product = await _context.Products.FindAsync(request.ProductId) 
                      ?? throw new Exception("Product not found");

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                Quantity = request.Quantity
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task RemoveFromCartAsync(Guid userId, Guid itemId)
    {
        var cart = await GetOrCreateCartAsync(userId);
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);

        if (item != null)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    public async Task CheckoutAsync(Guid userId)
    {
        var cart = await GetOrCreateCartAsync(userId);
        
        // Visual only - just clear items
        _context.CartItems.RemoveRange(cart.Items);
        await _context.SaveChangesAsync();
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }
}
