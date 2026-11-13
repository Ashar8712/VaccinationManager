namespace VaccinationManager.DTOs.Clinic
{
    public class ClinicDto
    {
        public int Id { get; set; }

        public string ClinicName { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string FullAddress { get; set; } = string.Empty;

        public decimal ConsultationFee { get; set; }

        public int TotalBeds { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public List<string> WorkingDays { get; set; } = new();

        public bool IsActive { get; set; }
    }
}