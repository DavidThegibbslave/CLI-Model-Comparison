namespace CryptoMarket.Application.DTOs.Auth;

public class MeResponse
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public IReadOnlyCollection<string> Roles { get; set; } = Array.Empty<string>();
}
