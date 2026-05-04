import { apiClient } from './client';
import type { ApiResponse, MeResponse, UpdateProfilePayload } from '../types';

export async function getMyProfile(): Promise<MeResponse> {
  const response = await apiClient.get<ApiResponse<MeResponse>>('/profiles/me');
  return response.data.data;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload
): Promise<MeResponse> {
  const response = await apiClient.patch<ApiResponse<MeResponse>>(
    '/profiles/me',
    payload
  );
  return response.data.data;
}
