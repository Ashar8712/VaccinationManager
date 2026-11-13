using VaccinationManager.DTOs.Patient;

namespace VaccinationManager.Services.Interfaces
{
    public interface IPatientService
    {
        Task<List<PatientDto>> GetMyPatientsAsync(int doctorId);

        Task<PatientDto?> GetPatientByIdAsync(
            int patientId,
            int doctorId);

        Task<string> CreatePatientAsync(
            int doctorId,
            CreatePatientDto dto);

        Task<string> UpdatePatientAsync(
            int patientId,
            int doctorId,
            UpdatePatientDto dto);

        Task<string> DeletePatientAsync(
            int patientId,
            int doctorId);
    }
}