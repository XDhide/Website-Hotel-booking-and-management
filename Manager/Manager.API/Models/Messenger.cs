using Manager.API.Models;
using System.ComponentModel.DataAnnotations;

public class Messenger
{
    [Key]
    public int Id { get; set; }

    public int BoxId { get; set; }
    public MessengerBox Box { get; set; }

    public string FromUserId { get; set; }
    public AppUser FromUser { get; set; }

    public string Content { get; set; }

    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}