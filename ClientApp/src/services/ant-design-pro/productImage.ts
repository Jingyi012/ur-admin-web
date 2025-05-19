import httpClient from './httpService';

// Define the API version
const API_VERSION = '/v1';

/** Get Product images by ID */
export async function getProductImagesById(id: number, options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/product/${id}/images`, { ...options });
}

/** Add a new Product Image */
export async function addProductImages(
  productId: number,
  imageFiles: any[],
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  formData.append('ProductId', productId.toString());

  imageFiles.forEach((file) => {
    if (file.originFileObj) {
      formData.append('ImageFiles', file.originFileObj);
    } else {
      console.warn('Skipping invalid file:', file);
    }
  });

  return httpClient.post(`${API_VERSION}/product/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...options,
  });
}

/** Reorder Product Image */
export async function productImageReorder(
  body: {
    productId: number;
    images: {
      imageUrl: string;
      order: number;
    }[];
  },
  options?: { [key: string]: any },
) {
  return httpClient.put(`${API_VERSION}/product/images/reorder`, body, { ...options });
}

/** Delete a Product Image */
export async function removeProductImage(
  params: {
    imageUrl: string;
  },
  options?: { [key: string]: any },
) {
  return httpClient.delete(`${API_VERSION}/product/images?imageUrl=${params.imageUrl}`, {
    ...options,
  });
}
