import api from './axios';
import type { Settings, ApiResponse } from '../types';

export async function get(): Promise<ApiResponse<{ settings: Settings }>> {
  const res = await api.get<ApiResponse<{ settings: Settings }>>('/settings');
  return res.data;
}

export async function update(payload: Partial<Settings>): Promise<ApiResponse<{ settings: Settings }>> {
  const res = await api.patch<ApiResponse<{ settings: Settings }>>('/settings', payload);
  return res.data;
}