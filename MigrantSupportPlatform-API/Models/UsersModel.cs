namespace MigrantSupportPlatform_API.Models
{
    public class UsersModel
    {
        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public int Age { get; set; }
    }
}
