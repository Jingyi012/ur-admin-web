import httpClient from './httpService';

const API_VERSION = '/v1';

/** Get Product Categories (list) */
export async function getProductCategoryList(
  params?: { pageNumber?: number; pageSize?: number },
  options?: { [key: string]: any },
) {
  return httpClient.get(`${API_VERSION}/productCategory`, { params: { ...params }, ...options });
}

/** Get Product Category by ID */
export async function getProductCategoryById(id: number, options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/productCategory/${id}`, { ...options });
}

/** Create Product Category (with image) */
export async function createProductCategory(
  data: { name: string; imageFile?: any },
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  formData.append('Name', data.name);
  if (data.imageFile && data.imageFile.originFileObj) {
    formData.append('ImageFile', data.imageFile.originFileObj);
  }

  return httpClient.post(`${API_VERSION}/productCategory`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...options,
  });
}

/** Update Product Category (with image) */
export async function updateProductCategory(
  id: number,
  data: { name?: string; imageFile?: any },
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  if (id) formData.append('Id', id.toString());
  if (data.name) formData.append('Name', data.name);
  if (data.imageFile && data.imageFile.originFileObj) {
    formData.append('ImageFile', data.imageFile.originFileObj);
  }

  return httpClient.put(`${API_VERSION}/productCategory/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...options,
  });
}

/** Delete Product Category */
export async function removeProductCategory(id: number, options?: { [key: string]: any }) {
  return httpClient.delete(`${API_VERSION}/productCategory/${id}`, { ...options });
}
