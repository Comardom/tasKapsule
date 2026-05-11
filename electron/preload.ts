import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    openFile: () => ipcRenderer.invoke('open-file'),
    saveFile: (content: string) => ipcRenderer.invoke('save-file', content)
})

contextBridge.exposeInMainWorld('electronAPI', {
    onJvmStatus: (callback: (text: string) => void) => {
        const handler = (_event: any, value: string) => callback(value);
        ipcRenderer.on('jvm-status-update', handler);
        return () => ipcRenderer.removeListener('jvm-status-update', handler);
    },
    removeJvmListeners: () => {
        ipcRenderer.removeAllListeners('jvm-status-update');
    }
});