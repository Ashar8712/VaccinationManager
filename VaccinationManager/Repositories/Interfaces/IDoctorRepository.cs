using VaccinationManager.Models;

namespace VaccinationManager.Repositories.Interfaces
{
    public interface IDoctorRepository
    {
        Task<Doctor?> GetByEmailAsync(string email);

        Task<Doctor?> GetByPhoneAsync(string countryCode, string phoneNumber);

        Task<Doctor?> GetByPMDCNumberAsync(string pmdcNumber);

        Task<Doctor?> GetByIdAsync(int id);

        Task AddAsync(Doctor doctor);

        Task UpdateAsync(Doctor doctor);

        Task SaveChangesAsync();
    }
}