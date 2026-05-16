"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    openFile: () => electron_1.ipcRenderer.invoke('open-file'),
    saveFile: (content) => electron_1.ipcRenderer.invoke('save-file', content)
});
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    onBackendStatus: (callback) => {
        const handler = (_event, value) => callback(value);
        electron_1.ipcRenderer.on('backend-status-update', handler);
        return () => electron_1.ipcRenderer.removeListener('backend-status-update', handler);
    },
    removeBackendListeners: () => {
        electron_1.ipcRenderer.removeAllListeners('backend-status-update');
    }
});
