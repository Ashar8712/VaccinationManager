using VaccinationManager.DTOs.Clinic;
using VaccinationManager.Models;
using VaccinationManager.Repositories.Interfaces;
using VaccinationManager.Services.Interfaces;

namespace VaccinationManager.Services.Implementations
{
    public class ClinicService : IClinicService
    {
    private readonly IClinicRepository _clinicRepository;

        private static readonly HashSet<string> ValidWorkingDays =
    new(StringComparer.OrdinalIgnoreCase)
    {
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    };
        public ClinicService(IClinicRepository clinicRepository)
        {
            _clinicRepository = clinicRepository;
        }

        public async Task<List<ClinicDto>> GetMyClinicsAsync(int doctorId)
        {
            var clinics = await _clinicRepository
                .GetByDoctorIdAsync(doctorId);

            return clinics.Select(MapToDto).ToList();
        }

        public async Task<ClinicDto?> GetClinicByIdAsync(
            int clinicId,
            int doctorId)
        {
            var clinic = await _clinicRepository
                .GetByIdAsync(clinicId, doctorId);

            if (clinic == null)
                return null;

            return MapToDto(clinic);
        }

        public async Task<string> CreateClinicAsync(
            int doctorId,
            CreateClinicDto dto)
        {
            if (dto.EndTime <= dto.StartTime)
                return "End time must be greater than start time.";

            if (dto.WorkingDays == null || !dto.WorkingDays.Any())
                return "Please select at least one working day.";

            if (dto.WorkingDays.Any(day => !ValidWorkingDays.Contains(day)))
                return "Invalid working day selected.";

            var existingName = await _clinicRepository
    .GetByNameAsync(doctorId, dto.ClinicName);

            if (existingName != null)
                return "Clinic name already exists.";

            

            if (dto.IsActive)
            {
                var activeClinic = await _clinicRepository
                    .GetActiveClinicAsync(doctorId);

                if (activeClinic != null)
                {
                    activeClinic.IsActive = false;

                    await _clinicRepository
                        .UpdateAsync(activeClinic);
                }
            }

            var clinic = new Clinic
            {
                DoctorId = doctorId,
                ClinicName = dto.ClinicName,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                City = dto.City,
                FullAddress = dto.FullAddress,
                ConsultationFee = dto.ConsultationFee,
                TotalBeds = dto.TotalBeds,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                WorkingDays = string.Join(",", dto.WorkingDays),
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            await _clinicRepository.AddAsync(clinic);
            await _clinicRepository.SaveChangesAsync();

            return "Clinic added successfully.";
        }

        public async Task<string> UpdateClinicAsync(
            int clinicId,
            int doctorId,
            UpdateClinicDto dto)
        {
            var clinic = await _clinicRepository
                .GetByIdAsync(clinicId, doctorId);

            if (clinic == null)
                return "Clinic not found.";

            if (dto.EndTime <= dto.StartTime)
                return "End time must be greater than start time.";

            if (dto.WorkingDays == null || !dto.WorkingDays.Any())
                return "Please select at least one working day.";

            if (dto.WorkingDays.Any(day => !ValidWorkingDays.Contains(day)))
                return "Invalid working day selected.";

            if (dto.IsActive && !clinic.IsActive)
            {
                var activeClinic = await _clinicRepository
                    .GetActiveClinicAsync(doctorId);

                if (activeClinic != null &&
                    activeClinic.Id != clinicId)
                {
                    activeClinic.IsActive = false;

                    await _clinicRepository
                        .UpdateAsync(activeClinic);
                }
            }

            clinic.ClinicName = dto.ClinicName;
            clinic.PhoneNumber = dto.PhoneNumber;
            clinic.Email = dto.Email;
            clinic.City = dto.City;
            clinic.FullAddress = dto.FullAddress;
            clinic.ConsultationFee = dto.ConsultationFee;
            clinic.TotalBeds = dto.TotalBeds;
            clinic.StartTime = dto.StartTime;
            clinic.EndTime = dto.EndTime;
            clinic.WorkingDays =
                string.Join(",", dto.WorkingDays);
            clinic.IsActive = dto.IsActive;

            await _clinicRepository.UpdateAsync(clinic);
            await _clinicRepository.SaveChangesAsync();

            return "Clinic updated successfully.";
        }

        public async Task<string> DeleteClinicAsync(
            int clinicId,
            int doctorId)
        {
            var clinic = await _clinicRepository
                .GetByIdAsync(clinicId, doctorId);

            if (clinic == null)
                return "Clinic not found.";

            await _clinicRepository.DeleteAsync(clinic);
            await _clinicRepository.SaveChangesAsync();

            return "Clinic deleted successfully.";
        }

        public async Task<string> SetClinicActiveStatusAsync(
            int clinicId,
            int doctorId,
            bool isActive)
        {
            var clinic = await _clinicRepository
                .GetByIdAsync(clinicId, doctorId);

            if (clinic == null)
                return "Clinic not found.";

            if (isActive)
            {
                var activeClinic = await _clinicRepository
                    .GetActiveClinicAsync(doctorId);

                if (activeClinic != null &&
                    activeClinic.Id != clinicId)
                {
                    activeClinic.IsActive = false;

                    await _clinicRepository
                        .UpdateAsync(activeClinic);
                }
            }

            clinic.IsActive = isActive;

            await _clinicRepository.UpdateAsync(clinic);
            await _clinicRepository.SaveChangesAsync();

            return isActive
                ? "Clinic activated successfully."
                : "Clinic deactivated successfully.";
        }

        private static ClinicDto MapToDto(Clinic clinic)
        {
            return new ClinicDto
            {
                Id = clinic.Id,
                ClinicName = clinic.ClinicName,
                PhoneNumber = clinic.PhoneNumber,
                Email = clinic.Email,
                City = clinic.City,
                FullAddress = clinic.FullAddress,
                ConsultationFee = clinic.ConsultationFee,
                TotalBeds = clinic.TotalBeds,
                StartTime = clinic.StartTime,
                EndTime = clinic.EndTime,

                WorkingDays = string.IsNullOrWhiteSpace(
                    clinic.WorkingDays)
                    ? new List<string>()
                    : clinic.WorkingDays
                        .Split(',')
                        .ToList(),

                IsActive = clinic.IsActive
            };
        }
    }
}