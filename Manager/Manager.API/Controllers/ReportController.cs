using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.Report;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/report")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportRepository _reportRepository;

        public ReportController(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _reportRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Report found.");
            var dtos = result.Data.Select(s => s.ToReportDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _reportRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No Report found with id " + id + ".");
            return Ok(model.ToReportDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(string UserId, CreateReportRequestDto dto)
        {
            var model = dto.ToCreateReportModel();
            var created = await _reportRepository.CreateAsync(UserId, model);
            var resultDto = created.ToReportDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.ReportId }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateReportRequestDto dto)
        {
            var updated = await _reportRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No Report found with id " + id + ".");
            return Ok(updated.ToReportDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _reportRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No Report found with id " + id + ".");
            return Ok(deleted.ToReportDto());
        }
    }
}
