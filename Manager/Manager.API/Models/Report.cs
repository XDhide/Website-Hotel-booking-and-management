using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class Report
    {
        [Key]
        public int ReportId { get; set; }
        public string ReportType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? GeneratedBy { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Navigation
        public AppUser GeneratedByUser { get; set; }
    }
}
