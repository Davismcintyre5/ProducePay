import api from './axios';
import type { ApiResponse } from '../types';

export async function dashboard() {
  const res = await api.get<ApiResponse<any>>('/reports/dashboard');
  return res.data;
}

export async function weekly() {
  const res = await api.get<ApiResponse<any>>('/reports/weekly');
  return res.data;
}