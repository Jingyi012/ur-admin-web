import httpClient from './httpService';

// Define the API version
const API_VERSION = '/v1';

/** Get Project List */
export async function getProjects(
  params: {
    pageNumber?: number;
    pageSize?: number;
    name?: string;
    isActive?: boolean;
    isAdmin?: boolean;
  },
  options?: { [key: string]: any },
) {
  return httpClient.get(`${API_VERSION}/project`, {
    params: { ...params },
    ...options,
  });
}

/** Get Project by ID */
export async function getProjectById(id: string, options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/project/${id}`, { ...options });
}

/** Add a new Project */
export async function addProject(
  body: {
    name: string;
    description?: string;
    date: string;
    latitude: number;
    longitude: number;
    images?: string[];
    isActive: boolean;
  },
  options?: { [key: string]: any },
) {
  return httpClient.post(`${API_VERSION}/project`, body, { ...options });
}

/** Update an existing Project */
export async function updateProject(
  id: number,
  body: {
    name: string;
    description?: string;
    date: string;
    latitude: number;
    longitude: number;
    images?: string[];
    isActive: boolean;
  },
  options?: { [key: string]: any },
) {
  return httpClient.put(`${API_VERSION}/project/${id}`, { id, ...body }, { ...options });
}

/** Delete a Project */
export async function removeProject(id: number, options?: { [key: string]: any }) {
  return httpClient.delete(`${API_VERSION}/project/${id}`, { ...options });
}
