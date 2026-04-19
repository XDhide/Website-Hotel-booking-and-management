using System;
using Manager.API.Dtos.MessengerBox;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class MessengerBoxMapper
    {
        public static MessengerBoxDto ToMessengerBoxDto(this MessengerBox model)
        {
            return new MessengerBoxDto
            {
                Id = model.Id,
                UserId = model.UserId,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }

        public static MessengerBox ToCreateMessengerBoxModel(this CreateMessengerBoxRequestDto dto)
        {
            return new MessengerBox
            {
                UserId = dto.UserId,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
            };
        }

        public static UpdateMessengerBoxRequestDto ToUpdateMessengerBoxRequestDto(this MessengerBox model)
        {
            return new UpdateMessengerBoxRequestDto
            {
                UserId = model.UserId,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }
    }
}
