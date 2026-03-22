using Manager.API.Dtos.Payment;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Manager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentRepository _paymentRepo;
        private readonly IBookingRepository _bookingRepo;
        private readonly UserManager<AppUser> _userManager;

        public PaymentController(
            IPaymentRepository paymentRepo,
            IBookingRepository bookingRepo,
            UserManager<AppUser> userManager)
        {
            _paymentRepo = paymentRepo;
            _bookingRepo = bookingRepo;
            _userManager = userManager;
        }

        [HttpGet("booking/{bookingId:int}")]
        public async Task<IActionResult> GetByBookingId([FromRoute] int bookingId)
        {
            var booking = await _bookingRepo.GetByIdAsync(bookingId);
            if (booking == null)
                return NotFound("Booking not found");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            // Kiểm tra quyền sở hữu booking hoặc là admin/manager
            if (booking.UserId != user.Id && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
                return Forbid();

            var payments = await _paymentRepo.GetByBookingIdAsync(bookingId);
            var paymentDtos = payments.Select(p => p.ToPaymentDto());
            return Ok(paymentDtos);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var booking = await _bookingRepo.GetByIdAsync(dto.BookingId);
            if (booking == null)
                return NotFound("Booking not found");

            // Kiểm tra booking có trạng thái hợp lệ để thanh toán
            if (booking.Status == "Cancelled")
                return BadRequest("Cannot process payment for cancelled booking");

            // Kiểm tra số tiền thanh toán hợp lệ
            var totalPaid = await _paymentRepo.GetTotalPaidAmountAsync(dto.BookingId);
            if (totalPaid + dto.Amount > booking.TotalAmount)
                return BadRequest("Payment amount exceeds booking total");

            var payment = dto.ToPaymentFromCreate();
            payment.Status = "Completed";
            payment.TransactionId = Guid.NewGuid().ToString();

            var createdPayment = await _paymentRepo.CreateAsync(payment);

            // Cập nhật trạng thái booking nếu đã thanh toán đủ
            var newTotalPaid = totalPaid + dto.Amount;
            if (newTotalPaid >= booking.TotalAmount && booking.Status == "Pending")
            {
                booking.Status = "Confirmed";
                await _bookingRepo.UpdateAsync(dto.BookingId, booking);
            }

            return Ok(createdPayment.ToPaymentDto());
        }

        [HttpPost("merge-invoices")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> MergeInvoices([FromBody] MergeInvoicesRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.BookingIds.Count < 2)
                return BadRequest("At least 2 bookings are required to merge");

            var bookings = new List<Booking>();
            foreach (var bookingId in dto.BookingIds)
            {
                var booking = await _bookingRepo.GetByIdAsync(bookingId);
                if (booking == null)
                    return NotFound($"Booking {bookingId} not found");
                
                if (booking.Status == "Cancelled")
                    return BadRequest($"Cannot merge cancelled booking {bookingId}");

                bookings.Add(booking);
            }

            // Kiểm tra tất cả booking thuộc cùng một user
            var firstUserId = bookings[0].UserId;
            if (bookings.Any(b => b.UserId != firstUserId))
                return BadRequest("All bookings must belong to the same user");

            var totalAmount = bookings.Sum(b => b.TotalAmount);
            var totalPaid = 0m;
            foreach (var booking in bookings)
            {
                totalPaid += await _paymentRepo.GetTotalPaidAmountAsync(booking.Id);
            }

            return Ok(new
            {
                message = "Invoices merged successfully",
                bookingIds = dto.BookingIds,
                totalAmount = totalAmount,
                totalPaid = totalPaid,
                remainingAmount = totalAmount - totalPaid
            });
        }

        [HttpPost("split-invoice")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> SplitInvoice([FromBody] SplitInvoiceRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var booking = await _bookingRepo.GetByIdAsync(dto.BookingId);
            if (booking == null)
                return NotFound("Booking not found");

            if (booking.Status == "Cancelled")
                return BadRequest("Cannot split invoice for cancelled booking");

            var totalSplitAmount = dto.Amounts.Sum();
            if (totalSplitAmount != booking.TotalAmount)
                return BadRequest("Sum of split amounts must equal booking total amount");

            var totalPaid = await _paymentRepo.GetTotalPaidAmountAsync(dto.BookingId);

            var splitInvoices = new List<object>();
            for (int i = 0; i < dto.Amounts.Count; i++)
            {
                splitInvoices.Add(new
                {
                    invoiceNumber = i + 1,
                    amount = dto.Amounts[i],
                    bookingId = dto.BookingId
                });
            }

            return Ok(new
            {
                message = "Invoice split successfully",
                originalAmount = booking.TotalAmount,
                totalPaid = totalPaid,
                splitInvoices = splitInvoices
            });
        }
    }
}
