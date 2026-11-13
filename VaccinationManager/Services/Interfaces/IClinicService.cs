using VaccinationManager.DTOs.Clinic;

namespace VaccinationManager.Services.Interfaces
{
    public interface IClinicService
    {
        Task<List<ClinicDto>> GetMyClinicsAsync(int doctorId);

        Task<ClinicDto?> GetClinicByIdAsync(
            int clinicId,
            int doctorId);

        Task<string> CreateClinicAsync(
            int doctorId,
            CreateClinicDto dto);

        Task<string> UpdateClinicAsync(
            int clinicId,
            int doctorId,
            UpdateClinicDto dto);

        Task<string> DeleteClinicAsync(
            int clinicId,
            int doctorId);

        Task<string> SetClinicActiveStatusAsync(
            int clinicId,
            int doctorId,
            bool isActive);
    }
}