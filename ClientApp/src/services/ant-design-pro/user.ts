import httpClient from './httpService';

// Define the API version
const API_VERSION = '/v1';

/** Get User Name List */
export async function getUserOptions(options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/user/options`, { ...options });
}

/** Get User List */
export async function getUsers(
  params: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
  },
  options?: { [key: string]: any },
) {
  return httpClient.get(`${API_VERSION}/user`, {
    params: { ...params },
    ...options,
  });
}

/** Get User by ID */
export async function getUserById(id: string, options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/user/${id}`, { ...options });
}

/** Add a new User */
export async function addUser(
  body: {
    email: string;
    userName: string;
    password: string;
    roles: string[];
  },
  options?: { [key: string]: any },
) {
  return httpClient.post(
    `${API_VERSION}/user`,
    { confirmPassword: body.password, ...body },
    { ...options },
  );
}

/** Update an existing User */
export async function updateUser(
  id: string,
  body: {
    email?: string;
    userName?: string;
    roles?: string[];
  },
  options?: { [key: string]: any },
) {
  return httpClient.put(`${API_VERSION}/user/${id}`, { ...body }, { ...options });
}

/** Delete a User */
export async function removeUser(id: string, options?: { [key: string]: any }) {
  return httpClient.delete(`${API_VERSION}/user/${id}`, { ...options });
}
