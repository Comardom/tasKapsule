// src/utils/apiService.ts
import type { Capsule } from '@/stores/capsule.ts'

export interface PaginatedCapsuleResponse {
  data: Capsule[]
  total: number
  page: number
  perPage: number
}

export const capsuleApi = {
  async getAll(): Promise<Capsule[]> {
    const res = await window.go.main.App.GetCapsules(0, 0)
    return res.Data
  },
  async getAllPaginated(page: number, perPage = 50): Promise<PaginatedCapsuleResponse> {
    const res = await window.go.main.App.GetCapsules(page, perPage)
    return { data: res.Data, total: res.Total, page: res.Page, perPage: res.PerPage }
  },
  async create(data: Omit<Capsule, 'id' | 'createdAt'>): Promise<Capsule> {
    return await window.go.main.App.CreateCapsule(data)
  },
  async update(id: number, data: Omit<Capsule, 'id' | 'createdAt'>): Promise<Capsule> {
    return await window.go.main.App.UpdateCapsule(id, data)
  },
  async delete(id: number): Promise<void> {
    await window.go.main.App.DeleteCapsule(id)
  },
}