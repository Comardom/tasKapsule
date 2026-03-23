"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
let backendProcess = null;
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    const indexPath = path.join(process.resourcesPath, 'frontend', 'dist', 'index.html');
    win.loadURL(`file://${indexPath}`);
    console.log('Frontend path:', path.resolve(process.resourcesPath, 'frontend', 'dist', 'index.html'));
}
electron_1.app.whenReady().then(() => {
    // 后端 jar 在生产模式下放到 resources/backend.jar
    const jarPath = path.join(process.resourcesPath, 'backend.jar');
    // backendProcess = spawn('java', ['-jar', jarPath])
    let javaPath;
    switch (process.platform) {
        case 'win32':
            javaPath = path.join(process.resourcesPath, 'jre/win_x64/bin/java.exe');
            break;
        case 'darwin':
            javaPath = path.join(process.resourcesPath, 'jre/mac_arm/bin/java');
            break;
        case 'linux':
            javaPath = path.join(process.resourcesPath, 'jre/linux_x64/bin/java');
            break;
        default:
            throw new Error('Unsupported platform: ' + process.platform);
    }
    backendProcess = (0, child_process_1.spawn)(javaPath, ['-jar', jarPath], {
        cwd: process.resourcesPath,
        stdio: 'inherit'
    });
    if (backendProcess.stdout) {
        backendProcess.stdout.on('data', data => console.log(`Backend: ${data}`));
    }
    if (backendProcess.stderr) {
        backendProcess.stderr.on('data', data => console.error(`Backend Error: ${data}`));
    }
    electron_1.ipcMain.handle('open-file', async () => {
        const { canceled, filePaths } = await electron_1.dialog.showOpenDialog({ properties: ['openFile'] });
        if (canceled || filePaths.length === 0)
            return null;
        return fs.readFileSync(filePaths[0], 'utf-8');
    });
    electron_1.ipcMain.handle('save-file', async (_event, content) => {
        const { filePath } = await electron_1.dialog.showSaveDialog({});
        if (!filePath)
            return null;
        fs.writeFileSync(filePath, content, 'utf-8');
        return true;
    });
    createWindow();
});
electron_1.app.on('will-quit', () => {
    if (backendProcess)
        backendProcess.kill();
});
