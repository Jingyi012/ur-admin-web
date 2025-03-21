import httpClient from './httpService';

// Define the API version
const API_VERSION = '/v1';

/** Get Dashboard Statistic */
export async function getDashboardStatistic(options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/dashboard`, {
    ...options,
  });
}
