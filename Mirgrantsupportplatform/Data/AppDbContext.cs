using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Mirgrantsupportplatform.Data
{
    public class AppDbContext : DbContext
    {
        protected readonly IConfiguration Configuration;

        public AppDbContext(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            // connect to postgres with connection string from app settings
            options.UseNpgsql(Configuration.GetConnectionString("WebAppDatabase"));
        }

        /*
         * author: Liam Horgan
         This will be where we can set up the tables in the database. For example, if we have a table called "Users", we would add a DbSet for it here:
         public DbSet<User> Users { get; set; }
         Will create the classes to build up the database once we know what we want to store in the database.
         */
    }
}
