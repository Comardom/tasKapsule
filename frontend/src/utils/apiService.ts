// src/utils/apiService.ts
import axios from 'axios';
import type { Capsule } from '@/stores/capsule.ts';

const api = axios.create({
  baseURL: 'http://localhost:9999/api/v1',
  timeout: 5000
});

export const capsuleApi = {
  // 获取某天的胶囊
  getByDate(date: string) {
    // 明确告诉请求返回的是一个数组
    return api.get<Capsule[]>('/capsules', { params: { date } });
  },
  // 创建胶囊,omit把后端自动生成的字段排除掉，前端传参时 IDE 会提示只填 title、content 等
  create(data: Omit<Capsule, 'id' | 'createdAt'>) {
    return api.post('/capsules', data);
  },
  // 删除胶囊
  delete(id: number) {
    return api.delete(`/capsules/${id}`);
  }
};