using System.Security.Claims;
using CryptoMarket.Application.DTOs.Auth;
using CryptoMarket.Application.Interfaces.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CryptoMarket.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IValidator<RegisterDto> _registerValidator;
    private readonly IValidator<LoginDto> _loginValidator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        IValidator<RegisterDto> registerValidator,
        IValidator<LoginDto> loginValidator,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _logger = logger;
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(TokenDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(409)]
    public async Task<ActionResult<TokenDto>> Register([FromBody] RegisterDto registerDto)
    {
        var validationResult = await _registerValidator.ValidateAsync(registerDto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        try
        {
            var result = await _authService.RegisterAsync(registerDto);
            _logger.LogInformation("User registered successfully: {Email}", registerDto.Email);
            return CreatedAtAction(nameof(GetMe), new { }, result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registration failed: {Message}", ex.Message);
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(TokenDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<TokenDto>> Login([FromBody] LoginDto loginDto)
    {
        var validationResult = await _loginValidator.ValidateAsync(loginDto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        try
        {
            var result = await _authService.LoginAsync(loginDto);
            _logger.LogInformation("User logged in: {Email}", loginDto.Email);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Login failed: {Message}", ex.Message);
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(TokenDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<TokenDto>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
    {
        if (string.IsNullOrEmpty(refreshTokenDto.RefreshToken))
        {
            return BadRequest(new { error = "Refresh token is required" });
        }

        try
        {
            var result = await _authService.RefreshTokenAsync(refreshTokenDto.RefreshToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Token refresh failed: {Message}", ex.Message);
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenDto refreshTokenDto)
    {
        if (!string.IsNullOrEmpty(refreshTokenDto.RefreshToken))
        {
            await _authService.RevokeTokenAsync(refreshTokenDto.RefreshToken);
        }

        _logger.LogInformation("User logged out");
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var user = await _authService.GetCurrentUserAsync(userId);
            return Ok(user);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "User not found" });
        }
    }
}
