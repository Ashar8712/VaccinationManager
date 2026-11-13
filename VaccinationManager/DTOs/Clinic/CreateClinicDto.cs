using System.ComponentModel.DataAnnotations;

namespace VaccinationManager.DTOs.Clinic
{
    public class CreateClinicDto
    {
        [Required]
        [MaxLength(150)]
        public string ClinicName { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^\+?[0-9]{7,15}$",
    ErrorMessage = "Enter a valid phone number.")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string FullAddress { get; set; } = string.Empty;

        [Range(0, 1000000)]
        public decimal ConsultationFee { get; set; }

        [Range(0, 10000)]
        public int TotalBeds { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required]
        public List<string> WorkingDays { get; set; } = new();

        public bool IsActive { get; set; } = true;
    }
}