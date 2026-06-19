/// <reference types="vite/client" />

type CancellablePromise<T> = Promise<T>

interface WailsRuntime {
  Call: {
    ByID<T = any>(methodID: number, ...args: any[]): CancellablePromise<T>
    ByName<T = any>(methodName: string, ...args: any[]): CancellablePromise<T>
  }
}

declare global {
  interface Window {
    wails: WailsRuntime
  }
}

export {}