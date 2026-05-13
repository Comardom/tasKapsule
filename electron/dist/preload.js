"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    openFile: () => electron_1.ipcRenderer.invoke('open-file'),
    saveFile: (content) => electron_1.ipcRenderer.invoke('save-file', content)
});
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    onJvmStatus: (callback) => {
        const handler = (_event, value) => callback(value);
        electron_1.ipcRenderer.on('jvm-status-update', handler);
        return () => electron_1.ipcRenderer.removeListener('jvm-status-update', handler);
    },
    removeJvmListeners: () => {
        electron_1.ipcRenderer.removeAllListeners('jvm-status-update');
    }
});
