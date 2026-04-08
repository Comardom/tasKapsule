"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    openFile: () => electron_1.ipcRenderer.invoke('open-file'),
    saveFile: (content) => electron_1.ipcRenderer.invoke('save-file', content)
});
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    onJvmStatus: (callback) => {
        // 监听主进程发来的消息
        electron_1.ipcRenderer.on('jvm-status-update', (_event, value) => callback(value));
    },
    removeJvmListeners: () => {
        electron_1.ipcRenderer.removeAllListeners('jvm-status-update');
    }
});
