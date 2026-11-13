using VaccinationManager.DTOs.Patient;
using VaccinationManager.Models;
using VaccinationManager.Repositories.Interfaces;
using VaccinationManager.Services.Interfaces;

namespace VaccinationManager.Services.Implementations
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;

        public PatientService(IPatientRepository patientRepository)
        {
            _patientRepository = patientRepository;
        }

        public async Task<List<PatientDto>> GetMyPatientsAsync(int doctorId)
        {
            var patients = await _patientRepository
                .GetAllByDoctorIdAsync(doctorId);

            return patients.Select(MapToDto).ToList();
        }

        public async Task<PatientDto?> GetPatientByIdAsync(
            int patientId,
            int doctorId)
        {
            var patient = await _patientRepository
                .GetByIdAsync(patientId, doctorId);

            if (patient == null)
                return null;

            return MapToDto(patient);
        }

        public async Task<string> CreatePatientAsync(
            int doctorId,
            CreatePatientDto dto)
        {
            if (dto.DateOfBirth.Date > DateTime.UtcNow.Date)
                return "Date of birth cannot be in the future.";

            var patient = new Patient
            {
                DoctorId = doctorId,
                PatientName = dto.PatientName.Trim(),
                FatherGuardianName = dto.FatherGuardianName.Trim(),
                DateOfBirth = dto.DateOfBirth,
                FatherCnic = dto.FatherCnic.Trim(),
                City = dto.City.Trim(),
                PhoneNumber = dto.PhoneNumber.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            await _patientRepository.AddAsync(patient);
            await _patientRepository.SaveChangesAsync();

            return "Patient added successfully.";
        }

        public async Task<string> UpdatePatientAsync(
            int patientId,
            int doctorId,
            UpdatePatientDto dto)
        {
            var patient = await _patientRepository
                .GetByIdAsync(patientId, doctorId);

            if (patient == null)
                return "Patient not found.";

            if (dto.DateOfBirth.Date > DateTime.UtcNow.Date)
                return "Date of birth cannot be in the future.";

            patient.PatientName = dto.PatientName.Trim();
            patient.FatherGuardianName =
                dto.FatherGuardianName.Trim();
            patient.DateOfBirth = dto.DateOfBirth;
            patient.FatherCnic = dto.FatherCnic.Trim();
            patient.City = dto.City.Trim();
            patient.PhoneNumber = dto.PhoneNumber.Trim();

            await _patientRepository.UpdateAsync(patient);
            await _patientRepository.SaveChangesAsync();

            return "Patient updated successfully.";
        }

        public async Task<string> DeletePatientAsync(
            int patientId,
            int doctorId)
        {
            var patient = await _patientRepository
                .GetByIdAsync(patientId, doctorId);

            if (patient == null)
                return "Patient not found.";

            await _patientRepository.DeleteAsync(patient);
            await _patientRepository.SaveChangesAsync();

            return "Patient deleted successfully.";
        }

        private static PatientDto MapToDto(Patient patient)
        {
            return new PatientDto
            {
                Id = patient.Id,
                PatientName = patient.PatientName,
                FatherGuardianName = patient.FatherGuardianName,
                DateOfBirth = patient.DateOfBirth,
                FatherCnic = patient.FatherCnic,
                City = patient.City,
                PhoneNumber = patient.PhoneNumber,
                CreatedAt = patient.CreatedAt
            };
        }
    }
}