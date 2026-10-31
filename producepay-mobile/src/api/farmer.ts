import api from './axios';
import type { Farmer, ApiResponse } from '../types';

export async function list(params: {
  q?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ApiResponse<Farmer[]>> {
  const res = await api.get<ApiResponse<Farmer[]>>('/farmers', { params });
  return res.data;
}

export async function get(id: string): Promise<ApiResponse<{ farmer: Farmer }>> {
  const res = await api.get<ApiResponse<{ farmer: Farmer }>>(`/farmers/${id}`);
  return res.data;
}

export async function statement(id: string): Promise<ApiResponse<any>> {
  const res = await api.get<ApiResponse<any>>(`/farmers/${id}/statement`);
  return res.data;
}

export async function create(payload: any): Promise<ApiResponse<{ farmer: Farmer }>> {
  const res = await api.post<ApiResponse<{ farmer: Farmer }>>('/farmers', payload);
  return res.data;
}

export async function update(id: string, payload: any): Promise<ApiResponse<{ farmer: Farmer }>> {
  const res = await api.patch<ApiResponse<{ farmer: Farmer }>>(`/farmers/${id}`, payload);
  return res.data;
}