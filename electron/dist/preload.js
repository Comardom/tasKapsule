"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    openFile: () => electron_1.ipcRenderer.invoke('open-file'),
    saveFile: (content) => electron_1.ipcRenderer.invoke('save-file', content)
});
