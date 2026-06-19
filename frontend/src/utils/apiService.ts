import type { Capsule } from '@/stores/capsule.ts'

const $Call = window.wails.Call

export interface PaginatedCapsuleResponse {
  data: Capsule[]
  total: number
  page: number
  perPage: number
}

export const capsuleApi = {
  async getAll(page = 0, perPage = 0): Promise<Capsule[]> {
    const res = await $Call.ByName('main.CapsuleService.GetCapsules', page, perPage)
    return res.data
  },
  async getAllPaginated(page: number, perPage = 50): Promise<PaginatedCapsuleResponse> {
    const res = await $Call.ByName('main.CapsuleService.GetCapsules', page, perPage)
    return { data: res.data, total: res.total, page: res.page, perPage: res.perPage }
  },
  async create(data: Omit<Capsule, 'id' | 'createdAt'>): Promise<Capsule> {
    return await $Call.ByName('main.CapsuleService.CreateCapsule', data)
  },
  async update(id: number, data: Omit<Capsule, 'id' | 'createdAt'>): Promise<Capsule> {
    return await $Call.ByName('main.CapsuleService.UpdateCapsule', id, data)
  },
  async delete(id: number): Promise<void> {
    await $Call.ByName('main.CapsuleService.DeleteCapsule', id)
  },
}