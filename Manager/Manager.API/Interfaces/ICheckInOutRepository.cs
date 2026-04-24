using System.Threading.Tasks;
using Manager.API.Dtos.CheckInOut;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface ICheckInOutRepository
    {
        Task<CheckInOutResultDto> CheckInAsync(int bookingId);
        Task<CheckInOutResultDto> CheckOutAsync(int bookingId);
        Task<CheckInOutResultDto> TransferRoomAsync(int bookingId, int newRoomId);
        Task<CheckInOutResultDto> ExtendBookingAsync(int bookingId, DateTime newCheckOutDate);
    }
}
