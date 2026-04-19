using Manager.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Data
{
    public class ApplicationDBContext : IdentityDbContext<AppUser>
    {
        public ApplicationDBContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Rooms> Rooms { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<RoomRate> RoomRates { get; set; }
        public DbSet<Services> Services { get; set; }
        public DbSet<Discount> Discounts { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        public DbSet<RoomInUse> RoomInUses { get; set; }
        public DbSet<Surcharge> Surcharges { get; set; }

        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceDetail> InvoiceDetails { get; set; }

        public DbSet<LostItem> LostItems { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }
        public DbSet<Report> Reports { get; set; }

        public DbSet<MessengerBox> MessengerBox { get; set; }
        public DbSet<Messenger> Messengers { get; set; }

        public DbSet<Master> Masters { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ================= ROOM =================
            modelBuilder.Entity<Rooms>()
                .HasOne(r => r.RoomType)
                .WithMany(rt => rt.Rooms)
                .HasForeignKey(r => r.RoomTypeId);

            modelBuilder.Entity<RoomRate>()
                .HasOne(rr => rr.RoomType)
                .WithMany(rt => rt.RoomRates)
                .HasForeignKey(rr => rr.RoomTypeId);

            // ================= BOOKING =================
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.RoomType)
                .WithMany(rt => rt.Bookings)
                .HasForeignKey(b => b.RoomTypeId);

            // ================= ROOM IN USE =================
            modelBuilder.Entity<RoomInUse>()
                .HasOne(r => r.Booking)
                .WithMany(b => b.RoomInUses)
                .HasForeignKey(r => r.BookingId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<RoomInUse>()
                .HasOne(r => r.Rooms)
                .WithMany(rm => rm.RoomInUses)
                .HasForeignKey(r => r.RoomId)
                .OnDelete(DeleteBehavior.NoAction);

            // ================= INVOICE =================
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.RoomInUse)
                .WithMany(riu => riu.Invoices)
                .HasForeignKey(i => i.RoomUseId);

            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.User)
                .WithMany()
                .HasForeignKey(i => i.UserId);

            // ================= INVOICE DETAIL =================
            modelBuilder.Entity<InvoiceDetail>()
                .HasOne(id => id.Invoice)
                .WithMany(i => i.InvoiceDetails)
                .HasForeignKey(id => id.InvoiceId);

            // ================= EVALUATION =================
            modelBuilder.Entity<Evaluation>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<Evaluation>()
                .HasOne(e => e.RoomInUse)
                .WithMany()
                .HasForeignKey(e => e.RoomUseId);

            // ================= REPORT =================
            modelBuilder.Entity<Report>()
                .HasOne(r => r.GeneratedByUser)
                .WithMany()
                .HasForeignKey(r => r.GeneratedBy);

            // ================= LOST ITEM =================
            modelBuilder.Entity<LostItem>()
                .HasOne(l => l.Rooms)
                .WithMany()
                .HasForeignKey(l => l.RoomId);

            modelBuilder.Entity<LostItem>()
                .HasOne(l => l.RoomInUse)
                .WithMany()
                .HasForeignKey(l => l.RoomUseId);

            // ================= MESSENGER (FIXED) =================

            modelBuilder.Entity<Messenger>()
                .HasOne(m => m.Box)
                .WithMany()
                .HasForeignKey(m => m.BoxId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Messenger>()
                .HasOne(m => m.FromUser)
                .WithMany()
                .HasForeignKey(m => m.FromUserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<MessengerBox>()
                .HasOne(mb => mb.User)
                .WithMany()
                .HasForeignKey(mb => mb.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // ================= PRECISION =================
            modelBuilder.Entity<RoomRate>().Property(p => p.Price).HasPrecision(10, 2);
            modelBuilder.Entity<RoomInUse>().Property(p => p.PricePerUnit).HasPrecision(10, 2);
            modelBuilder.Entity<RoomInUse>().Property(p => p.TotalAmount).HasPrecision(10, 2);

            modelBuilder.Entity<Invoice>().Property(p => p.SubTotal).HasPrecision(10, 2);
            modelBuilder.Entity<Invoice>().Property(p => p.DiscountAmount).HasPrecision(10, 2);
            modelBuilder.Entity<Invoice>().Property(p => p.SurchargeAmount).HasPrecision(10, 2);
            modelBuilder.Entity<Invoice>().Property(p => p.FinalAmount).HasPrecision(10, 2);

            modelBuilder.Entity<InvoiceDetail>().Property(p => p.UnitPrice).HasPrecision(10, 2);
            modelBuilder.Entity<InvoiceDetail>().Property(p => p.TotalPrice).HasPrecision(10, 2);

            modelBuilder.Entity<Services>().Property(p => p.Price).HasPrecision(10, 2);
            modelBuilder.Entity<Surcharge>().Property(p => p.Price).HasPrecision(10, 2);
            modelBuilder.Entity<Discount>().Property(p => p.DiscountValue).HasPrecision(10, 2);

            // ================= ROLE =================
            modelBuilder.Entity<IdentityRole<int>>().HasData(
                new IdentityRole<int> { Id = 1, Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole<int> { Id = 2, Name = "Manager", NormalizedName = "MANAGER" },
                new IdentityRole<int> { Id = 3, Name = "Guest", NormalizedName = "GUEST" }
            );
        }
    }
}