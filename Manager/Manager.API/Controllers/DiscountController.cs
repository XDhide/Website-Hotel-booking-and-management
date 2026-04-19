using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.Discount;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/discount")]
    [ApiController]
    public class DiscountController : ControllerBase
    {
        private readonly IDiscountRepository _discountRepository;

        public DiscountController(IDiscountRepository discountRepository)
        {
            _discountRepository = discountRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _discountRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Discount found.");
            var dtos = result.Data.Select(s => s.ToDiscountDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _discountRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No Discount found with id " + id + ".");
            return Ok(model.ToDiscountDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(CreateDiscountRequestDto dto)
        {
            var model = dto.ToCreateDiscountModel();
            var created = await _discountRepository.CreateAsync(model);
            var resultDto = created.ToDiscountDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.DiscountId }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateDiscountRequestDto dto)
        {
            var updated = await _discountRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No Discount found with id " + id + ".");
            return Ok(updated.ToDiscountDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _discountRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No Discount found with id " + id + ".");
            return Ok(deleted.ToDiscountDto());
        }
    }
}
