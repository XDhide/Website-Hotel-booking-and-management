using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.InvoiceDetail;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/invoicedetail")]
    [ApiController]
    public class InvoiceDetailController : ControllerBase
    {
        private readonly IInvoiceDetailRepository _invoiceDetailRepository;

        public InvoiceDetailController(IInvoiceDetailRepository invoiceDetailRepository)
        {
            _invoiceDetailRepository = invoiceDetailRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _invoiceDetailRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No InvoiceDetail found.");
            var dtos = result.Data.Select(s => s.ToInvoiceDetailDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _invoiceDetailRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No InvoiceDetail found with id " + id + ".");
            return Ok(model.ToInvoiceDetailDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(int InvoiceId, CreateInvoiceDetailRequestDto dto)
        {
            var model = dto.ToCreateInvoiceDetailModel();
            var created = await _invoiceDetailRepository.CreateAsync(InvoiceId, model);
            var resultDto = created.ToInvoiceDetailDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.InvoiceDetailId }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateInvoiceDetailRequestDto dto)
        {
            var updated = await _invoiceDetailRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No InvoiceDetail found with id " + id + ".");
            return Ok(updated.ToInvoiceDetailDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _invoiceDetailRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No InvoiceDetail found with id " + id + ".");
            return Ok(deleted.ToInvoiceDetailDto());
        }
    }
}
