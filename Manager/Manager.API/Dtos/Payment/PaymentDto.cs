using System;
using System.Collections.Generic;

namespace Manager.API.Dtos.Payment
{
    public class PaymentDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public double Amount { get; set; }
        public string Method { get; set; }
        public string Status { get; set; }
        public DateTime? PaidAt { get; set; }
    }

    public class CreatePaymentRequestDto
    {
        public int BookingId { get; set; }
        public double Amount { get; set; }
        public string Method { get; set; }
    }

    public class MergeInvoicesRequestDto
    {
        public List<int> BookingIds { get; set; }
    }

    public class SplitInvoiceRequestDto
    {
        public int BookingId { get; set; }
        public List<double> Amounts { get; set; }
    }
}
