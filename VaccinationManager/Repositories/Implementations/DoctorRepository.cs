using Microsoft.EntityFrameworkCore;
using VaccinationManager.Data;
using VaccinationManager.Models;
using VaccinationManager.Repositories.Interfaces;

namespace VaccinationManager.Repositories.Implementations
{
    public class DoctorRepository : IDoctorRepository
    {
        private readonly ApplicationDbContext _context;

        public DoctorRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Doctor?> GetByEmailAsync(string email)
        {
            return await _context.Doctors
                .FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<Doctor?> GetByPhoneAsync(string countryCode, string phoneNumber)
        {
            return await _context.Doctors
                .FirstOrDefaultAsync(x =>
                    x.CountryCode == countryCode &&
                    x.PhoneNumber == phoneNumber);
        }

        public async Task<Doctor?> GetByPMDCNumberAsync(string pmdcNumber)
        {
            return await _context.Doctors
                .FirstOrDefaultAsync(x => x.PMDCNumber == pmdcNumber);
        }

        public async Task<Doctor?> GetByIdAsync(int id)
        {
            return await _context.Doctors
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task AddAsync(Doctor doctor)
        {
            await _context.Doctors.AddAsync(doctor);
        }

        public Task UpdateAsync(Doctor doctor)
        {
            _context.Doctors.Update(doctor);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}