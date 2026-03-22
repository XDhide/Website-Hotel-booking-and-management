using Manager.API.Data;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly ApplicationDBContext _context;

        public PaymentRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<Payment>> GetAllAsync()
        {
            return await _context.Payments
                .Include(p => p.Booking)
                .ToListAsync();
        }

        public async Task<Payment?> GetByIdAsync(int id)
        {
            return await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<Payment>> GetByBookingIdAsync(int bookingId)
        {
            return await _context.Payments
                .Where(p => p.BookingId == bookingId)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }

        public async Task<Payment> CreateAsync(Payment payment)
        {
            await _context.Payments.AddAsync(payment);
            await _context.SaveChangesAsync();
            return payment;
        }

        public async Task<Payment?> UpdateAsync(int id, Payment payment)
        {
            var existingPayment = await _context.Payments.FindAsync(id);
            if (existingPayment == null) return null;

            existingPayment.Status = payment.Status;
            existingPayment.TransactionId = payment.TransactionId;
            existingPayment.Notes = payment.Notes;

            await _context.SaveChangesAsync();
            return existingPayment;
        }

        public async Task<decimal> GetTotalPaidAmountAsync(int bookingId)
        {
            return await _context.Payments
                .Where(p => p.BookingId == bookingId && p.Status == "Completed")
                .SumAsync(p => p.Amount);
        }
    }
}
