import api from './axios';
import type { Delivery, Payment, ApiResponse } from '../types';

export type CreateDeliveryInput = {
  farmerId: string;
  weightKg: number;
  collectedAt: string;
  notes?: string;
  clientRequestId: string;
};

export async function create(
  input: CreateDeliveryInput
): Promise<ApiResponse<{ delivery: Delivery; payment: Payment; duplicate?: boolean }>> {
  const res = await api.post<ApiResponse<{ delivery: Delivery; payment: Payment }>>(
    '/deliveries',
    input
  );
  return res.data;
}

export async function list(params: {
  farmerId?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ApiResponse<Delivery[]>> {
  const res = await api.get<ApiResponse<Delivery[]>>('/deliveries', { params });
  return res.data;
}

export async function get(id: string): Promise<ApiResponse<{ delivery: Delivery }>> {
  const res = await api.get<ApiResponse<{ delivery: Delivery }>>(`/deliveries/${id}`);
  return res.data;
}