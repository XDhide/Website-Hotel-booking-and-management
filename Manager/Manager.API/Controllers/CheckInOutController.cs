using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Manager.API.Dtos.CheckInOut;
using Manager.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/CheckInOut")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")]
    public class CheckInOutController : ControllerBase
    {
        private readonly ICheckInOutRepository _checkInOutRepository;

        public CheckInOutController(ICheckInOutRepository checkInOutRepository)
        {
            _checkInOutRepository = checkInOutRepository;
        }

        [HttpPost("checkin")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _checkInOutRepository.CheckInAsync(dto.BookingId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> CheckOut([FromBody] CheckOutRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _checkInOutRepository.CheckOutAsync(dto.BookingId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("transfer-room")]
        public async Task<IActionResult> TransferRoom([FromBody] TransferRoomRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _checkInOutRepository.TransferRoomAsync(
                    dto.BookingId, dto.NewRoomId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("extend")]
        public async Task<IActionResult> Extend([FromBody] ExtendBookingRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _checkInOutRepository.ExtendBookingAsync(
                    dto.BookingId, dto.NewCheckOutDate);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
