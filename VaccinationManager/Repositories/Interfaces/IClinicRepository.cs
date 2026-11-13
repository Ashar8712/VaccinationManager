using VaccinationManager.Models;

namespace VaccinationManager.Repositories.Interfaces
{
    public interface IClinicRepository
    {
        Task<List<Clinic>> GetByDoctorIdAsync(int doctorId);

        Task<Clinic?> GetByIdAsync(int clinicId, int doctorId);

        Task<Clinic?> GetActiveClinicAsync(int doctorId);

        Task<Clinic?> GetByNameAsync(int doctorId, string clinicName);

       

        Task AddAsync(Clinic clinic);

        Task UpdateAsync(Clinic clinic);

        Task DeleteAsync(Clinic clinic);

        Task SaveChangesAsync();
    }
}