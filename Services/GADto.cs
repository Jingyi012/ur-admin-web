namespace ur_admin_web.Services
{
    public class StatisticSummaryDto
    {
        public int ActiveUsers { get; set; }
        public double AverageSessionDuration { get; set; } // in seconds
        public float EngagementRate { get; set; } // decimal, e.g., 0.58 = 58%
        public int NewUsers { get; set; }
    }

    public class CityCountryUserDto
    {
        public string City { get; set; }
        public string Country { get; set; }
        public int ActiveUsers { get; set; }
    }

    public class PageViewStatsDto
    {
        public string PagePath { get; set; }
        public int ActiveUsers { get; set; }
        public int ScreenPageViews { get; set; }
        public float EngagementRate { get; set; }
        public int NewUsers { get; set; }
    }
}
