using System.ComponentModel.DataAnnotations;

namespace VaccinationManager.DTOs.Auth
{
    public class LoginDoctorDto
    {
        [Required]
        [MaxLength(10)]
        public string CountryCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}