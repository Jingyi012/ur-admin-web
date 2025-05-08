import httpClient from './httpService';

// Define the API version
const API_VERSION = '/v1';

/** Get Dashboard Statistic */
export async function getDashboardStatistic(options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/dashboard`, {
    ...options,
  });
}

export async function getGaStatistic(
  params: {
    startDate: string;
    endDate: string;
  },
  options?: { [key: string]: any },
) {
  return httpClient.get(`/ga/statistics`, {
    params,
    ...options,
  });
}

export async function GetGaPageViews(
  params: {
    startDate: string;
    endDate: string;
  },
  options?: { [key: string]: any },
) {
  return httpClient.get(`/ga/page-views`, {
    params,
    ...options,
  });
}

export async function GetGaCityCountryUserStats(
  params: {
    startDate: string;
    endDate: string;
  },
  options?: { [key: string]: any },
) {
  return httpClient.get(`/ga/city-country-stats`, {
    params,
    ...options,
  });
}
