// src/utils/apiService.ts
import axios from 'axios';
import type { Capsule } from '@/stores/capsule.ts';

const api = axios.create({
  baseURL: 'http://localhost:9999/api/v1',
  timeout: 5000
});

export interface PaginatedCapsuleResponse {
  data: Capsule[];
  total: number;
  page: number;
  perPage: number;
}

export const capsuleApi = {
  // 获取全部胶囊（不分页，用于完整刷新）
  getAll() {
    return api.get<Capsule[]>('/capsules');
  },
  // 获取分页胶囊
  getAllPaginated(page: number, perPage: number = 50) {
    return api.get<PaginatedCapsuleResponse>(`/capsules?page=${page}&per_page=${perPage}`);
  },
  // 创建胶囊
  create(data: Omit<Capsule, 'id' | 'createdAt'>) {
    return api.post('/capsules', data);
  },
  update(id: number, data: Omit<Capsule, 'id' | 'createdAt'>) {
    return api.put(`/capsules/${id}`, data);
  },
  // 删除胶囊
  delete(id: number) {
    return api.delete(`/capsules/${id}`);
  },
  // 删除所有胶囊
  deleteAll() {
    return api.delete('/capsules');
  }
};