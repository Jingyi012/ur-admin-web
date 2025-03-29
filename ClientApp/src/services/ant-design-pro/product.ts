import { SortByOption } from '@/enum/SortByOptionEnum';
import httpClient from './httpService';

// Define the API version
const API_VERSION = '/v1';

/** Get Product Category */
export async function getProductCategory(options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/productCategory`, { ...options });
}

/** Get Product List */
export async function getProducts(
  params: {
    pageNumber?: number;
    pageSize?: number;
    name?: string;
    productCategoryId?: number;
    manufacturer?: string;
    isActive?: boolean;
    sortBy?: SortByOption;
  },
  options?: { [key: string]: any },
) {
  return httpClient.get(`${API_VERSION}/product`, {
    params: { ...params },
    ...options,
  });
}

/** Get Product by ID */
export async function getProductById(id: string, options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/product/${id}`, { ...options });
}

/** Add a new Product */
export async function addProduct(
  body: {
    name: string;
    description?: string;
    productCategoryId: number;
    manufacturer: string;
    isActive: boolean;
  },
  options?: { [key: string]: any },
) {
  return httpClient.post(`${API_VERSION}/product`, body, { ...options });
}

/** Update an existing Product */
export async function updateProduct(
  id: number,
  body: {
    name: string;
    description?: string;
    productCategoryId: number;
    manufacturer: string;
    isActive: boolean;
  },
  options?: { [key: string]: any },
) {
  return httpClient.put(`${API_VERSION}/product/${id}`, { id, ...body }, { ...options });
}

/** Delete a Product */
export async function removeProduct(id: number, options?: { [key: string]: any }) {
  return httpClient.delete(`${API_VERSION}/product/${id}`, { ...options });
}
