using VaccinationManager.Models;

namespace VaccinationManager.Repositories.Interfaces
{
    public interface IPatientRepository
    {
        Task<List<Patient>> GetAllByDoctorIdAsync(int doctorId);

        Task<Patient?> GetByIdAsync(int id, int doctorId);

        Task AddAsync(Patient patient);

        Task UpdateAsync(Patient patient);

        Task DeleteAsync(Patient patient);

        Task SaveChangesAsync();
    }
}