using VaccinationManager.Models;

namespace VaccinationManager.Repositories.Interfaces
{
    public interface IOtpRepository
    {
        Task<OtpVerification?> GetActiveOtpByEmailAsync(string email,string purpose);

        Task<OtpVerification?> GetLatestUsedOtpByEmailAsync( string email,string purpose);

        Task AddAsync(OtpVerification otpVerification);

        Task UpdateAsync(OtpVerification otpVerification);

        Task SaveChangesAsync();
    }
}