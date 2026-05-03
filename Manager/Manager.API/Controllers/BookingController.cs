using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Booking;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Controllers
{
    [Route("api/booking")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly ApplicationDBContext _db;

        public BookingController(IBookingRepository bookingRepository, ApplicationDBContext db)
        {
            _bookingRepository = bookingRepository;
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _bookingRepository.GetAllAsync(page, limit);

            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Booking found.");

            var dtos = result.Data.Select(s => s.ToBookingDto()).ToList();

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
            var model = await _bookingRepository.GetByIdAsync(id);

            if (model == null)
                return NotFound($"No Booking found with id {id}.");

            return Ok(model.ToBookingDto());
        }

        [HttpGet("my-bookings")]
        [Authorize]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var bookings = await _bookingRepository.GetByUserIdAsync(userId);

            var dtos = bookings.Select(b => b.ToBookingDto()).ToList();

            return Ok(dtos);
        }

        /// <summary>
        /// Lấy danh sách phòng đang đặt của user (bao gồm thông tin phòng thực tế và hóa đơn)
        /// </summary>
        [HttpGet("my-active-rooms")]
        [Authorize]
        public async Task<IActionResult> GetMyActiveRooms()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var bookings = await _db.Bookings
                .Include(b => b.RoomType)
                .Include(b => b.RoomInUses).ThenInclude(r => r.Rooms)
                .Include(b => b.RoomInUses).ThenInclude(r => r.Invoices).ThenInclude(i => i.InvoiceDetails)
                // Chỉ lấy booking chưa hoàn tất (loại Completed/CheckedOut)
                .Where(b => b.UserId == userId
                    && b.Status != "Completed"
                    && b.Status != "CheckedOut"
                    && b.Status != "Cancelled")
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            // Lọc thêm: nếu có roomInUse và tất cả invoice đều Paid → ẩn đi
            var result = bookings
                .Where(b => {
                    var rooms = b.RoomInUses?.ToList() ?? new System.Collections.Generic.List<Models.RoomInUse>();
                    if (!rooms.Any()) return true; // chưa checkin → vẫn hiện
                    // Có room Active → hiện
                    if (rooms.Any(r => r.Status == "Active")) return true;
                    // Có room mà tất cả invoice đã Paid → ẩn
                    var allPaid = rooms.All(r =>
                        r.Invoices == null || !r.Invoices.Any() ||
                        r.Invoices.All(i => i.PaymentStatus == "Paid"));
                    return !allPaid;
                })
                .Select(b => {
                    var activeRoom = b.RoomInUses?.FirstOrDefault(r => r.Status == "Active")
                                 ?? b.RoomInUses?.FirstOrDefault();
                    var invoice    = activeRoom?.Invoices?.FirstOrDefault(i => i.PaymentStatus == "Unpaid");
                    return new {
                        b.Id,
                        b.Status,
                        b.Deposit,
                        b.FromDate,
                        b.ToDate,
                        b.CreatedAt,
                        RoomTypeName   = b.RoomType?.Name,
                        RoomTypeId     = b.RoomTypeId,
                        RoomUseId      = activeRoom?.RoomUseId,
                        RoomId         = activeRoom?.RoomId,
                        RoomNumber     = activeRoom?.Rooms?.RoomNumber,
                        RoomStatus     = activeRoom?.Status,
                        CheckInActual  = activeRoom?.CheckInActual,
                        CheckOutActual = activeRoom?.CheckOutActual,
                        PricePerUnit   = activeRoom?.PricePerUnit,
                        InvoiceId      = invoice?.InvoiceId,
                        InvoiceStatus  = invoice?.PaymentStatus,
                        SubTotal       = invoice?.InvoiceDetails?.Sum(d => d.TotalPrice ?? 0) ?? 0,
                        InvoiceDetails = invoice?.InvoiceDetails?.Select(d => new {
                            d.InvoiceDetailId, d.ItemType, d.ItemName, d.UnitPrice, d.Quantity, d.TotalPrice,
                        }),
                    };
                });

            return Ok(result);
        }

        /// <summary>
        /// Lịch sử giao dịch: tất cả booking + deposit + invoices của user
        /// </summary>
        [HttpGet("my-transaction-history")]
        [Authorize]
        public async Task<IActionResult> GetMyTransactionHistory()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var bookings = await _db.Bookings
                .Include(b => b.RoomType)
                .Include(b => b.RoomInUses).ThenInclude(r => r.Rooms)
                .Include(b => b.RoomInUses).ThenInclude(r => r.Invoices)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            var transactions = new System.Collections.Generic.List<object>();

            foreach (var b in bookings)
            {
                // Giao dịch đặt cọc
                if (b.Deposit != null && b.Deposit > 0)
                {
                    transactions.Add(new {
                        TransactionId  = $"DEP-{b.Id}",
                        Type           = "Deposit",
                        TypeLabel      = "Đặt cọc",
                        BookingId      = b.Id,
                        RoomTypeName   = b.RoomType?.Name,
                        RoomNumber     = (string?)null,
                        Amount         = b.Deposit,
                        Status         = "Paid",
                        Date           = b.CreatedAt,
                        Note           = $"Cọc đặt phòng #{b.Id}",
                    });
                }

                // Giao dịch hóa đơn
                foreach (var room in b.RoomInUses ?? new System.Collections.Generic.List<Models.RoomInUse>())
                {
                    foreach (var inv in room.Invoices ?? new System.Collections.Generic.List<Models.Invoice>())
                    {
                        transactions.Add(new {
                            TransactionId = $"INV-{inv.InvoiceId}",
                            Type          = "Invoice",
                            TypeLabel     = "Hóa đơn",
                            BookingId     = b.Id,
                            InvoiceId     = inv.InvoiceId,
                            RoomTypeName  = b.RoomType?.Name,
                            RoomNumber    = room.Rooms?.RoomNumber,
                            Amount        = inv.FinalAmount ?? inv.SubTotal ?? 0,
                            Status        = inv.PaymentStatus,
                            Date          = inv.CreatedAt,
                            PaidAt        = inv.PaidAt,
                            Note          = inv.Note,
                        });
                    }
                }
            }

            // transactions đã được thêm theo thứ tự bookings DESC
            return Ok(transactions);
        }

        /// <summary>
        /// User tự đặt phòng: yêu cầu cọc, tự động tìm phòng trống
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<IActionResult> Create([FromBody] CreateBookingRequestDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                      ?? dto.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Không xác định được người dùng.");

            dto.UserId = userId;

            if (dto.FromDate == null || dto.ToDate == null)
                return BadRequest("Vui lòng chọn ngày nhận và trả phòng.");

            // Tính deposit 20% từ estimate nếu user chưa truyền
            bool isAdmin = User.IsInRole("Admin") || User.IsInRole("Manager");
            if (!isAdmin && (dto.Deposit == null || dto.Deposit <= 0))
            {
                // Auto-tính 20% từ estimate (truyền qua EstimatedTotal nếu có)
                if (dto.EstimatedTotal != null && dto.EstimatedTotal > 0)
                    dto.Deposit = Math.Round(dto.EstimatedTotal.Value * 0.2, 0);
                else
                    dto.Deposit = 0;
            }

            try
            {
                var model = dto.ToCreateBookingModel();
                var created = await _bookingRepository.CreateAsync(dto.UserId, dto.RoomTypeId, model);
                var result = created.ToBookingDto();
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>Tính deposit 20% dựa trên loại phòng và thời gian</summary>
        [HttpPost("calculate-deposit")]
        [Authorize]
        public async Task<IActionResult> CalculateDeposit([FromBody] CalculateDepositDto dto)
        {
            var rates = await _db.RoomRates
                .Where(r => r.RoomTypeId == dto.RoomTypeId && r.IsActive != false)
                .ToListAsync();

            var rate = rates.FirstOrDefault(r => r.RentType == dto.RentType)
                    ?? rates.FirstOrDefault();

            if (rate == null)
                return NotFound("Không tìm thấy giá phòng.");

            double units = 0;
            if (dto.RentType == "Hour")
            {
                if (dto.FromDate == null) return BadRequest("Thiếu FromDate.");
                var diff = (dto.ToDate ?? dto.FromDate.Value.AddHours(1)) - dto.FromDate.Value;
                units = Math.Ceiling(diff.TotalHours);
            }
            else
            {
                if (dto.FromDate == null || dto.ToDate == null) return BadRequest("Thiếu ngày.");
                var diff = (dto.ToDate.Value - dto.FromDate.Value).TotalDays;
                units = Math.Ceiling(diff);
            }

            double estimated = units * (rate.Price ?? 0);
            double deposit   = Math.Round(estimated * 0.2, 0);

            return Ok(new {
                RentType  = rate.RentType,
                UnitPrice = rate.Price,
                Units     = units,
                Estimated = estimated,
                Deposit   = deposit,
                DepositPct = 20,
            });
        }

        /// <summary>
        /// Admin tạo booking: không cọc, chọn loại phòng cụ thể
        /// </summary>
        [HttpPost("admin-create")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> AdminCreate([FromBody] CreateBookingRequestDto dto)
        {
            if (string.IsNullOrEmpty(dto.UserId))
                return BadRequest("Cần cung cấp UserId.");

            if (dto.FromDate == null || dto.ToDate == null)
                return BadRequest("Vui lòng chọn ngày nhận và trả phòng.");

            if (dto.ToDate <= dto.FromDate)
                return BadRequest("Ngày trả phòng phải sau ngày nhận phòng.");

            // Admin đặt: deposit = 0
            dto.Deposit = 0;

            try
            {
                var model = dto.ToCreateBookingModel();
                var created = await _bookingRepository.CreateAsync(dto.UserId, dto.RoomTypeId, model);
                var result = created.ToBookingDto();
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateBookingRequestDto dto)
        {
            var updated = await _bookingRepository.UpdateAsync(id, dto);

            if (updated == null)
                return NotFound($"No Booking found with id {id}.");

            return Ok(updated.ToBookingDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _bookingRepository.DeleteAsync(id);

            if (deleted == null)
                return NotFound($"No Booking found with id {id}.");

            return Ok(deleted.ToBookingDto());
        }
    }
}
