import httpClient from './httpService';

// Define the API version
const API_VERSION = '/v1';

/** Get News images by ID */
export async function getNewsImagesById(id: number, options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/news/${id}/images`, { ...options });
}

/** Add a new News Image */
export async function addNewsImages(
  newsId: number,
  imageFiles: any[],
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  formData.append('NewsId', newsId.toString());

  imageFiles.forEach((file) => {
    if (file.originFileObj) {
      formData.append('ImageFiles', file.originFileObj);
    } else {
      console.warn('Skipping invalid file:', file);
    }
  });

  return httpClient.post(`${API_VERSION}/news/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...options,
  });
}

/** Reorder News Image */
export async function newsImageReorder(
  body: {
    newsId: number;
    images: {
      imageUrl: string;
      order: number;
    }[];
  },
  options?: { [key: string]: any },
) {
  return httpClient.put(`${API_VERSION}/news/images/reorder`, body, { ...options });
}

/** Delete a News Image */
export async function removeNewsImage(
  params: {
    imageUrl: string;
  },
  options?: { [key: string]: any },
) {
  return httpClient.delete(`${API_VERSION}/news/images?imageUrl=${params.imageUrl}`, {
    ...options,
  });
}
