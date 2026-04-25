import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    openFile: () => ipcRenderer.invoke('open-file'),
    saveFile: (content: string) => ipcRenderer.invoke('save-file', content)
})

contextBridge.exposeInMainWorld('electronAPI', {
  onJvmStatus: (callback: (text: string) => void) => {
    // 监听主进程发来的消息，也就是main.ts中正则表达式匹配的地方
    ipcRenderer.on('jvm-status-update', (_event, value: string) => callback(value));
  },
  removeJvmListeners: () => {
    ipcRenderer.removeAllListeners('jvm-status-update');
  }
});