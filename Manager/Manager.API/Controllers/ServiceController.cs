using Manager.API.Dtos.Services;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/Service")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly IServicesRepository _servicesRepository;
        public ServiceController(IServicesRepository repository)
        {
            _servicesRepository = repository;
        }
        [HttpGet]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _servicesRepository.GetAllAsync(page, limit);

            if (result.Data == null || result.Data.Count == 0)
            {
                return NotFound("No Service found.");
            }

            var serviceDtos = result.Data
                .Select(s => s.ToServicesDto())
                .ToList();

            return Ok(new
            {
                result.Page,
                result.Limit,
                result.TotalCount,
                result.TotalPages,
                data = serviceDtos
            });
        }
        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var serviceModel = await _servicesRepository.GetByIdAsync(id);
            if (serviceModel == null)
            {
                return NotFound($"No Service found with id {id}.");
            }
            var serviceDto = serviceModel.ToServicesDto();
            return Ok(serviceDto);
        }
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(CreateServicesRequestDto createServiceRequestDto)
        {
            var serviceModel = createServiceRequestDto.ToServicesUpdateDto();
            var createdService = await _servicesRepository.CreateAsync(serviceModel);
            var serviceDto = createdService.ToServicesDto();
            return CreatedAtAction(nameof(GetById), new { id = serviceDto.Id }, serviceDto);
        }

        [HttpPut]
        [Route("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateServicesRequestDto updateServiceRequestDto)
        {
            var updatedService = await _servicesRepository.UpdateAsync(id, updateServiceRequestDto);
            if (updatedService == null)
            {
                return NotFound($"No Service found with id {id}.");
            }
            var serviceDto = updatedService.ToServicesDto();
            return Ok(serviceDto);
        }
        [HttpDelete]
        [Route("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deletedService = await _servicesRepository.DeleteAsync(id);
            if (deletedService == null)
            {
                return NotFound($"No Service found with id {id}.");
            }
            var serviceDto = deletedService.ToServicesDto();
            return Ok(serviceDto);
        }
    }
}
