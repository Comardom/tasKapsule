import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    openFile: () => ipcRenderer.invoke('open-file'),
                                saveFile: (content: string) => ipcRenderer.invoke('save-file', content)
})
