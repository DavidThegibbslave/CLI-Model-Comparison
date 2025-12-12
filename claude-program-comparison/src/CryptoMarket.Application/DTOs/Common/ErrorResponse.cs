namespace CryptoMarket.Application.DTOs.Common;

public class ErrorResponse
{
    public ErrorDetails Error { get; set; } = new();
}

public class ErrorDetails
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public List<ValidationError>? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Path { get; set; } = string.Empty;
}

public class ValidationError
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
