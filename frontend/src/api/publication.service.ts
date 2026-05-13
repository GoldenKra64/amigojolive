import { apiClient } from './client';
import type {
  ApiResponse,
  Publication,
} from '../types';

export async function getPublications(): Promise<Publication[]> {
  const response = await apiClient.get<ApiResponse<Publication[]>>('/publications');
  return response.data.data;
}

export async function createPublication(
  payload: FormData
): Promise<Publication> {
  const response = await apiClient.post<ApiResponse<Publication>>(
    '/publications',
    payload,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

export async function deletePublication(id: number): Promise<void> {
  await apiClient.delete(`/publications/${id}`);
}
