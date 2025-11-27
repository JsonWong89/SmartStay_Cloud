// using Microsoft.EntityFrameworkCore;

// namespace SmartStay.Data
// {
//     public class SmartStayDbContext : DbContext
//     {
//         public SmartStayDbContext(DbContextOptions<SmartStayDbContext> options)
//             : base(options)
//         {
//         }

//         // DbSets
//         public DbSet<Models.User> Users { get; set; } = null!;
//         public DbSet<Models.Hotel> Hotels { get; set; } = null!;
//         public DbSet<Models.HotelManager> HotelManagers { get; set; } = null!;
//         public DbSet<Models.RoomType> RoomTypes { get; set; } = null!;
//         public DbSet<Models.RatePlan> RatePlans { get; set; } = null!;
//         public DbSet<Models.Booking> Bookings { get; set; } = null!;
//         public DbSet<Models.SystemEvent> SystemEvents { get; set; } = null!;
//         public DbSet<Models.AuditLog> AuditLogs { get; set; } = null!;
//         public DbSet<Models.DailyMetric> DailyMetrics { get; set; } = null!;

//         protected override void OnModelCreating(ModelBuilder modelBuilder)
//         {
//             base.OnModelCreating(modelBuilder);

//             // User configuration
//             modelBuilder.Entity<Models.User>(entity =>
//             {
//                 entity.HasKey(e => e.UserID);
//                 entity.HasIndex(e => e.Email).IsUnique();
//                 entity.HasIndex(e => e.Role);
//                 entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
//                 entity.Property(e => e.PasswordHash).IsRequired();
//                 entity.Property(e => e.FullName).IsRequired().HasMaxLength(255);
//                 entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
//             });

//             // Hotel configuration
//             modelBuilder.Entity<Models.Hotel>(entity =>
//             {
//                 entity.HasKey(e => e.HotelID);
//                 entity.HasIndex(e => e.HotelName);
//                 entity.Property(e => e.HotelName).IsRequired().HasMaxLength(100);
//                 entity.Property(e => e.Address).HasMaxLength(255);
//                 entity.Property(e => e.City).HasMaxLength(100);
//             });

//             // HotelManager configuration
//             modelBuilder.Entity<Models.HotelManager>(entity =>
//             {
//                 entity.HasKey(e => e.UserID);
//                 entity.Property(e => e.FullName).HasMaxLength(255);
//                 entity.Property(e => e.Email).HasMaxLength(255);
//                 entity.Property(e => e.Role).HasMaxLength(50);
//             });

//             // RoomType configuration
//             modelBuilder.Entity<Models.RoomType>(entity =>
//             {
//                 entity.HasKey(e => e.Id);
//                 entity.HasIndex(e => new { e.HotelId, e.Code }).IsUnique();
//                 entity.HasIndex(e => e.Status);
//                 entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
//                 entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
//                 entity.Property(e => e.BedType).HasMaxLength(100);
//                 entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
//                 entity.Property(e => e.SizeSquareMeters).HasColumnType("decimal(10,2)");
//                 entity.HasOne(e => e.Hotel)
//                     .WithMany(h => h.RoomTypes)
//                     .HasForeignKey(e => e.HotelId)
//                     .OnDelete(DeleteBehavior.Cascade);
//             });

//             // RatePlan configuration
//             modelBuilder.Entity<Models.RatePlan>(entity =>
//             {
//                 entity.HasKey(e => e.Id);
//                 entity.HasIndex(e => new { e.HotelId, e.Code }).IsUnique();
//                 entity.HasIndex(e => new { e.StartDate, e.EndDate });
//                 entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
//                 entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
//                 entity.Property(e => e.BasePrice).HasColumnType("decimal(10,2)");
//                 entity.Property(e => e.Currency).HasMaxLength(10);
//                 entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
//                 entity.HasOne(e => e.Hotel)
//                     .WithMany(h => h.RatePlans)
//                     .HasForeignKey(e => e.HotelId)
//                     .OnDelete(DeleteBehavior.Cascade);
//                 entity.HasOne(e => e.RoomType)
//                     .WithMany(r => r.RatePlans)
//                     .HasForeignKey(e => e.RoomTypeId)
//                     .OnDelete(DeleteBehavior.Restrict);
//             });

