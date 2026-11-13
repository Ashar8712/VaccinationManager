using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VaccinationManager.DTOs.Patient;
using VaccinationManager.Services.Interfaces;

namespace VaccinationManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        private int GetDoctorId()
        {
            var doctorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (doctorIdClaim == null)
                throw new UnauthorizedAccessException();

            return int.Parse(doctorIdClaim.Value);
        }

       
        [HttpGet]
        public async Task<IActionResult> GetMyPatients()
        {
            var doctorId = GetDoctorId();

            var patients = await _patientService
                .GetMyPatientsAsync(doctorId);

            return Ok(patients);
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPatientById(int id)
        {
            var doctorId = GetDoctorId();

            var patient = await _patientService
                .GetPatientByIdAsync(id, doctorId);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found."
                });
            }

            return Ok(patient);
        }

        
        [HttpPost]
        public async Task<IActionResult> CreatePatient(
            CreatePatientDto dto)
        {
            var doctorId = GetDoctorId();

            var result = await _patientService
                .CreatePatientAsync(doctorId, dto);

            if (result.Contains("cannot be in the future"))
            {
                return BadRequest(new
                {
                    message = result
                });
            }

            return Ok(new
            {
                message = result
            });
        }

       
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(
            int id,
            UpdatePatientDto dto)
        {
            var doctorId = GetDoctorId();

            var result = await _patientService
                .UpdatePatientAsync(id, doctorId, dto);

            if (result.Contains("not found"))
            {
                return NotFound(new
                {
                    message = result
                });
            }

            if (result.Contains("cannot be in the future"))
            {
                return BadRequest(new
                {
                    message = result
                });
            }

            return Ok(new
            {
                message = result
            });
        }

        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var doctorId = GetDoctorId();

            var result = await _patientService
                .DeletePatientAsync(id, doctorId);

            if (result.Contains("not found"))
            {
                return NotFound(new
                {
                    message = result
                });
            }

            return Ok(new
            {
                message = result
            });
        }
    }
}