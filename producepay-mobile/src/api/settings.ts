import api from './axios';
import type { Settings, ApiResponse } from '../types';

export async function get(): Promise<ApiResponse<{ settings: Settings }>> {
  const res = await api.get<ApiResponse<{ settings: Settings }>>('/settings');
  return res.data;
}