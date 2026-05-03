using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.InvoiceDetail;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Manager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Controllers
{
    [Route("api/invoicedetail")]
    [ApiController]
    public class InvoiceDetailController : ControllerBase
    {
        private readonly IInvoiceDetailRepository _invoiceDetailRepository;
        private readonly ApplicationDBContext _db;

        public InvoiceDetailController(IInvoiceDetailRepository invoiceDetailRepository, ApplicationDBContext db)
        {
            _invoiceDetailRepository = invoiceDetailRepository;
            _db = db;
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

        [HttpGet("by-invoice/{invoiceId}")]
        public async Task<IActionResult> GetByInvoice(int invoiceId)
        {
            var details = await _db.InvoiceDetails
                .Where(d => d.InvoiceId == invoiceId)
                .ToListAsync();
            return Ok(details);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] CreateInvoiceDetailRequestDto dto)
        {
            var model = dto.ToCreateInvoiceDetailModel();
            var created = await _invoiceDetailRepository.CreateAsync(dto.InvoiceId, model);
            var resultDto = created.ToInvoiceDetailDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.InvoiceDetailId }, resultDto);
        }

        /// <summary>
        /// Thêm dịch vụ vào hóa đơn (user gọi dịch vụ từ phòng đang ở)
        /// Tự động tìm invoice đang Unpaid theo roomUseId và tạo notification cho admin
        /// </summary>
        [HttpPost("add-service")]
        [Authorize]
        public async Task<IActionResult> AddService([FromBody] AddServiceDto dto)
        {
            var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);

            // Tìm invoice đang Unpaid của phòng này
            var invoice = await _db.Invoices
                .FirstOrDefaultAsync(i => i.RoomUseId == dto.RoomUseId && i.PaymentStatus == "Unpaid");

            if (invoice == null)
                return NotFound("Không tìm thấy hóa đơn đang hoạt động cho phòng này.");

            var service = await _db.Services.FindAsync(dto.ServiceId);
            if (service == null)
                return NotFound("Dịch vụ không tồn tại.");

            double total = (service.Price ?? 0) * dto.Quantity;

            var detail = new InvoiceDetail
            {
                InvoiceId = invoice.InvoiceId,
                ItemType  = "Service",
                ItemId    = dto.ServiceId.ToString(),
                ItemName  = service.Name,
                UnitPrice = service.Price,
                Quantity  = dto.Quantity,
                TotalPrice = total,
                CreatedAt = System.DateTime.Now,
            };

            await _db.InvoiceDetails.AddAsync(detail);
            await _db.SaveChangesAsync();

            // Lấy thông tin phòng để tạo notification
            var roomInUse = await _db.RoomInUses
                .Include(r => r.Rooms)
                .Include(r => r.Booking).ThenInclude(b => b.RoomType)
                .FirstOrDefaultAsync(r => r.RoomUseId == dto.RoomUseId);

            var notification = new ServiceNotification
            {
                InvoiceDetailId = detail.InvoiceDetailId,
                InvoiceId       = invoice.InvoiceId,
                RoomUseId       = dto.RoomUseId,
                UserId          = userId ?? invoice.UserId,
                RoomNumber      = roomInUse?.Rooms?.RoomNumber ?? "—",
                RoomTypeName    = roomInUse?.Booking?.RoomType?.Name ?? "—",
                ServiceName     = service.Name,
                Quantity        = dto.Quantity,
                TotalPrice      = total,
                IsRead          = false,
                CreatedAt       = System.DateTime.Now,
            };

            await _db.ServiceNotifications.AddAsync(notification);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                detail.InvoiceDetailId,
                detail.InvoiceId,
                detail.ItemName,
                detail.UnitPrice,
                detail.Quantity,
                detail.TotalPrice,
                NotificationId = notification.Id,
            });
        }

        /// <summary>Lấy danh sách notifications gọi dịch vụ (admin)</summary>
        [HttpGet("service-notifications")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetServiceNotifications([FromQuery] bool unreadOnly = false)
        {
            var query = _db.ServiceNotifications.AsQueryable();
            if (unreadOnly) query = query.Where(n => !n.IsRead);

            var list = await query
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(list.Select(n => new {
                n.Id, n.InvoiceDetailId, n.InvoiceId, n.RoomUseId,
                n.UserId, n.RoomNumber, n.RoomTypeName,
                n.ServiceName, n.Quantity, n.TotalPrice,
                n.IsRead, n.CreatedAt,
            }));
        }

        /// <summary>Đánh dấu đã đọc notification</summary>
        [HttpPost("service-notifications/{id}/read")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> MarkRead(int id)
        {
            var n = await _db.ServiceNotifications.FindAsync(id);
            if (n == null) return NotFound();
            n.IsRead = true;
            await _db.SaveChangesAsync();
            return Ok(new { n.Id, n.IsRead });
        }

        /// <summary>Đánh dấu tất cả đã đọc</summary>
        [HttpPost("service-notifications/read-all")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> MarkAllRead()
        {
            var unread = await _db.ServiceNotifications.Where(n => !n.IsRead).ToListAsync();
            unread.ForEach(n => n.IsRead = true);
            await _db.SaveChangesAsync();
            return Ok(new { count = unread.Count });
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

    public class AddServiceDto
    {
        public int RoomUseId { get; set; }
        public int ServiceId { get; set; }
        public double Quantity { get; set; } = 1;
    }
}
