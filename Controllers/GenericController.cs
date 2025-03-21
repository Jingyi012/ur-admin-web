using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using System.Net.Http.Headers;

namespace ur_admin_web.Controllers
{
    [Route("api")]
    [ApiController]
    public class GenericController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;

        public GenericController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _baseUrl = configuration["BaseUrl"] ?? throw new ArgumentNullException("BaseUrl is not configured in appsettings.json");
        }

        // Dynamic GET method
        [HttpGet("{*path}")]
        public async Task<IActionResult> DynamicGet(string path, [FromQuery] Dictionary<string, string> queryParams)
        {
            // Build the target URL
            var queryString = string.Join("&", queryParams.Select(q => $"{q.Key}={q.Value}"));
            var targetUrl = $"{_baseUrl}/{path}?{queryString}";

            try
            {
                using var requestMessage = new HttpRequestMessage(HttpMethod.Get, targetUrl);

                // Forward Authorization Header
                if (Request.Headers.TryGetValue("Authorization", out Microsoft.Extensions.Primitives.StringValues value))
                {
                    requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer",
                        value.ToString().Replace("Bearer ", ""));
                }

                // Forward the request
                var response = await _httpClient.SendAsync(requestMessage);

                // Read response
                var result = await response.Content.ReadAsStringAsync();

                return response.IsSuccessStatusCode
                    ? Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json")
                    : StatusCode((int)response.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error forwarding GET request: {ex.Message}");
            }
        }

        // Dynamic POST method
        [HttpPost("{*path}")]
        public async Task<IActionResult> DynamicPost(string path, [FromBody] JsonElement requestBody)
        {
            // Build the target URL
            var targetUrl = $"{_baseUrl}/{path}";

            try
            {
                using var requestMessage = new HttpRequestMessage(HttpMethod.Post, targetUrl);

                // Forward request body
                requestMessage.Content = new StringContent(requestBody.GetRawText(), Encoding.UTF8, "application/json");

                // Forward Authorization Header
                if (Request.Headers.TryGetValue("Authorization", out Microsoft.Extensions.Primitives.StringValues value))
                {
                    requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer",
                        value.ToString().Replace("Bearer ", ""));
                }

                // Forward the request
                var response = await _httpClient.SendAsync(requestMessage);

                // Read response
                var result = await response.Content.ReadAsStringAsync();

                return response.IsSuccessStatusCode
                    ? Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json")
                    : StatusCode((int)response.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error forwarding POST request: {ex.Message}");
            }
        }

        // Dynamic PUT method
        [HttpPut("{*path}")]
        public async Task<IActionResult> DynamicPut(string path, [FromBody] JsonElement requestBody)
        {
            // Build the target URL
            var targetUrl = $"{_baseUrl}/{path}";

            try
            {
                using var requestMessage = new HttpRequestMessage(HttpMethod.Put, targetUrl);

                // Forward request body
                requestMessage.Content = new StringContent(requestBody.GetRawText(), Encoding.UTF8, "application/json");

                // Forward Authorization Header
                if (Request.Headers.TryGetValue("Authorization", out Microsoft.Extensions.Primitives.StringValues value))
                {
                    requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer",
                        value.ToString().Replace("Bearer ", ""));
                }

                // Forward the request
                var response = await _httpClient.SendAsync(requestMessage);

                // Read response
                var result = await response.Content.ReadAsStringAsync();

                return response.IsSuccessStatusCode
                    ? Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json")
                    : StatusCode((int)response.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error forwarding PUT request: {ex.Message}");
            }
        }

        // Dynamic DELETE method
        [HttpDelete("{*path}")]
        public async Task<IActionResult> DynamicDelete(string path, [FromQuery] Dictionary<string, string> queryParams)
        {
            // Build the target URL
            var queryString = string.Join("&", queryParams.Select(q => $"{q.Key}={q.Value}"));
            var targetUrl = $"{_baseUrl}/{path}?{queryString}";

            try
            {
                using var requestMessage = new HttpRequestMessage(HttpMethod.Delete, targetUrl);

                // Forward Authorization Header
                if (Request.Headers.TryGetValue("Authorization", out Microsoft.Extensions.Primitives.StringValues value))
                {
                    requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer",
                        value.ToString().Replace("Bearer ", ""));
                }

                // Forward the request
                var response = await _httpClient.SendAsync(requestMessage);

                // Read response
                var result = await response.Content.ReadAsStringAsync();

                return response.IsSuccessStatusCode
                    ? Content(result, response.Content.Headers.ContentType?.ToString() ?? "application/json")
                    : StatusCode((int)response.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error forwarding DELETE request: {ex.Message}");
            }
        }
    }
}
