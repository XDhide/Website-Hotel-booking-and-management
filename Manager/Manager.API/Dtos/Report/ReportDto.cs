using System;

namespace Manager.API.Dtos.Report
{
    public class ReportDto
    {
        public int ReportId { get; set; }
        public string ReportType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? GeneratedBy { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
