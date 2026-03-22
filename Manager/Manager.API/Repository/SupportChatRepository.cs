using Manager.API.Data;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class SupportChatRepository : ISupportChatRepository
    {
        private readonly ApplicationDBContext _context;

        public SupportChatRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<SupportChat?> GetByIdAsync(int id)
        {
            return await _context.SupportChats
                .Include(sc => sc.Messages)
                .ThenInclude(m => m.Sender)
                .FirstOrDefaultAsync(sc => sc.Id == id);
        }

        public async Task<List<SupportChat>> GetByUserIdAsync(string userId)
        {
            return await _context.SupportChats
                .Include(sc => sc.Messages)
                .Where(sc => sc.UserId == userId)
                .OrderByDescending(sc => sc.CreatedAt)
                .ToListAsync();
        }

        public async Task<SupportChat> CreateAsync(SupportChat chat)
        {
            await _context.SupportChats.AddAsync(chat);
            await _context.SaveChangesAsync();
            return chat;
        }

        public async Task<SupportChat?> UpdateAsync(int id, SupportChat chat)
        {
            var existingChat = await _context.SupportChats.FindAsync(id);
            if (existingChat == null) return null;

            existingChat.Status = chat.Status;
            existingChat.ClosedAt = chat.ClosedAt;

            await _context.SaveChangesAsync();
            return existingChat;
        }

        public async Task<ChatMessage> AddMessageAsync(ChatMessage message)
        {
            await _context.ChatMessages.AddAsync(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<List<ChatMessage>> GetMessagesAsync(int chatId)
        {
            return await _context.ChatMessages
                .Include(m => m.Sender)
                .Where(m => m.SupportChatId == chatId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }
    }
}
