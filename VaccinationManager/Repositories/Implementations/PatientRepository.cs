using Microsoft.EntityFrameworkCore;
using System;
using VaccinationManager.Data;
using VaccinationManager.Models;
using VaccinationManager.Repositories.Interfaces;

namespace VaccinationManager.Repositories.Implementations
{
    public class PatientRepository : IPatientRepository
    {
        private readonly ApplicationDbContext _context;

        public PatientRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Patient>> GetAllByDoctorIdAsync(int doctorId)
        {
            return await _context.Patients
                .Where(p => p.DoctorId == doctorId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Patient?> GetByIdAsync(int id, int doctorId)
        {
            return await _context.Patients
                .FirstOrDefaultAsync(p =>
                    p.Id == id &&
                    p.DoctorId == doctorId);
        }

        public async Task AddAsync(Patient patient)
        {
            await _context.Patients.AddAsync(patient);
        }

        public Task UpdateAsync(Patient patient)
        {
            _context.Patients.Update(patient);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Patient patient)
        {
            _context.Patients.Remove(patient);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}