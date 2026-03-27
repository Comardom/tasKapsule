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
// 解决部分 Linux 环境下的 GPU 兼容性报错
electron_1.app.commandLine.appendSwitch('disable-gpu');
electron_1.app.commandLine.appendSwitch('disable-software-rasterizer');
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
    const isProd = electron_1.app.isPackaged;
    // 资源根目录：生产环境下是 process.resourcesPath，开发环境下是项目根目录
    const resPath = isProd ? process.resourcesPath : path.join(__dirname, '../../');
    // 1. 定义 Java 路径 (根据 package.json 的 "to": "jre" 配置)
    const javaExe = process.platform === 'win32' ? 'java.exe' : 'java';
    const javaPath = isProd
        ? path.join(resPath, 'jre', 'bin', javaExe)
        : path.join(resPath, 'jre', 'linux_x64', 'bin', javaExe); // 开发环境根据你实际目录调整
    // 2. 定义后端 JAR 路径 (根据 package.json 的 "to": "backend.jar" 配置)
    const jarPath = path.join(resPath, 'backend.jar');
    console.log('Target Java Path:', javaPath);
    console.log('Target JAR Path:', jarPath);
    if (isProd) {
        // 生产环境下的自检与权限处理
        if (!fs.existsSync(javaPath)) {
            const dirContent = fs.readdirSync(resPath);
            const jreExists = fs.existsSync(path.join(resPath, 'jre'));
            let subContent = jreExists ? fs.readdirSync(path.join(resPath, 'jre')).join(', ') : '未发现jre文件夹';
            electron_1.dialog.showErrorBox('JVM 启动失败', `预期 Java 路径: ${javaPath}\n\n` +
                `resources 目录下有: ${dirContent.join(', ')}\n` +
                `jre 目录下有: ${subContent}`);
        }
        else {
            // Linux/Mac 下必须赋予可执行权限
            if (process.platform !== 'win32') {
                try {
                    fs.chmodSync(javaPath, 0o755);
                }
                catch (err) {
                    console.error('Failed to chmod java:', err);
                }
            }
        }
        if (!fs.existsSync(jarPath)) {
            electron_1.dialog.showErrorBox('后端丢失', `找不到后端文件: ${jarPath}`);
        }
    }
    // 3. 启动后端进程
    backendProcess = (0, child_process_1.spawn)(javaPath, ['-jar', jarPath], {
        cwd: resPath, // 将工作目录设为 resources 目录，方便后端读写相对路径的文件
        stdio: 'inherit'
    });
    if (backendProcess.stdout) {
        backendProcess.stdout.on('data', data => console.log(`Backend: ${data}`));
    }
    if (backendProcess.stderr) {
        backendProcess.stderr.on('data', data => console.error(`Backend Error: ${data}`));
    }
    // IPC 句柄定义
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
