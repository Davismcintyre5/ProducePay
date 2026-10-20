import api from './axios';
import type { User, ApiResponse } from '../types';

export async function list(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<User[]>> {
  const res = await api.get<ApiResponse<User[]>>('/users', { params });
  return res.data;
}

export async function create(payload: any): Promise<ApiResponse<{ user: User }>> {
  const res = await api.post<ApiResponse<{ user: User }>>('/users', payload);
  return res.data;
}

export async function update(id: string, payload: any): Promise<ApiResponse<{ user: User }>> {
  const res = await api.patch<ApiResponse<{ user: User }>>(`/users/${id}`, payload);
  return res.data;
}

export async function remove(id: string): Promise<ApiResponse<{ deactivated: boolean }>> {
  const res = await api.delete<ApiResponse<{ deactivated: boolean }>>(`/users/${id}`);
  return res.data;
}

export async function resetPassword(id: string, payload: any): Promise<ApiResponse<{ reset: boolean }>> {
  const res = await api.post<ApiResponse<{ reset: boolean }>>(`/users/${id}/reset-password`, payload);
  return res.data;
}