//             // Booking configuration
//             modelBuilder.Entity<Models.Booking>(entity =>
//             {
//                 entity.HasKey(e => e.Id);
//                 entity.HasIndex(e => e.BookingNumber).IsUnique();
//                 entity.HasIndex(e => e.Status);
//                 entity.HasIndex(e => new { e.CheckInDate, e.CheckOutDate });
//                 entity.Property(e => e.BookingNumber).IsRequired().HasMaxLength(50);
//                 entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
//                 entity.Property(e => e.GuestName).IsRequired().HasMaxLength(255);
//                 entity.Property(e => e.GuestEmail).HasMaxLength(255);
//                 entity.Property(e => e.GuestPhone).HasMaxLength(50);
//                 entity.Property(e => e.Subtotal).HasColumnType("decimal(10,2)");
//                 entity.Property(e => e.Taxes).HasColumnType("decimal(10,2)");
//                 entity.Property(e => e.Total).HasColumnType("decimal(10,2)");
//                 entity.Property(e => e.Currency).HasMaxLength(10);
//                 entity.Property(e => e.Channel).HasMaxLength(50);
//                 entity.HasOne(e => e.Hotel)
//                     .WithMany(h => h.Bookings)
//                     .HasForeignKey(e => e.HotelId)
//                     .OnDelete(DeleteBehavior.Restrict);
//                 entity.HasOne(e => e.RoomType)
//                     .WithMany(r => r.Bookings)
//                     .HasForeignKey(e => e.RoomTypeId)
//                     .OnDelete(DeleteBehavior.Restrict);
//                 entity.HasOne(e => e.RatePlan)
//                     .WithMany(r => r.Bookings)
//                     .HasForeignKey(e => e.RatePlanId)
//                     .OnDelete(DeleteBehavior.Restrict);
//                 entity.HasOne(e => e.Creator)
//                     .WithMany(u => u.Bookings)
//                     .HasForeignKey(e => e.CreatedBy)
//                     .OnDelete(DeleteBehavior.Restrict);
//             });

//             // SystemEvent configuration
//             modelBuilder.Entity<Models.SystemEvent>(entity =>
//             {
//                 entity.HasKey(e => e.Id);
//                 entity.HasIndex(e => e.Level);
//                 entity.HasIndex(e => e.CreatedAt);
//                 entity.Property(e => e.Level).IsRequired().HasMaxLength(50);
//                 entity.Property(e => e.Source).IsRequired().HasMaxLength(100);
//                 entity.Property(e => e.Message).IsRequired();
//             });

//             // AuditLog configuration
//             modelBuilder.Entity<Models.AuditLog>(entity =>
//             {
//                 entity.HasKey(e => e.Id);
//                 entity.HasIndex(e => e.EntityType);
//                 entity.HasIndex(e => e.CreatedAt);
//                 entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
//                 entity.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
//                 entity.Property(e => e.EntityId).HasMaxLength(100);
//                 entity.Property(e => e.IpAddress).HasMaxLength(50);
//                 entity.Property(e => e.UserAgent).HasMaxLength(500);
//                 entity.HasOne(e => e.User)
//                     .WithMany(u => u.AuditLogs)
//                     .HasForeignKey(e => e.UserId)
//                     .OnDelete(DeleteBehavior.Restrict);
//             });

//             // DailyMetric configuration
//             modelBuilder.Entity<Models.DailyMetric>(entity =>
//             {
//                 entity.HasKey(e => e.Id);
//                 entity.HasIndex(e => new { e.HotelId, e.Date }).IsUnique();
//                 entity.Property(e => e.OccupancyPercent).HasColumnType("decimal(5,2)");
//                 entity.Property(e => e.AverageDailyRate).HasColumnType("decimal(10,2)");
//                 entity.Property(e => e.RevenueTotalRooms).HasColumnType("decimal(10,2)");
//                 entity.HasOne(e => e.Hotel)
//                     .WithMany(h => h.DailyMetrics)
//                     .HasForeignKey(e => e.HotelId)
//                     .OnDelete(DeleteBehavior.Cascade);
//             });
//         }
//     }
// }
