import { EnquiryStatus, EnquiryType } from '@/enum/EnquiryEnum';
import httpClient from './httpService';

// Define the API version
const API_VERSION = '/v1';

/** Get Enquiry List */
export async function getEnquiries(
  params: {
    pageNumber?: number;
    pageSize?: number;
    name?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    type?: EnquiryType;
    status?: EnquiryStatus;
    assignedTo?: string;
  },
  options?: { [key: string]: any },
) {
  return httpClient.get(`${API_VERSION}/enquiry`, {
    params: { ...params },
    ...options,
  });
}

/** Get Enquiry by ID */
export async function getEnquiryById(id: number, options?: { [key: string]: any }) {
  return httpClient.get(`${API_VERSION}/enquiry/${id}`, { ...options });
}

/** Add a new Enquiry */
export async function addEnquiry(
  body: {
    name?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    type?: EnquiryType;
    message?: string;
  },
  options?: { [key: string]: any },
) {
  return httpClient.post(`${API_VERSION}/enquiry`, body, { ...options });
}

/** Update an existing Enquiry */
export async function updateEnquiry(
  id: number,
  body: {
    status?: EnquiryStatus;
    assignedTo?: string;
    remarks?: string;
  },
  options?: { [key: string]: any },
) {
  return httpClient.put(`${API_VERSION}/enquiry/${id}`, { id, ...body }, { ...options });
}

/** Delete a Enquiry */
export async function removeEnquiry(id: number, options?: { [key: string]: any }) {
  return httpClient.delete(`${API_VERSION}/enquiry/${id}`, { ...options });
}
