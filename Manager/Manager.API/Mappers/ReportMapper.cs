using System;
using Manager.API.Dtos.Report;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class ReportMapper
    {
        public static ReportDto ToReportDto(this Report model)
        {
            return new ReportDto
            {
                ReportId = model.ReportId,
                ReportType = model.ReportType,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                GeneratedBy = model.GeneratedBy,
                CreatedAt = model.CreatedAt,
            };
        }

        public static Report ToCreateReportModel(this CreateReportRequestDto dto)
        {
            return new Report
            {
                ReportType = dto.ReportType,
                FromDate = dto.FromDate,
                ToDate = dto.ToDate,
                GeneratedBy = dto.GeneratedBy,
                CreatedAt = DateTime.Now,
            };
        }

        public static UpdateReportRequestDto ToUpdateReportRequestDto(this Report model)
        {
            return new UpdateReportRequestDto
            {
                ReportType = model.ReportType,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                GeneratedBy = model.GeneratedBy,
                CreatedAt = model.CreatedAt,
            };
        }
    }
}
