import api from './axios';
import type { Delivery, Payment, ApiResponse } from '../types';

export async function create(payload: any): Promise<ApiResponse<{ delivery: Delivery; payment: Payment }>> {
  const res = await api.post<ApiResponse<{ delivery: Delivery; payment: Payment }>>('/deliveries', payload);
  return res.data;
}

export async function list(params: any = {}): Promise<ApiResponse<Delivery[]>> {
  const res = await api.get<ApiResponse<Delivery[]>>('/deliveries', { params });
  return res.data;
}

export async function get(id: string): Promise<ApiResponse<{ delivery: Delivery }>> {
  const res = await api.get<ApiResponse<{ delivery: Delivery }>>(`/deliveries/${id}`);
  return res.data;
}

export async function update(id: string, payload: any): Promise<ApiResponse<{ delivery: Delivery }>> {
  const res = await api.patch<ApiResponse<{ delivery: Delivery }>>(`/deliveries/${id}`, payload);
  return res.data;
}

export async function remove(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  const res = await api.delete<ApiResponse<{ deleted: boolean }>>(`/deliveries/${id}`);
  return res.data;
}