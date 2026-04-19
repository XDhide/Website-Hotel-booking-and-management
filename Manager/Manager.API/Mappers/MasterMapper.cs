using System;
using Manager.API.Dtos.Master;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class MasterMapper
    {
        public static MasterDto ToMasterDto(this Master model)
        {
            return new MasterDto
            {
                Id = model.Id,
                Name = model.Name,
                Content = model.Content,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }

        public static Master ToCreateMasterModel(this CreateMasterRequestDto dto)
        {
            return new Master
            {
                Name = dto.Name,
                Content = dto.Content,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
            };
        }

        public static UpdateMasterRequestDto ToUpdateMasterRequestDto(this Master model)
        {
            return new UpdateMasterRequestDto
            {
                Name = model.Name,
                Content = model.Content,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }
    }
}
