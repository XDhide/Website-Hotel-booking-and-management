using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.Invoice;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/invoice")]
    [ApiController]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceRepository _invoiceRepository;

        public InvoiceController(IInvoiceRepository invoiceRepository)
        {
            _invoiceRepository = invoiceRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _invoiceRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Invoice found.");
            var dtos = result.Data.Select(s => s.ToInvoiceDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _invoiceRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No Invoice found with id " + id + ".");
            return Ok(model.ToInvoiceDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(string UserId, int RoomInUseId, CreateInvoiceRequestDto dto)
        {
            var model = dto.ToCreateInvoiceModel();
            var created = await _invoiceRepository.CreateAsync(UserId, RoomInUseId, model);
            var resultDto = created.ToInvoiceDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.InvoiceId }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateInvoiceRequestDto dto)
        {
            var updated = await _invoiceRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No Invoice found with id " + id + ".");
            return Ok(updated.ToInvoiceDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _invoiceRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No Invoice found with id " + id + ".");
            return Ok(deleted.ToInvoiceDto());
        }
    }
}
