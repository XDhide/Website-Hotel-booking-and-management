using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.Evaluation;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/evaluation")]
    [ApiController]
    public class EvaluationController : ControllerBase
    {
        private readonly IEvaluationRepository _evaluationRepository;

        public EvaluationController(IEvaluationRepository evaluationRepository)
        {
            _evaluationRepository = evaluationRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _evaluationRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Evaluation found.");
            var dtos = result.Data.Select(s => s.ToEvaluationDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _evaluationRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No Evaluation found with id " + id + ".");
            return Ok(model.ToEvaluationDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(string UserId, int RoomInUseId, CreateEvaluationRequestDto dto)
        {
            var model = dto.ToCreateEvaluationModel();
            var created = await _evaluationRepository.CreateAsync(UserId, RoomInUseId, model);
            var resultDto = created.ToEvaluationDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.EvaluationId }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateEvaluationRequestDto dto)
        {
            var updated = await _evaluationRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No Evaluation found with id " + id + ".");
            return Ok(updated.ToEvaluationDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _evaluationRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No Evaluation found with id " + id + ".");
            return Ok(deleted.ToEvaluationDto());
        }
    }
}
