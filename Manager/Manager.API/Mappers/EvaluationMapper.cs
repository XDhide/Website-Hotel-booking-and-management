using System;
using Manager.API.Dtos.Evaluation;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class EvaluationMapper
    {
        public static EvaluationDto ToEvaluationDto(this Evaluation model)
        {
            return new EvaluationDto
            {
                EvaluationId = model.EvaluationId,
                UserId = model.UserId,
                RoomUseId = model.RoomUseId,
                Rating = model.Rating,
                Comment = model.Comment,
                CreatedAt = model.CreatedAt,
            };
        }

        public static Evaluation ToCreateEvaluationModel(this CreateEvaluationRequestDto dto)
        {
            return new Evaluation
            {
                UserId = dto.UserId,
                RoomUseId = dto.RoomUseId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = dto.CreatedAt,
            };
        }

        public static UpdateEvaluationRequestDto ToUpdateEvaluationRequestDto(this Evaluation model)
        {
            return new UpdateEvaluationRequestDto
            {
                UserId = model.UserId,
                RoomUseId = model.RoomUseId,
                Rating = model.Rating,
                Comment = model.Comment,
                CreatedAt = model.CreatedAt,
            };
        }
    }
}
