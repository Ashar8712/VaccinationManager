namespace VaccinationManager.DTOs.Patient
{
    public class PatientDto
    {
        public int Id { get; set; }

        public string PatientName { get; set; } = string.Empty;

        public string FatherGuardianName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        public string FatherCnic { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}