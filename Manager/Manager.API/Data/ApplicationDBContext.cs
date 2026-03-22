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
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Room)
                .WithMany()
                .HasForeignKey(b => b.RoomId);

            modelBuilder.Entity<Booking>()
                .Property(p => p.TotalAmount)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Booking)
                .WithMany(b => b.Payments)
                .HasForeignKey(p => p.BookingId);

            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(10, 2);

            modelBuilder.Entity<SupportChat>()
                .HasOne(sc => sc.User)
                .WithMany()
                .HasForeignKey(sc => sc.UserId);

            modelBuilder.Entity<ChatMessage>()
                .HasOne(cm => cm.SupportChat)
                .WithMany(sc => sc.Messages)
                .HasForeignKey(cm => cm.SupportChatId);

            modelBuilder.Entity<ChatMessage>()
                .HasOne(cm => cm.Sender)
                .WithMany()
                .HasForeignKey(cm => cm.SenderId);

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
                new IdentityRole { Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole { Name = "Manager", NormalizedName = "MANAGER" },
                new IdentityRole { Name = "Guest", NormalizedName = "GUEST" }
            };
            modelBuilder.Entity<IdentityRole>().HasData(roles);


        }

    }

}
