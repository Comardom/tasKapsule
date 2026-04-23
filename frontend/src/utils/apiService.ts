// src/utils/apiService.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9999/api/v1',
  timeout: 5000
});

export const capsuleApi = {
  // 获取某天的胶囊
  getByDate(date: string) {
    // 明确告诉请求返回的是一个数组
    return api.get<any[]>('/capsules', { params: { date } });
  },
  // 创建胶囊
  create(data: any) {
    return api.post('/capsules', data);
  },
  // 删除胶囊
  delete(id: number) {
    return api.delete(`/capsules/${id}`);
  }
};