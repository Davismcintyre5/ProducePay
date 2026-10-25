import api from './axios';
import type { ApiResponse } from '../types';

export type BackupRecord = {
  id: string;
  filename: string;
  cloudinaryUrl: string;
  sizeBytes: number;
  type: 'auto' | 'manual';
  createdAt: string;
};

export async function list(): Promise<ApiResponse<{ backups: BackupRecord[] }>> {
  const res = await api.get<ApiResponse<{ backups: BackupRecord[] }>>('/backups');
  return res.data;
}

export async function create(): Promise<ApiResponse<{ backup: BackupRecord }>> {
  const res = await api.post<ApiResponse<{ backup: BackupRecord }>>('/backups/create');
  return res.data;
}

export async function remove(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  const res = await api.delete<ApiResponse<{ deleted: boolean }>>(`/backups/${id}`);
  return res.data;
}