using Microsoft.EntityFrameworkCore;
using VaccinationManager.Data;
using VaccinationManager.Models;
using VaccinationManager.Repositories.Interfaces;

namespace VaccinationManager.Repositories.Implementations
{
    public class ClinicRepository : IClinicRepository
    {
        private readonly ApplicationDbContext _context;

        public ClinicRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Clinic>> GetByDoctorIdAsync(int doctorId)
        {
            return await _context.Clinics
                .Where(x => x.DoctorId == doctorId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<Clinic?> GetByIdAsync(int clinicId, int doctorId)
        {
            return await _context.Clinics
                .FirstOrDefaultAsync(x =>
                    x.Id == clinicId &&
                    x.DoctorId == doctorId);
        }

        public async Task<Clinic?> GetActiveClinicAsync(int doctorId)
        {
            return await _context.Clinics
                .FirstOrDefaultAsync(x =>
                    x.DoctorId == doctorId &&
                    x.IsActive);
        }

        public async Task<Clinic?> GetByNameAsync(
    int doctorId,
    string clinicName)
        {
            return await _context.Clinics
                .FirstOrDefaultAsync(x =>
                    x.DoctorId == doctorId &&
                    x.ClinicName == clinicName);
        }

       

        public async Task AddAsync(Clinic clinic)
        {
            await _context.Clinics.AddAsync(clinic);
        }

        public Task UpdateAsync(Clinic clinic)
        {
            _context.Clinics.Update(clinic);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Clinic clinic)
        {
            _context.Clinics.Remove(clinic);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}