import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    openFile: () => ipcRenderer.invoke('open-file'),
    saveFile: (content: string) => ipcRenderer.invoke('save-file', content)
})

contextBridge.exposeInMainWorld('electronAPI', {
    onBackendStatus: (callback: (text: string) => void) => {
        const handler = (_event: any, value: string) => callback(value);
        ipcRenderer.on('backend-status-update', handler);
        return () => ipcRenderer.removeListener('backend-status-update', handler);
    },
    removeBackendListeners: () => {
        ipcRenderer.removeAllListeners('backend-status-update');
    }
});