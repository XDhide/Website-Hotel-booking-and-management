using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Report;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class ReportRepository : IReportRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public ReportRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<Report> CreateAsync(string UserId, Report model)
        {
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == UserId);
            if (user == null)
                throw new Exception("User not found");

            var newModel = new Report
            {
                ReportType = model.ReportType,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                GeneratedBy = model.GeneratedBy,
                CreatedAt = DateTime.Now,
            };
            await _dBContext.Reports.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<Report> DeleteAsync(int id)
        {
            var model = await _dBContext.Reports.FirstOrDefaultAsync(s => s.ReportId == id);
            if (model == null)
                return null;
            _dBContext.Reports.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<Report>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.Reports.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.ReportId).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<Report>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Report> GetByIdAsync(int id)
        {
            return await _dBContext.Reports.FindAsync(id);
        }

        public async Task<Report> UpdateAsync(int id, UpdateReportRequestDto dto)
        {
            var model = await _dBContext.Reports.FirstOrDefaultAsync(s => s.ReportId == id);
            if (model == null)
                return null;
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == dto.GeneratedBy);
            if (user == null)
                throw new Exception("User not found");
            model.ReportType = dto.ReportType;
            model.FromDate = dto.FromDate;
            model.ToDate = dto.ToDate;
            model.GeneratedBy = dto.GeneratedBy;
            model.CreatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
