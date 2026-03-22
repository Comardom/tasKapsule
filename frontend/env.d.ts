/// <reference types="vite/client" />

declare global {
    interface Window {
        api: {
            openFile: () => Promise<string | null>
            saveFile: (content: string) => Promise<boolean | null>
        }
    }
}

export {}
