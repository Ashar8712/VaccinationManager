using System.Security.Cryptography;
using System.Text;
using VaccinationManager.DTOs.Auth;
using VaccinationManager.Models;
using VaccinationManager.Repositories.Interfaces;
using VaccinationManager.Services.Interfaces;

namespace VaccinationManager.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IOtpRepository _otpRepository;
        private readonly IEmailService _emailService;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthService(
            IDoctorRepository doctorRepository,
            IOtpRepository otpRepository,
            IEmailService emailService,
            IJwtTokenService jwtTokenService)
        {
            _doctorRepository = doctorRepository;
            _otpRepository = otpRepository;
            _emailService = emailService;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<string> RegisterDoctorAsync(RegisterDoctorDto dto)
        {
            var existingEmail = await _doctorRepository.GetByEmailAsync(dto.Email);

            if (existingEmail != null)
                return "Email is already registered.";

            var existingPhone = await _doctorRepository
                .GetByPhoneAsync(dto.CountryCode, dto.PhoneNumber);

            if (existingPhone != null)
                return "Phone number is already registered.";

            var existingPMDC = await _doctorRepository
                .GetByPMDCNumberAsync(dto.PMDCNumber);

            if (existingPMDC != null)
                return "PMDC number is already registered.";

            var doctor = new Doctor
            {
                Name = dto.Name,
                Email = dto.Email,
                CountryCode = dto.CountryCode,
                PhoneNumber = dto.PhoneNumber,
                PMDCNumber = dto.PMDCNumber,
                PasswordHash = HashValue(dto.Password),
                IsEmailVerified = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _doctorRepository.AddAsync(doctor);
            await _doctorRepository.SaveChangesAsync();

            var otpCode = RandomNumberGenerator
                .GetInt32(100000, 1000000)
                .ToString();

            var otpVerification = new OtpVerification
            {
                Email = dto.Email,
                OtpHash = HashValue(otpCode),
                Purpose = "Registration",
                ExpiryTime = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false,
                AttemptCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            await _otpRepository.AddAsync(otpVerification);
            await _otpRepository.SaveChangesAsync();

            await _emailService.SendOtpEmailAsync(dto.Email, otpCode);

            // Email sending will be added in the next step.

            return "Registration successful. Please verify the OTP sent to your email.";
        }

        public async Task<string> VerifyOtpAsync(VerifyOtpDto dto)
        {
            var doctor = await _doctorRepository.GetByEmailAsync(dto.Email);

            if (doctor == null)
                return "Doctor not found.";

            if (doctor.IsEmailVerified)
                return "Email is already verified.";

            var otpRecord = await _otpRepository
     .GetActiveOtpByEmailAsync(dto.Email, "Registration");

            if (otpRecord == null)
                return "OTP is invalid or expired.";

            if (otpRecord.AttemptCount >= 5)
                return "Maximum OTP attempts exceeded.";

            if (otpRecord.OtpHash != HashValue(dto.Otp))
            {
                otpRecord.AttemptCount++;

                await _otpRepository.UpdateAsync(otpRecord);
                await _otpRepository.SaveChangesAsync();

                return "Invalid OTP.";
            }

            otpRecord.IsUsed = true;
            doctor.IsEmailVerified = true;

            await _otpRepository.UpdateAsync(otpRecord);
            await _doctorRepository.UpdateAsync(doctor);

            await _otpRepository.SaveChangesAsync();
            await _doctorRepository.SaveChangesAsync();

            return "Email verified successfully. You can now login.";
        }

        public async Task<string> LoginDoctorAsync(LoginDoctorDto dto)
        {
            var doctor = await _doctorRepository
                .GetByPhoneAsync(dto.CountryCode, dto.PhoneNumber);

            if (doctor == null)
                return "Invalid phone number or password.";

            if (doctor.PasswordHash != HashValue(dto.Password))
                return "Invalid phone number or password.";

            if (!doctor.IsEmailVerified)
                return "Please verify your email before login.";

            if (!doctor.IsActive)
                return "Your account is inactive.";

            var token = _jwtTokenService.GenerateToken(doctor);

            return token;
        }

        public async Task<string> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var doctor = await _doctorRepository.GetByEmailAsync(dto.Email);

            if (doctor == null)
                return "Email is not registered.";

            if (!doctor.IsEmailVerified)
                return "Please verify your email first.";

            var otpCode = RandomNumberGenerator
                .GetInt32(100000, 1000000)
                .ToString();

            var otpVerification = new OtpVerification
            {
                Email = doctor.Email,
                OtpHash = HashValue(otpCode),
                Purpose = "ForgotPassword",
                ExpiryTime = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false,
                AttemptCount = 0,
                CreatedAt = DateTime.UtcNow
            };

            await _otpRepository.AddAsync(otpVerification);
            await _otpRepository.SaveChangesAsync();

            await _emailService.SendOtpEmailAsync(
                doctor.Email,
                otpCode);

            return "Password reset OTP has been sent to your registered email.";
        }

        public async Task<string> VerifyForgotPasswordOtpAsync(VerifyForgotPasswordOtpDto dto)
        {
            var doctor = await _doctorRepository.GetByEmailAsync(dto.Email);

            if (doctor == null)
                return "Email is not registered.";

            var otpRecord = await _otpRepository
                .GetActiveOtpByEmailAsync(dto.Email, "ForgotPassword");

            if (otpRecord == null)
                return "OTP is invalid or expired.";

            if (otpRecord.AttemptCount >= 5)
                return "Maximum OTP attempts reached.";

            var hashedOtp = HashValue(dto.Otp);

            if (otpRecord.OtpHash != hashedOtp)
            {
                otpRecord.AttemptCount++;

                await _otpRepository.UpdateAsync(otpRecord);
                await _otpRepository.SaveChangesAsync();

                return "Invalid OTP.";
            }

            otpRecord.IsUsed = true;

            await _otpRepository.UpdateAsync(otpRecord);
            await _otpRepository.SaveChangesAsync();

            return "OTP verified successfully.";
        }


        public async Task<string> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var doctor = await _doctorRepository.GetByEmailAsync(dto.Email);

            if (doctor == null)
                return "Email is not registered.";

            var verifiedOtp = await _otpRepository
                .GetLatestUsedOtpByEmailAsync(dto.Email, "ForgotPassword");

            if (verifiedOtp == null)
                return "Please verify OTP first.";

            doctor.PasswordHash = HashValue(dto.NewPassword);

            await _doctorRepository.UpdateAsync(doctor);
            await _doctorRepository.SaveChangesAsync();

            return "Password reset successfully.";
        }



        private static string HashValue(string value)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
            return Convert.ToHexString(bytes);
        }
    }
}