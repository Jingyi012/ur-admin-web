using Microsoft.AspNetCore.Mvc;
using ur_admin_web.Services;

namespace ur_admin_web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GAController : ControllerBase
    {
        private readonly GAService _gaService;

        public GAController(GAService gaService)
        {
            _gaService = gaService;
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistic([FromQuery] string startDate, [FromQuery] string endDate)
        {
            var result = await _gaService.GetStatistic(startDate, endDate);
            return Ok(result);
        }

        [HttpGet("page-views")]
        public async Task<IActionResult> GetPageViews([FromQuery] string startDate, [FromQuery] string endDate)
        {
            var result = await _gaService.GetPageViews(startDate, endDate);
            return Ok(result);
        }

        [HttpGet("city-country-stats")]
        public async Task<IActionResult> GetCityCountryUserStatsAsync([FromQuery] string startDate, [FromQuery] string endDate)
        {
            var result = await _gaService.GetCityCountryUserStatsAsync(startDate, endDate);
            return Ok(result);
        }
    }
}
