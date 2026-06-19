/// <reference types="vite/client" />
interface GetCapsulesResult {
  Data: any[]
  Total: number
  Page: number
  PerPage: number
}

declare global {
  interface Window {
    go: {
      main: {
        App: {
          GetCapsules(page: number, perPage: number): Promise<GetCapsulesResult>
          CreateCapsule(data: any): Promise<any>
          UpdateCapsule(id: number, data: any): Promise<any>
          DeleteCapsule(id: number): Promise<void>
        }
      }
    }
  }
}

export {}