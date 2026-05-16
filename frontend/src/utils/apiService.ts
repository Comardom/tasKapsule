// src/utils/apiService.ts
import axios from 'axios';
import type { Capsule } from '@/stores/capsule.ts';

const api = axios.create({
  baseURL: 'http://localhost:9999/api/v1',
  timeout: 5000
});

export const capsuleApi = {
  // 获取某天的胶囊
  getAll() {
    // 明确告诉请求返回的是一个数组
    return api.get<Capsule[]>('/capsules');
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
  }
};