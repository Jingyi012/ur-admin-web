using Google.Analytics.Data.V1Beta;

namespace ur_admin_web.Services
{
    public class GAService
    {
        private readonly string _propertyId;
        private readonly string _credentials;
        private readonly BetaAnalyticsDataClient _analyticsDataClient;

        public GAService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _propertyId =
                configuration["GASettings:PropertyId"]
                ?? throw new ArgumentNullException(
                    "PropertyId is not configured in appsettings.json"
                );

            _credentials =
                configuration["GASettings:CredentialsJson"]
                ?? throw new ArgumentNullException(
                    "CredentialsJson is not configured in appsettings.json"
                );

            var builder = new BetaAnalyticsDataClientBuilder
            {
                JsonCredentials = _credentials,
            };

            _analyticsDataClient = builder.Build();
        }

        public async Task<StatisticSummaryDto> GetStatistic(string startDate, string endDate)
        {
            var request = new RunReportRequest
            {
                Property = $"properties/{_propertyId}",
                DateRanges =
                {
                    new DateRange { StartDate = startDate, EndDate = endDate },
                },
                Metrics =
                {
                    new Metric { Name = "activeUsers" },
                    new Metric { Name = "averageSessionDuration" },
                    new Metric { Name = "engagementRate" },
                    new Metric { Name = "newUsers" },
                },
            };

            var response = _analyticsDataClient.RunReport(request);

            var row = response.Rows.FirstOrDefault();

            if (row == null) return null;

            return new StatisticSummaryDto
            {
                ActiveUsers = int.Parse(row.MetricValues[0].Value),
                AverageSessionDuration = double.Parse(row.MetricValues[1].Value),
                EngagementRate = float.Parse(row.MetricValues[2].Value),
                NewUsers = int.Parse(row.MetricValues[3].Value)
            };
        }

        public async Task<List<PageViewStatsDto>> GetPageViews(string startDate, string endDate)
        {
            var request = new RunReportRequest
            {
                Property = $"properties/{_propertyId}",
                DateRanges =
                {
                    new DateRange { StartDate = startDate, EndDate = endDate },
                },
                Metrics =
                {
                    new Metric { Name = "activeUsers" },
                    new Metric { Name = "screenPageViews" },
                    new Metric { Name = "engagementRate" },
                    new Metric { Name = "newUsers" },
                },
                Dimensions =
                {
                    new Dimension { Name = "unifiedPagePathScreen" },
                },
            };

            var response = _analyticsDataClient.RunReport(request);

            var result = new List<PageViewStatsDto>();

            foreach (var row in response.Rows)
            {
                result.Add(new PageViewStatsDto
                {
                    PagePath = row.DimensionValues[0].Value,
                    ActiveUsers = int.Parse(row.MetricValues[0].Value),
                    ScreenPageViews = int.Parse(row.MetricValues[1].Value),
                    EngagementRate = float.Parse(row.MetricValues[2].Value),
                    NewUsers = int.Parse(row.MetricValues[3].Value)
                });
            }

            return result;
        }

        public async Task<List<CityCountryUserDto>> GetCityCountryUserStatsAsync(string startDate, string endDate)
        {
            var request = new RunReportRequest
            {
                Property = $"properties/{_propertyId}",
                DateRanges =
                {
                    new DateRange { StartDate = startDate, EndDate = endDate },
                },
                Metrics =
                {
                    new Metric { Name = "activeUsers" },
                },
                Dimensions =
                {
                    new Dimension { Name = "city" },
                    new Dimension { Name = "country" },
                },
            };

            var response = _analyticsDataClient.RunReport(request);

            var result = new List<CityCountryUserDto>();

            foreach (var row in response.Rows)
            {
                var city = row.DimensionValues[0].Value;
                var country = row.DimensionValues[1].Value;
                var activeUsers = int.Parse(row.MetricValues[0].Value);

                result.Add(new CityCountryUserDto
                {
                    City = city,
                    Country = country,
                    ActiveUsers = activeUsers
                });
            }

            return result;
        }
    }
}
