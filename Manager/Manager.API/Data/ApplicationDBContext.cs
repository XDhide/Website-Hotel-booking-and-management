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
        public DbSet<Payment> Payments { get; set; }
        public DbSet<SupportChat> SupportChats { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<BookingService> BookingServices { get; set; }

        // MaiLan
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceService> InvoiceServices { get; set; }
        public DbSet<LostItem> LostItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Incident> Incidents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Rooms>()
                .HasOne(r => r.RoomType)
                .WithMany(rt => rt.Rooms)
                .HasForeignKey(r => r.RoomTypeId);

            modelBuilder.Entity<RoomRate>()
                .HasOne(rr => rr.RoomType)
                .WithMany(rt => rt.RoomRates)
                .HasForeignKey(rr => rr.RoomTypeId);

            modelBuilder.Entity<RoomRate>()
                .Property(p => p.Price)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Booking>()
                .Property(p => p.TotalPrice)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Room)
                .WithMany()
                .HasForeignKey(b => b.RoomId);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId);

            // Invoice (1-1 với Booking) - MaiLan
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Booking)
                .WithOne(b => b.Invoice)
                .HasForeignKey<Invoice>(i => i.BookingId);

            modelBuilder.Entity<Invoice>()
                .Property(p => p.TotalAmount).HasPrecision(10, 2);
            modelBuilder.Entity<Invoice>()
                .Property(p => p.RoomCharge).HasPrecision(10, 2);
            modelBuilder.Entity<Invoice>()
                .Property(p => p.ServiceCharge).HasPrecision(10, 2);
            modelBuilder.Entity<Invoice>()
                .Property(p => p.Discount).HasPrecision(10, 2);

            modelBuilder.Entity<InvoiceService>()
                .HasOne(is_ => is_.Invoice)
                .WithMany(i => i.InvoiceServices)
                .HasForeignKey(is_ => is_.InvoiceId);
            modelBuilder.Entity<InvoiceService>()
                .HasOne(is_ => is_.Service)
                .WithMany()
                .HasForeignKey(is_ => is_.ServiceId);
            modelBuilder.Entity<InvoiceService>()
                .Property(p => p.UnitPrice).HasPrecision(10, 2);
            modelBuilder.Entity<InvoiceService>()
                .Property(p => p.TotalPrice).HasPrecision(10, 2);

            modelBuilder.Entity<LostItem>()
                .HasOne(l => l.Booking)
                .WithMany(b => b.LostItems)
                .HasForeignKey(l => l.BookingId);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Booking)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BookingId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Incident>()
                .HasOne(i => i.Booking)
                .WithMany(b => b.Incidents)
                .HasForeignKey(i => i.BookingId)
                .OnDelete(DeleteBehavior.NoAction);

            // Payment - Minh
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Booking)
                .WithMany(b => b.Payments)
                .HasForeignKey(p => p.BookingId);
            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(10, 2);

            // SupportChat - Minh
            modelBuilder.Entity<SupportChat>()
                .HasOne(sc => sc.User)
                .WithMany()
                .HasForeignKey(sc => sc.UserId);

            modelBuilder.Entity<ChatMessage>()
                .HasOne(cm => cm.SupportChat)
                .WithMany(sc => sc.Messages)
                .HasForeignKey(cm => cm.SupportChatId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<ChatMessage>()
                .HasOne(cm => cm.Sender)
                .WithMany()
                .HasForeignKey(cm => cm.SenderId);

            // BookingService - Minh
            modelBuilder.Entity<BookingService>()
                .HasOne(bs => bs.Booking)
                .WithMany(b => b.BookingServices)
                .HasForeignKey(bs => bs.BookingId);
            modelBuilder.Entity<BookingService>()
                .HasOne(bs => bs.Service)
                .WithMany()
                .HasForeignKey(bs => bs.ServiceId);
            modelBuilder.Entity<BookingService>()
                .Property(p => p.Price)
                .HasPrecision(10, 2);

            List<IdentityRole> roles = new List<IdentityRole>
            {
                new IdentityRole {Id = "1", Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole {Id = "2", Name = "Manager", NormalizedName = "MANAGER" },
                new IdentityRole {Id = "3", Name = "Guest", NormalizedName = "GUEST" }
            };
            modelBuilder.Entity<IdentityRole>().HasData(roles);
        }
    }
}