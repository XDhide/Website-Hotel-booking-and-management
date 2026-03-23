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
        public async Task<IActionResult> GetAll()
        {
            var discounts = await _discountRepository.GetAllAsync();
            if (discounts == null || discounts.Count == 0)
            {
                return NotFound("No discounts found.");
            }
            var discountDtos = discounts.Select(s => s.ToDiscountDto());
            return Ok(discounts);
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
