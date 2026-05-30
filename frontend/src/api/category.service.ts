import { apiClient } from './client';
import type { ApiResponse } from '../types';

export interface Category {
  id: number;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
  return response.data.data;
}
