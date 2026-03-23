using Manager.API.Dtos.Invoice;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/Invoice")]
    [ApiController]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceRepository _invoiceRepository;
        public InvoiceController(IInvoiceRepository invoiceRepository)
        {
            _invoiceRepository = invoiceRepository;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAll()
        {
            var invoices = await _invoiceRepository.GetAllAsync();
            if (invoices == null || invoices.Count == 0)
                return NotFound("No invoices found.");
            var dtos = invoices.Select(i => i.ToInvoiceDto());
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetById(int id)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(id);
            if (invoice == null)
                return NotFound($"No invoice found with id {id}.");
            return Ok(invoice.ToInvoiceDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(CreateInvoiceDto dto)
        {
            var invoice = dto.ToInvoice();
            var created = await _invoiceRepository.CreateAsync(invoice);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToInvoiceDto());
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateInvoiceDto dto)
        {
            var updated = await _invoiceRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound($"No invoice found with id {id}.");
            return Ok(updated.ToInvoiceDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _invoiceRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound($"No invoice found with id {id}.");
            return Ok(deleted.ToInvoiceDto());
        }
    }
}