using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.RoomType;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/roomtype")]
    [ApiController]
    public class RoomTypeController : ControllerBase
    {
        private readonly IRoomTypeRepository _roomTypeRepository;
        private readonly IWebHostEnvironment _env;

        public RoomTypeController(IRoomTypeRepository roomTypeRepository, IWebHostEnvironment env)
        {
            _roomTypeRepository = roomTypeRepository;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _roomTypeRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No RoomType found.");
            var dtos = result.Data.Select(s => s.ToRoomTypeDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _roomTypeRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No RoomType found with id " + id + ".");
            return Ok(model.ToRoomTypeDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] CreateRoomTypeRequestDto dto)
        {
            var model = dto.ToCreateRoomTypeModel();
            var created = await _roomTypeRepository.CreateAsync(model);
            var resultDto = created.ToRoomTypeDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.Id }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateRoomTypeRequestDto dto)
        {
            var updated = await _roomTypeRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No RoomType found with id " + id + ".");
            return Ok(updated.ToRoomTypeDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _roomTypeRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No RoomType found with id " + id + ".");
            return Ok(deleted.ToRoomTypeDto());
        }

        // ── Images ────────────────────────────────────────────────────────────

        [HttpGet("{id}/images")]
        public async Task<IActionResult> GetImages(int id)
        {
            var images = await _roomTypeRepository.GetImagesAsync(id);
            var dtos = images.Select(i => i.ToRoomTypeImageDto()).ToList();
            return Ok(dtos);
        }

        /// <summary>Upload file ảnh thật, lưu vào wwwroot/uploads/roomtypes/</summary>
        [HttpPost("{id}/images/upload")]
        [Authorize(Roles = "Admin,Manager")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(int id, IFormFile file,
            [FromForm] string altText = "", [FromForm] int displayOrder = 0)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Không có file.");

            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowed.Contains(ext))
                return BadRequest("Chỉ hỗ trợ jpg, jpeg, png, webp, gif.");

            if (file.Length > 10 * 1024 * 1024)
                return BadRequest("File tối đa 10MB.");

            // Tạo thư mục lưu ảnh
            var uploadDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "roomtypes");
            Directory.CreateDirectory(uploadDir);

            // Tên file unique
            var fileName = $"{id}_{Guid.NewGuid():N}{ext}";
            var filePath  = Path.Combine(uploadDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
                await file.CopyToAsync(stream);

            var imageUrl = $"/uploads/roomtypes/{fileName}";

            var dto = new CreateRoomTypeImageRequestDto
            {
                ImageUrl     = imageUrl,
                AltText      = altText,
                DisplayOrder = displayOrder,
            };

            var image = dto.ToRoomTypeImageModel(id);
            var created = await _roomTypeRepository.AddImageAsync(id, image);
            if (created == null)
            {
                // Xóa file nếu DB lỗi
                System.IO.File.Delete(filePath);
                return NotFound("No RoomType found with id " + id + ".");
            }

            return Ok(created.ToRoomTypeImageDto());
        }

        /// <summary>Thêm ảnh bằng URL (giữ nguyên endpoint cũ)</summary>
        [HttpPost("{id}/images")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> AddImage(int id, [FromBody] CreateRoomTypeImageRequestDto dto)
        {
            var image = dto.ToRoomTypeImageModel(id);
            var created = await _roomTypeRepository.AddImageAsync(id, image);
            if (created == null)
                return NotFound("No RoomType found with id " + id + ".");
            return Ok(created.ToRoomTypeImageDto());
        }

        [HttpDelete("{id}/images/{imageId}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteImage(int id, int imageId)
        {
            // Xóa file vật lý nếu là file upload
            var img = await _roomTypeRepository.GetImageByIdAsync(imageId);
            if (img != null && img.ImageUrl.StartsWith("/uploads/"))
            {
                var fullPath = Path.Combine(_env.WebRootPath ?? "wwwroot", img.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);
            }

            var deleted = await _roomTypeRepository.DeleteImageAsync(imageId);
            if (deleted == null)
                return NotFound("No image found with id " + imageId + ".");
            return Ok(deleted.ToRoomTypeImageDto());
        }
    }
}
