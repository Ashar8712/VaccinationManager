using VaccinationManager.Models;

namespace VaccinationManager.Services.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(Doctor doctor);
    }
}