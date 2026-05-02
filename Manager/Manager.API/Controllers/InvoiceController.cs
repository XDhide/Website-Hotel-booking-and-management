using System;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Invoice;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Controllers
{
    [Route("api/invoice")]
    [ApiController]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly ApplicationDBContext _db;

        public InvoiceController(IInvoiceRepository invoiceRepository, ApplicationDBContext db)
        {
            _invoiceRepository = invoiceRepository;
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _invoiceRepository.GetAllAsync(page, limit);
            var dtos = result.Data?.Select(s => s.ToInvoiceDto()).ToList() ?? new System.Collections.Generic.List<InvoiceDto>();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _invoiceRepository.GetByIdAsync(id);
            if (model == null) return NotFound("No Invoice found with id " + id + ".");
            return Ok(model.ToInvoiceDto());
        }

        /// <summary>Chi tiết hóa đơn kèm InvoiceDetails</summary>
        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetWithDetails(int id)
        {
            var invoice = await _db.Invoices
                .Include(i => i.InvoiceDetails)
                .Include(i => i.RoomInUse).ThenInclude(r => r.Rooms)
                .Include(i => i.RoomInUse).ThenInclude(r => r.Booking).ThenInclude(b => b.RoomType)
                .FirstOrDefaultAsync(i => i.InvoiceId == id);

            if (invoice == null) return NotFound("Invoice not found.");

            return Ok(new {
                invoice.InvoiceId, invoice.RoomUseId, invoice.UserId,
                invoice.SubTotal, invoice.DiscountAmount, invoice.SurchargeAmount,
                invoice.FinalAmount, invoice.PaymentStatus, invoice.PaymentMethod,
                invoice.Note, invoice.CreatedAt, invoice.UpdatedAt, invoice.PaidAt,
                RoomNumber = invoice.RoomInUse?.Rooms?.RoomNumber,
                RoomTypeName = invoice.RoomInUse?.Booking?.RoomType?.Name,
                BookingId = invoice.RoomInUse?.BookingId,
                Deposit = invoice.RoomInUse?.Booking?.Deposit ?? 0,
                InvoiceDetails = invoice.InvoiceDetails?.Select(d => new {
                    d.InvoiceDetailId, d.ItemType, d.ItemId, d.ItemName,
                    d.UnitPrice, d.Quantity, d.TotalPrice, d.CreatedAt,
                })
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] CreateInvoiceRequestDto dto)
        {
            var model = dto.ToCreateInvoiceModel();
            var created = await _invoiceRepository.CreateAsync(dto.UserId, dto.RoomUseId, model);
            return CreatedAtAction(nameof(GetById), new { id = created.InvoiceId }, created.ToInvoiceDto());
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateInvoiceRequestDto dto)
        {
            var updated = await _invoiceRepository.UpdateAsync(id, dto);
            if (updated == null) return NotFound("No Invoice found with id " + id + ".");
            return Ok(updated.ToInvoiceDto());
        }

        /// <summary>
        /// Thanh toán: tính tổng từ InvoiceDetails, trừ deposit,
        /// chỉ cập nhật trạng thái = Paid. KHÔNG checkout phòng.
        /// </summary>
        [HttpPost("{id}/pay")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Pay(int id, [FromBody] PayInvoiceDto dto)
        {
            var invoice = await _db.Invoices
                .Include(i => i.InvoiceDetails)
                .Include(i => i.RoomInUse).ThenInclude(r => r.Booking)
                .FirstOrDefaultAsync(i => i.InvoiceId == id);

            if (invoice == null) return NotFound("Invoice not found.");
            if (invoice.PaymentStatus == "Paid") return BadRequest("Hóa đơn này đã được thanh toán.");

            double subTotal = invoice.InvoiceDetails?.Sum(d => d.TotalPrice ?? 0) ?? 0;
            double deposit  = invoice.RoomInUse?.Booking?.Deposit ?? 0;
            double discount = dto.DiscountAmount ?? invoice.DiscountAmount ?? 0;
            double surcharge = dto.SurchargeAmount ?? invoice.SurchargeAmount ?? 0;
            double finalAmount = Math.Max(0, subTotal - deposit - discount + surcharge);

            invoice.SubTotal = subTotal;
            invoice.DiscountAmount = discount;
            invoice.SurchargeAmount = surcharge;
            invoice.FinalAmount = finalAmount;
            invoice.PaymentStatus = "Paid";
            invoice.PaymentMethod = dto.PaymentMethod ?? "Cash";
            invoice.PaidAt = DateTime.Now;
            invoice.Note = dto.Note ?? invoice.Note;
            invoice.UpdatedAt = DateTime.Now;

            await _db.SaveChangesAsync();

            return Ok(new {
                invoice.InvoiceId, invoice.SubTotal, invoice.DiscountAmount,
                invoice.SurchargeAmount, invoice.FinalAmount,
                invoice.PaymentStatus, invoice.PaidAt,
                DepositDeducted = deposit,
                Message = "Thanh toán thành công"
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _invoiceRepository.DeleteAsync(id);
            if (deleted == null) return NotFound("No Invoice found with id " + id + ".");
            return Ok(deleted.ToInvoiceDto());
        }
    }

    public class PayInvoiceDto
    {
        public double? DiscountAmount { get; set; }
        public double? SurchargeAmount { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Note { get; set; }
    }
}
