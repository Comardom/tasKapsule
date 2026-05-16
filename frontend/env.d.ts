/// <reference types="vite/client" />
export interface IElectronAPI {
    onBackendStatus: (callback: (text: string) => void) => void;
    removeBackendListeners: () => void;
}
declare global {
    interface Window {
        api: {
            openFile: () => Promise<string | null>
            saveFile: (content: string) => Promise<boolean | null>
        }
        // 对应 preload.ts 中的 electronAPI
        electronAPI: IElectronAPI
    }
}

export {}
