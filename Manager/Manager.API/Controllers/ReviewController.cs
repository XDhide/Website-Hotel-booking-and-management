using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Manager.API.Dtos.Evaluation;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{

    [Route("api/Review")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IEvaluationRepository _evaluationRepository;

        public ReviewController(IEvaluationRepository evaluationRepository)
        {
            _evaluationRepository = evaluationRepository;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1, [FromQuery] int limit = 50)
        {
            var result = await _evaluationRepository.GetAllAsync(page, limit);

            if (result.Data == null || result.Data.Count == 0)
                return Ok(new { data = new object[0] });

            var dtos = result.Data.Select(e => e.ToEvaluationDto()).ToList();

            return Ok(new
            {
                result.Page,
                result.Limit,
                result.TotalCount,
                result.TotalPages,
                data = dtos,
            });
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _evaluationRepository.GetByIdAsync(id);

            if (model == null)
                return NotFound($"Review {id} không tìm thấy.");

            return Ok(model.ToEvaluationDto());
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateEvaluationRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
            if (dto.RoomUseId <= 0)
                return BadRequest("RoomUseId không hợp lệ.");

            dto.UserId = userId;

            var model = dto.ToCreateEvaluationModel();

            try
            {

                var created = await _evaluationRepository.CreateAsync(userId, dto.RoomUseId, model);
                var result = created.ToEvaluationDto();

                return CreatedAtAction(nameof(GetById), new { id = result.EvaluationId }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(
            int id, [FromBody] UpdateEvaluationRequestDto dto)
        {
            var updated = await _evaluationRepository.UpdateAsync(id, dto);

            if (updated == null)
                return NotFound($"Review {id} không tìm thấy.");

            return Ok(updated.ToEvaluationDto());
        }


        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _evaluationRepository.DeleteAsync(id);

            if (deleted == null)
                return NotFound($"Review {id} không tìm thấy.");

            return Ok(deleted.ToEvaluationDto());
        }
    }
}
