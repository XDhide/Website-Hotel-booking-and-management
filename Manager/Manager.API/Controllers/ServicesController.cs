using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.Services;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/services")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly IServicesRepository _servicesRepository;

        public ServicesController(IServicesRepository servicesRepository)
        {
            _servicesRepository = servicesRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _servicesRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Services found.");
            var dtos = result.Data.Select(s => s.ToServicesDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _servicesRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No Services found with id " + id + ".");
            return Ok(model.ToServicesDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(CreateServicesRequestDto dto)
        {
            var model = dto.ToCreateServicesModel();
            var created = await _servicesRepository.CreateAsync(model);
            var resultDto = created.ToServicesDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.Id }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateServicesRequestDto dto)
        {
            var updated = await _servicesRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No Services found with id " + id + ".");
            return Ok(updated.ToServicesDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _servicesRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No Services found with id " + id + ".");
            return Ok(deleted.ToServicesDto());
        }
    }
}
