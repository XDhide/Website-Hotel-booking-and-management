using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class Surcharge
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public double? Price { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
