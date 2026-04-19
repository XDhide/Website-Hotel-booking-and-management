using System;
using Manager.API.Dtos.Messenger;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class MessengerMapper
    {
        public static MessengerDto ToMessengerDto(this Messenger model)
        {
            return new MessengerDto
            {
                Id = model.Id,
                BoxId = model.BoxId,
                FromUserId = model.FromUserId,
                Content = model.Content,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }

        public static Messenger ToCreateMessengerModel(this CreateMessengerRequestDto dto)
        {
            return new Messenger
            {
                BoxId = dto.BoxId,
                FromUserId = dto.FromUserId,
                Content = dto.Content,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
            };
        }

        public static UpdateMessengerRequestDto ToUpdateMessengerRequestDto(this Messenger model)
        {
            return new UpdateMessengerRequestDto
            {
                BoxId = model.BoxId,
                FromUserId = model.FromUserId,
                Content = model.Content,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }
    }
}
