import {
  CreateCapsule,
  DeleteCapsule,
  GetCapsules,
  UpdateCapsule,
} from '../../bindings/github.com/comardom/taskapsule/backend/capsuleservice'
import type { Capsule, CapsulesResponse } from '../../bindings/github.com/comardom/taskapsule/backend'

export type { Capsule, CapsulesResponse }

export const capsuleApi = {
  async getAll(page = 0, perPage = 0): Promise<Capsule[]> {
    const res = await (GetCapsules(page, perPage) as Promise<CapsulesResponse>)
    return res.data
  },
  async getAllPaginated(page: number, perPage = 50): Promise<CapsulesResponse> {
    return await (GetCapsules(page, perPage) as Promise<CapsulesResponse>)
  },
  async create(data: Omit<Capsule, 'id' | 'createdAt'>): Promise<Capsule> {
    return await (CreateCapsule(data as Capsule) as Promise<Capsule>)
  },
  async update(id: number, data: Omit<Capsule, 'id' | 'createdAt'>): Promise<Capsule> {
    return await (UpdateCapsule(id, data as Capsule) as Promise<Capsule>)
  },
  async delete(id: number): Promise<void> {
    await (DeleteCapsule(id) as Promise<void>)
  },
}