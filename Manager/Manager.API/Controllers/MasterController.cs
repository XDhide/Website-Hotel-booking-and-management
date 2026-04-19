using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.Master;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/master")]
    [ApiController]
    public class MasterController : ControllerBase
    {
        private readonly IMasterRepository _masterRepository;

        public MasterController(IMasterRepository masterRepository)
        {
            _masterRepository = masterRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _masterRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Master found.");
            var dtos = result.Data.Select(s => s.ToMasterDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _masterRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No Master found with id " + id + ".");
            return Ok(model.ToMasterDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(CreateMasterRequestDto dto)
        {
            var model = dto.ToCreateMasterModel();
            var created = await _masterRepository.CreateAsync(model);
            var resultDto = created.ToMasterDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.Id }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateMasterRequestDto dto)
        {
            var updated = await _masterRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No Master found with id " + id + ".");
            return Ok(updated.ToMasterDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _masterRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No Master found with id " + id + ".");
            return Ok(deleted.ToMasterDto());
        }
    }
}
