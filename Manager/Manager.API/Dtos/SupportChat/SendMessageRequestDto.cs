using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.SupportChat
{
    public class SendMessageRequestDto
    {
        [Required]
        public int SupportChatId { get; set; }
        
        [Required]
        [MinLength(1)]
        public string Message { get; set; }
    }
}
