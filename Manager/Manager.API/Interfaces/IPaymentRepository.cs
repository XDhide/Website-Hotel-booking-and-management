using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IPaymentRepository
    {
        Task<List<Payment>> GetAllAsync();
        Task<Payment?> GetByIdAsync(int id);
        Task<List<Payment>> GetByBookingIdAsync(int bookingId);
        Task<Payment> CreateAsync(Payment payment);
        Task<Payment?> UpdateAsync(int id, Payment payment);
        Task<decimal> GetTotalPaidAmountAsync(int bookingId);
    }
}
