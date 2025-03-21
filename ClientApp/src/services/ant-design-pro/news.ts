import httpClient from './httpService';

// Define the API version
const API_VERSION = '/v1';

/** Get News List */
export async function getNews(
  params: {
    pageNumber?: number;
    pageSize?: number;
    title?: string;
    year?: number;
    isActive?: boolean;
  },
  options?: { [key: string]: any },
) {
  return httpClient.get(`${API_VERSION}/news`, {
    params: { ...params },
    ...options,
  });
}

/** Get News by ID */
export async function getNewsById(id: string, options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/news/${id}`, { ...options });
}

/** Add a new News */
export async function addNews(
  body: {
    title: string;
    description?: string;
    images?: string[];
    date: string;
    isActive: boolean;
  },
  options?: { [key: string]: any },
) {
  return httpClient.post(`${API_VERSION}/news`, body, { ...options });
}

/** Update an existing News */
export async function updateNews(
  id: number,
  body: {
    title: string;
    description?: string;
    images?: string[];
    date: string;
    isActive: boolean;
  },
  options?: { [key: string]: any },
) {
  return httpClient.put(`${API_VERSION}/news/${id}`, { id, ...body }, { ...options });
}

/** Delete a News */
export async function removeNews(id: number, options?: { [key: string]: any }) {
  return httpClient.delete(`${API_VERSION}/news/${id}`, { ...options });
}
