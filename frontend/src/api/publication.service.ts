import { apiClient } from './client';
import type {
  ApiResponse,
  Publication,
  Comment,
  ReactionSummary,
  ReactionType,
  PaginatedResponse,
} from '../types';

export interface ReactionState {
  reactionSummary: ReactionSummary;
  myReaction: ReactionType | null;
}

export async function getPublications(tagIds?: number[], page: number = 1, limit: number = 10): Promise<PaginatedResponse<Publication>> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (tagIds && tagIds.length > 0) {
    params.tagIds = tagIds.join(',');
  }
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Publication>>>('/publications', { params });
  return response.data.data;
}

export async function createPublication(
  payload: FormData
): Promise<Publication> {
  const response = await apiClient.post<ApiResponse<Publication>>(
    '/publications',
    payload
  );
  return response.data.data;
}

export async function updatePublication(
  id: number,
  payload: Partial<Publication>
): Promise<Publication> {
  const response = await apiClient.put<ApiResponse<Publication>>(
    `/publications/${id}`,
    payload
  );
  return response.data.data;
}

export async function deletePublication(id: number): Promise<void> {
  await apiClient.delete(`/publications/${id}`);
}

export async function addComment(
  postId: number,
  content: string
): Promise<Comment> {
  const response = await apiClient.post<ApiResponse<Comment>>(
    `/publications/${postId}/comments`,
    { content }
  );
  return response.data.data;
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`);
}

export async function setPublicationReaction(
  postId: number,
  type: ReactionType
): Promise<ReactionState> {
  const response = await apiClient.put<ApiResponse<ReactionState>>(
    `/publications/${postId}/reaction`,
    { type }
  );
  return response.data.data;
}

export async function removePublicationReaction(
  postId: number
): Promise<ReactionState> {
  const response = await apiClient.delete<ApiResponse<ReactionState>>(
    `/publications/${postId}/reaction`
  );
  return response.data.data;
}
