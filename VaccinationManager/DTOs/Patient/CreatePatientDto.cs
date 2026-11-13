using System.ComponentModel.DataAnnotations;

namespace VaccinationManager.DTOs.Patient
{
    public class CreatePatientDto
    {
        [Required]
        [MaxLength(100)]
        public string PatientName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FatherGuardianName { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        [RegularExpression(
            @"^\d{5}-?\d{7}-?\d$",
            ErrorMessage = "Father CNIC must be a valid 13-digit CNIC.")]
        public string FatherCnic { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [RegularExpression(
            @"^(\+92|0)?3\d{9}$",
            ErrorMessage = "Phone number must be a valid Pakistani mobile number.")]
        public string PhoneNumber { get; set; } = string.Empty;
    }
}