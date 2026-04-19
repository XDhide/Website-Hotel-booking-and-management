using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.Surcharge;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/surcharge")]
    [ApiController]
    public class SurchargeController : ControllerBase
    {
        private readonly ISurchargeRepository _surchargeRepository;

        public SurchargeController(ISurchargeRepository surchargeRepository)
        {
            _surchargeRepository = surchargeRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _surchargeRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Surcharge found.");
            var dtos = result.Data.Select(s => s.ToSurchargeDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _surchargeRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No Surcharge found with id " + id + ".");
            return Ok(model.ToSurchargeDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(CreateSurchargeRequestDto dto)
        {
            var model = dto.ToCreateSurchargeModel();
            var created = await _surchargeRepository.CreateAsync(model);
            var resultDto = created.ToSurchargeDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.Id }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateSurchargeRequestDto dto)
        {
            var updated = await _surchargeRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No Surcharge found with id " + id + ".");
            return Ok(updated.ToSurchargeDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _surchargeRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No Surcharge found with id " + id + ".");
            return Ok(deleted.ToSurchargeDto());
        }
    }
}
