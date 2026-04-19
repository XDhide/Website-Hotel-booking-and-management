using Manager.API.Data;
using Manager.API.Dtos.Room;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class RoomRepository : IRoomRepository
    {
        private readonly ApplicationDBContext _dBContext;
        public RoomRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }
        public async Task<Rooms> CreateAsync(int IdRoomType, Rooms Room)
        {
            var roomType = await _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == IdRoomType);
            if (roomType == null)
            {
                throw new Exception("RoomType not found");
            }
            var newRoom = new Rooms
            {
                RoomTypeId = IdRoomType,
                RoomNumber = Room.RoomNumber,
                CurrentStatus = Room.CurrentStatus,
                CreateAt = DateTime.Now
            };
            await _dBContext.Rooms.AddAsync(newRoom);
            await _dBContext.SaveChangesAsync();
            return newRoom;
        }

        public async Task<Rooms?> DeleteAsync(int id)
        {
            var room = await _dBContext.Rooms.FirstOrDefaultAsync(s => s.Id == id);
            if (room == null)
            {
                return null;
            }
            _dBContext.Rooms.Remove(room);
            await _dBContext.SaveChangesAsync();
            return room;
        }

        public async Task<PagedResult<Rooms>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var query = _dBContext.Rooms.AsQueryable();

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderByDescending(r => r.Id) 
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var totalPages = totalCount == 0
                ? 0
                : (int)Math.Ceiling((double)totalCount / limit);

            return new PagedResult<Rooms>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Rooms?> GetByIdAsync(int id)
        {
            var room = await _dBContext.Rooms.FindAsync(id);
            return room;
        }

        public async Task<Rooms?> UpdateAsync(int id, UpdateRoomRequestDto RoomDto)
        {
            var room = await _dBContext.Rooms.FirstOrDefaultAsync(s => s.Id == id);
            if (room == null)
            {
                return null;
            }
            var Roomtype = await _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == RoomDto.RoomTypeId);
            if (Roomtype == null)
            {
                throw new Exception("RoomType not found");
            }

            room.RoomNumber = RoomDto.RoomNumber;
            room.CurrentStatus = RoomDto.CurrentStatus;
            room.RoomTypeId = RoomDto.RoomTypeId;
            room.UpdateAt = DateTime.Now;

            await _dBContext.SaveChangesAsync();
            return room;
        }
    }
}
