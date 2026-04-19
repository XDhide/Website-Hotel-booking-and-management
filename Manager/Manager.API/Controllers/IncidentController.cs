using Manager.API.Dtos.Incident;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/Incident")]
    [ApiController]
    public class IncidentController : ControllerBase
    {
        private readonly IIncidentRepository _incidentRepository;
        public IncidentController(IIncidentRepository incidentRepository)
        {
            _incidentRepository = incidentRepository;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _incidentRepository.GetAllAsync(page, limit);

            var dtos = result.Data
                .Select(i => i.ToIncidentDto())
                .ToList();

            return Ok(new
            {
                result.Page,
                result.Limit,
                result.TotalCount,
                result.TotalPages,
                data = dtos
            });
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetById(int id)
        {
            var incident = await _incidentRepository.GetByIdAsync(id);
            if (incident == null)
                return NotFound($"No incident found with id {id}.");
            return Ok(incident.ToIncidentDto());
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(CreateIncidentDto dto)
        {
            var incident = dto.ToIncident();
            var created = await _incidentRepository.CreateAsync(incident);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToIncidentDto());
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateIncidentDto dto)
        {
            var updated = await _incidentRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound($"No incident found with id {id}.");
            return Ok(updated.ToIncidentDto());
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _incidentRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound($"No incident found with id {id}.");
            return Ok(deleted.ToIncidentDto());
        }
    }
}