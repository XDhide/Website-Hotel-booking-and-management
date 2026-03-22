using Manager.API.Dtos.Payment;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class PaymentMapper
    {
        public static PaymentDto ToPaymentDto(this Payment payment)
        {
            return new PaymentDto
            {
                Id = payment.Id,
                BookingId = payment.BookingId,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod,
                Status = payment.Status,
                PaymentDate = payment.PaymentDate,
                TransactionId = payment.TransactionId
            };
        }

        public static Payment ToPaymentFromCreate(this CreatePaymentRequestDto dto)
        {
            return new Payment
            {
                BookingId = dto.BookingId,
                Amount = dto.Amount,
                PaymentMethod = dto.PaymentMethod,
                Status = "Pending",
                Notes = dto.Notes
            };
        }
    }
}
