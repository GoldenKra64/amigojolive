import { apiClient } from './client';
import type {
  AdminUser,
  ApiResponse,
  RegistrationRequest,
  RegistrationRequestStatus,
  UserStatus,
} from '../types';

export async function getUsers(): Promise<AdminUser[]> {
  const response = await apiClient.get<ApiResponse<AdminUser[]>>(
    '/admin/users'
  );
  return response.data.data;
}

export async function updateUserStatus(
  userId: number,
  status: UserStatus
): Promise<AdminUser> {
  const response = await apiClient.patch<ApiResponse<AdminUser>>(
    `/admin/users/${userId}/status`,
    { status }
  );
  return response.data.data;
}

export async function getRegistrationRequests(
  status?: RegistrationRequestStatus
): Promise<RegistrationRequest[]> {
  const response = await apiClient.get<ApiResponse<RegistrationRequest[]>>(
    '/admin/registration-requests',
    {
      params: status ? { status } : undefined,
    }
  );
  return response.data.data;
}

export async function approveRegistrationRequest(requestId: number) {
  const response = await apiClient.patch<ApiResponse<unknown>>(
    `/admin/registration-requests/${requestId}/approve`
  );
  return response.data;
}

export async function rejectRegistrationRequest(
  requestId: number,
  reviewComment?: string
) {
  const response = await apiClient.patch<ApiResponse<unknown>>(
    `/admin/registration-requests/${requestId}/reject`,
    { reviewComment }
  );
  return response.data;
}
