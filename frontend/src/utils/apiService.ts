import type { Capsule, CapsulesResponse } from '../../bindings/github.com/comardom/taskapsule/backend'
export type { Capsule, CapsulesResponse }

const $Call = () => window.wails.Call

export const capsuleApi = {
  async getAll(page = 0, perPage = 0): Promise<Capsule[]> {
    const res: CapsulesResponse = await $Call().ByName('main.CapsuleService.GetCapsules', page, perPage)
    return res.data
  },
  async getAllPaginated(page: number, perPage = 50): Promise<CapsulesResponse> {
    return $Call().ByName('main.CapsuleService.GetCapsules', page, perPage);
  },
  async create(data: Omit<Capsule, 'id' | 'createdAt'>): Promise<Capsule> {
    return $Call().ByName('main.CapsuleService.CreateCapsule', data);
  },
  async update(id: number, data: Omit<Capsule, 'id' | 'createdAt'>): Promise<Capsule> {
    return $Call().ByName('main.CapsuleService.UpdateCapsule', id, data);
  },
  async delete(id: number): Promise<void> {
    await $Call().ByName('main.CapsuleService.DeleteCapsule', id)
  },
  async deleteAll(): Promise<number> {
    return await $Call().ByName('main.CapsuleService.DeleteAllCapsules')
  },
}