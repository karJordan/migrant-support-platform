using Microsoft.EntityFrameworkCore;

namespace MigrantSupportPlatform_API.Models
{
    public class ApiDbContext : DbContext
    {
        protected readonly IConfiguration Configuration;
        public ApiDbContext(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection"));
        }

        public DbSet<UsersModel> Users { get; set; }
    }
}
