import { apiClient } from './client';
import type {
  ApiResponse,
  LoginPayload,
  LoginResponse,
  MeResponse,
  RegisterRequestPayload,
  RegistrationRequest,
} from '../types';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    payload
  );
  return response.data.data;
}

export async function registerRequest(
  payload: RegisterRequestPayload
): Promise<RegistrationRequest> {
  const response = await apiClient.post<ApiResponse<RegistrationRequest>>(
    '/auth/register-request',
    payload
  );
  return response.data.data;
}

export async function fetchMe(): Promise<MeResponse> {
  const response = await apiClient.get<ApiResponse<MeResponse>>('/auth/me');
  return response.data.data;
}
