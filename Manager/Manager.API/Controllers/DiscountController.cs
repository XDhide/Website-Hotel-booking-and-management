using Manager.API.Dtos.Discount;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/Discount")]
    [ApiController]
    public class DiscountController : ControllerBase
    {
        private readonly IDiscountRepository _discountRepository;

        public DiscountController(IDiscountRepository discountRepository)
        {
            _discountRepository = discountRepository;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _discountRepository.GetAllAsync(page, limit);

            var discountDtos = result.Data
                .Select(s => s.ToDiscountDto())
                .ToList();

            return Ok(new
            {
                result.Page,
                result.Limit,
                result.TotalCount,
                result.TotalPages,
                data = discountDtos
            });
        }

        [HttpGet]
        [Route("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetById(int id)
        {
            var discount = await _discountRepository.GetByIdAsync(id);
            if (discount == null)
            {
                return NotFound($"No discount found with id {id}.");
            }
            var discountDto = discount.ToDiscountDto();
            return Ok(discountDto);
        }
        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateDiscountRequetsDto createDiscountRequestDto)
        {
            var discountModel = createDiscountRequestDto.ToDiscount();
            var createdDiscount = await _discountRepository.CreateAsync(discountModel);
            var discountDto = createdDiscount.ToDiscountDto();
            return CreatedAtAction(nameof(GetById), new { id = discountDto.Id }, discountDto);
        }
        [Authorize(Roles = "Admin,Manager")]
        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Update(int id, UpdateDiscountRequetsDto updateDiscountRequestDto)
        {
            var updatedDiscount = await _discountRepository.UpdateAsync(id, updateDiscountRequestDto);
            if (updatedDiscount == null)
            {
                return NotFound($"No discount found with id {id}.");
            }
            var discountDto = updatedDiscount.ToDiscountDto();
            return Ok(discountDto);

        }
        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deletedDiscount = await _discountRepository.DeleteAsync(id);
            if (deletedDiscount == null)
            {
                return NotFound($"No discount found with id {id}.");
            }
            var discountDto = deletedDiscount.ToDiscountDto();
            return Ok(discountDto);
        }
    }
}
