using VaccinationManager.DTOs.Auth;

namespace VaccinationManager.Services.Interfaces
{
    public interface IAuthService
    {
        Task<string> RegisterDoctorAsync(RegisterDoctorDto dto);

        Task<string> VerifyOtpAsync(VerifyOtpDto dto);

        Task<string> LoginDoctorAsync(LoginDoctorDto dto);

        Task<string> ForgotPasswordAsync(ForgotPasswordDto dto);

        Task<string> VerifyForgotPasswordOtpAsync(
            VerifyForgotPasswordOtpDto dto);

        Task<string> ResetPasswordAsync(
            ResetPasswordDto dto);
    }
}