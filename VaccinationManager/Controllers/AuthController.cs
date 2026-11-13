using Microsoft.AspNetCore.Mvc;
using VaccinationManager.DTOs.Auth;
using VaccinationManager.Services.Interfaces;

namespace VaccinationManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDoctorDto dto)
        {
            var result = await _authService.RegisterDoctorAsync(dto);

            if (result.Contains("already"))
                return BadRequest(new { message = result });

            return Ok(new { message = result });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(VerifyOtpDto dto)
        {
            var result = await _authService.VerifyOtpAsync(dto);

            if (result.Contains("not found", StringComparison.OrdinalIgnoreCase) ||
                result.Contains("invalid", StringComparison.OrdinalIgnoreCase) ||
                result.Contains("expired", StringComparison.OrdinalIgnoreCase) ||
                result.Contains("Maximum", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = result });
            }

            return Ok(new { message = result });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDoctorDto dto)
        {
            var result = await _authService.LoginDoctorAsync(dto);

            if (result.Contains("Invalid") ||
                result.Contains("verify") ||
                result.Contains("inactive"))
            {
                return BadRequest(new { message = result });
            }

            return Ok(new
            {
                message = "Login successful.",
                token = result
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var result = await _authService.ForgotPasswordAsync(dto);

            if (result.Contains("not registered") ||
                result.Contains("verify your email"))
            {
                return BadRequest(new { message = result });
            }

            return Ok(new { message = result });
        }

        [HttpPost("verify-forgot-password-otp")]
        public async Task<IActionResult> VerifyForgotPasswordOtp(
            VerifyForgotPasswordOtpDto dto)
        {
            var result = await _authService
                .VerifyForgotPasswordOtpAsync(dto);

            if (result.Contains("not registered") ||
                result.Contains("invalid") ||
                result.Contains("Invalid") ||
                result.Contains("expired") ||
                result.Contains("Maximum"))
            {
                return BadRequest(new { message = result });
            }

            return Ok(new { message = result });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(
            ResetPasswordDto dto)
        {
            var result = await _authService.ResetPasswordAsync(dto);

            if (result.Contains("not registered") ||
                result.Contains("verify OTP"))
            {
                return BadRequest(new { message = result });
            }

            return Ok(new { message = result });
        }
    }
}