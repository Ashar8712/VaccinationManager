using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VaccinationManager.DTOs.Clinic;
using VaccinationManager.Services.Interfaces;

namespace VaccinationManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ClinicController : ControllerBase
    {
        private readonly IClinicService _clinicService;

        public ClinicController(IClinicService clinicService)
        {
            _clinicService = clinicService;
        }

        private int GetDoctorId()
        {
            var doctorIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (doctorIdClaim == null)
                throw new UnauthorizedAccessException();

            return int.Parse(doctorIdClaim.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyClinics()
        {
            var doctorId = GetDoctorId();

            var clinics = await _clinicService
                .GetMyClinicsAsync(doctorId);

            return Ok(clinics);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClinicById(int id)
        {
            var doctorId = GetDoctorId();

            var clinic = await _clinicService
                .GetClinicByIdAsync(id, doctorId);

            if (clinic == null)
                return NotFound(new
                {
                    message = "Clinic not found."
                });

            return Ok(clinic);
        }

        [HttpPost]
        public async Task<IActionResult> CreateClinic(
            CreateClinicDto dto)
        {
            var doctorId = GetDoctorId();

            var result = await _clinicService
                .CreateClinicAsync(doctorId, dto);

           if (result.Contains("End time") ||
            result.Contains("working day") ||
            result.Contains("already exists"))
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
        public async Task<IActionResult> UpdateClinic(
            int id,
            UpdateClinicDto dto)
        {
            var doctorId = GetDoctorId();

            var result = await _clinicService
                .UpdateClinicAsync(id, doctorId, dto);

            if (result.Contains("not found"))
            {
                return NotFound(new
                {
                    message = result
                });
            }

            if (result.Contains("End time") ||
                result.Contains("working day"))
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
        public async Task<IActionResult> DeleteClinic(int id)
        {
            var doctorId = GetDoctorId();

            var result = await _clinicService
                .DeleteClinicAsync(id, doctorId);

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

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> SetClinicStatus(
            int id,
            [FromQuery] bool isActive)
        {
            var doctorId = GetDoctorId();

            var result = await _clinicService
                .SetClinicActiveStatusAsync(
                    id,
                    doctorId,
                    isActive);

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