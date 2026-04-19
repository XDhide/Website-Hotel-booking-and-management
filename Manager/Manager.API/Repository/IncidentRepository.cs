using Manager.API.Data;
using Manager.API.Dtos.Incident;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class IncidentRepository : IIncidentRepository
    {
        private readonly ApplicationDBContext _context;
        public IncidentRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<Incident>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var query = _context.Incidents.AsQueryable();

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderByDescending(i => i.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var totalPages = totalCount == 0
                ? 0
                : (int)Math.Ceiling((double)totalCount / limit);

            return new PagedResult<Incident>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Incident?> GetByIdAsync(int id)
        {
            return await _context.Incidents.FindAsync(id);
        }

        public async Task<Incident> CreateAsync(Incident incident)
        {
            incident.CreateAt = DateTime.Now;
            incident.UpdateAt = DateTime.Now;
            incident.Status = "Pending";
            await _context.Incidents.AddAsync(incident);
            await _context.SaveChangesAsync();
            return incident;
        }

        public async Task<Incident?> UpdateAsync(int id, UpdateIncidentDto dto)
        {
            var incident = await _context.Incidents.FindAsync(id);
            if (incident == null) return null;

            incident.Title = dto.Title;
            incident.Description = dto.Description;
            incident.Status = dto.Status;
            incident.UpdateAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return incident;
        }

        public async Task<Incident?> DeleteAsync(int id)
        {
            var incident = await _context.Incidents.FindAsync(id);
            if (incident == null) return null;

            _context.Incidents.Remove(incident);
            await _context.SaveChangesAsync();
            return incident;
        }
    }
}