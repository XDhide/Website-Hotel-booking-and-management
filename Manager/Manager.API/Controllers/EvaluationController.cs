using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Evaluation;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Manager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Controllers
{
    [Route("api/evaluation")]
    [ApiController]
    public class EvaluationController : ControllerBase
    {
        private readonly IEvaluationRepository _evaluationRepository;
        private readonly ApplicationDBContext _db;

        public EvaluationController(IEvaluationRepository evaluationRepository, ApplicationDBContext db)
        {
            _evaluationRepository = evaluationRepository;
            _db = db;
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

        /// <summary>
        /// Lay danh sach danh gia cua user hien tai (dung JWT)
        /// </summary>
        [HttpGet("my-evaluations")]
        [Authorize]
        public async Task<IActionResult> GetMyEvaluations()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var evaluations = await _db.Evaluations
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            var dtos = evaluations.Select(e => e.ToEvaluationDto()).ToList();
            return Ok(dtos);
        }

        /// <summary>
        /// User tu gui danh gia phong sau khi thanh toan xong (Invoice Paid)
        /// </summary>
        [HttpPost("user-submit")]
        [Authorize]
        public async Task<IActionResult> UserSubmitEvaluation([FromBody] UserSubmitEvaluationDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Kiem tra RoomInUse co thuoc ve user khong
            var roomInUse = await _db.RoomInUses
                .Include(r => r.Booking)
                .FirstOrDefaultAsync(r => r.RoomUseId == dto.RoomUseId);

            if (roomInUse == null)
                return NotFound("Khong tim thay thong tin phong.");

            if (roomInUse.Booking?.UserId != userId)
                return Forbid("Ban khong co quyen danh gia phong nay.");

            // Kiem tra invoice da Paid chua
            var hasPaidInvoice = await _db.Invoices
                .AnyAsync(i => i.RoomUseId == dto.RoomUseId && i.PaymentStatus == "Paid");

            if (!hasPaidInvoice)
                return BadRequest("Chi co the danh gia sau khi hoa don da duoc thanh toan.");

            // Kiem tra da danh gia chua
            var alreadyRated = await _db.Evaluations
                .AnyAsync(e => e.UserId == userId && e.RoomUseId == dto.RoomUseId);

            if (alreadyRated)
                return BadRequest("Ban da danh gia phong nay roi.");

            var evaluation = new Evaluation
            {
                UserId    = userId,
                RoomUseId = dto.RoomUseId,
                Rating    = dto.Rating,
                Comment   = dto.Comment?.Trim(),
                CreatedAt = System.DateTime.Now,
            };

            await _db.Evaluations.AddAsync(evaluation);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = evaluation.EvaluationId }, evaluation.ToEvaluationDto());
        }

        /// <summary>
        /// Admin/Manager tao danh gia thay user
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] CreateEvaluationRequestDto dto)
        {
            var model = dto.ToCreateEvaluationModel();
            var created = await _evaluationRepository.CreateAsync(dto.UserId, dto.RoomUseId, model);
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
