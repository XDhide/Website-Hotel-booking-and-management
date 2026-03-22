using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface ISupportChatRepository
    {
        Task<SupportChat?> GetByIdAsync(int id);
        Task<List<SupportChat>> GetByUserIdAsync(string userId);
        Task<SupportChat> CreateAsync(SupportChat chat);
        Task<SupportChat?> UpdateAsync(int id, SupportChat chat);
        Task<ChatMessage> AddMessageAsync(ChatMessage message);
        Task<List<ChatMessage>> GetMessagesAsync(int chatId);
    }
}
