using System.ComponentModel.DataAnnotations;

namespace CryptoMarket.Application.DTOs.Crypto;

public class CompareRequest
{
    [MinLength(2)]
    public List<string> AssetIds { get; set; } = new();
}
