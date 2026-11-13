using Microsoft.EntityFrameworkCore;
using VaccinationManager.Data;
using VaccinationManager.Models;
using VaccinationManager.Repositories.Interfaces;

namespace VaccinationManager.Repositories.Implementations
{
    public class OtpRepository : IOtpRepository
    {
        private readonly ApplicationDbContext _context;

        public OtpRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<OtpVerification?> GetActiveOtpByEmailAsync(
    string email,
    string purpose)
        {
            return await _context.OtpVerifications
                .Where(x =>
                    x.Email == email &&
                    x.Purpose == purpose &&
                    !x.IsUsed &&
                    x.ExpiryTime > DateTime.UtcNow)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<OtpVerification?> GetLatestUsedOtpByEmailAsync(string email,string purpose)
        {
            return await _context.OtpVerifications
                .Where(x =>
                    x.Email == email &&
                    x.Purpose == purpose &&
                    x.IsUsed)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task AddAsync(OtpVerification otpVerification)
        {
            await _context.OtpVerifications.AddAsync(otpVerification);
        }

        public Task UpdateAsync(OtpVerification otpVerification)
        {
            _context.OtpVerifications.Update(otpVerification);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}