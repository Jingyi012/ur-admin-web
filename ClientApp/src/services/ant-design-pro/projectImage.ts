import httpClient from './httpService';

// Define the API version
const API_VERSION = '/v1';

/** Get Project images by ID */
export async function getProjectImagesById(id: number, options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/project/${id}/images`, { ...options });
}

/** Add a new Project Image */
export async function addProjectImages(
  projectId: number,
  imageFiles: any[],
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  formData.append('ProjectId', projectId.toString());

  imageFiles.forEach((file) => {
    if (file.originFileObj) {
      formData.append('ImageFiles', file.originFileObj);
    } else {
      console.warn('Skipping invalid file:', file);
    }
  });

  return httpClient.post(`${API_VERSION}/project/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...options,
  });
}

/** Reorder Project Image */
export async function projectImageReorder(
  body: {
    projectId: number;
    images: {
      imageUrl: string;
      order: number;
    }[];
  },
  options?: { [key: string]: any },
) {
  return httpClient.put(`${API_VERSION}/project/images/reorder`, body, { ...options });
}

/** Delete a Project Image */
export async function removeProjectImage(
  params: {
    imageUrl: string;
  },
  options?: { [key: string]: any },
) {
  return httpClient.delete(`${API_VERSION}/project/images?imageUrl=${params.imageUrl}`, {
    ...options,
  });
}
