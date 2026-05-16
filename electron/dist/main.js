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
// app: 控制应用生命周期；BrowserWindow: 创建原生窗口；ipcMain: 主进程通信句柄；dialog: 显示原生对话框
const electron_1 = require("electron");
// path: 处理文件路径的 Node.js 内置工具，能自动处理 Windows(\) 和 Linux(/) 的斜杠差异
const path = __importStar(require("path"));
// spawn: 异步启动子进程（不阻塞主线程）；ChildProcess: 进程对象的类型定义
const child_process_1 = require("child_process");
// fs: Node.js 文件系统模块，用于读写文件、判断文件是否存在、修改权限等
const fs = __importStar(require("fs"));
// 杀端口
const killPort_1 = require("./killPort");
// 定义全局变量，用于存储go后端进程对象，方便在应用关闭时销毁它
let backendProcess = null;
// 提升 win 的作用域，方便在日志回调中使用
let mainWindow = null;
function createWindow() {
    //创建窗口并且引入preload.js,其实是用ts写的，但是编译成js以后，通过__dirname引入的
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true, // 设置为自动隐藏
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // contextIsolation: 开启上下文隔离（安全核心），防止前端脚本直接访问 Node API
            contextIsolation: true,
            // nodeIntegration: 关闭 Node 集成（安全核心），前端必须通过 preload 暴露的方法与主进程通信
            nodeIntegration: false
        }
    });
    // process.resourcesPath 在生产环境下指向安装目录下的 resources 文件夹
    const indexPath = path.join(process.resourcesPath, 'frontend', 'dist', 'index.html');
    // 加载 Vue 打包后的静态资源文件
    if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath); // 使用 loadFile 替代 loadURL
    }
    else {
        console.error("Index file not found at:", indexPath);
    }
    // mainWindow.loadURL(`file://${indexPath}`)
    // path.resolve 用于将路径解析为绝对路径，方便在调试日志中查看确切位置
    console.log('Frontend path:', path.resolve(process.resourcesPath, 'frontend', 'dist', 'index.html'));
}
// app.whenReady(): 当 Electron 完成初始化，准备好创建窗口和调用 API 时触发
electron_1.app.whenReady().then(() => {
    // 获取当前环境：app.isPackaged 为 true 表示是打包后的生产环境，false 为开发环境
    const isProd = electron_1.app.isPackaged;
    if (!isProd) {
        // 开发模式：Electron 只负责开窗口，后端由go管理
        createWindow();
        return; // ← 关键：不执行后面的检查
    }
    // 处理端口冲突（很重要！！！）
    // 在启动go之前，先清理可能残留在内存中的旧端口占用
    (0, killPort_1.killPort)(9999);
    const backendExe = process.platform === 'win32'
        ? 'taskapsule-server.exe'
        : 'taskapsule-server';
    const backendPath = path.join(process.resourcesPath, backendExe);
    console.log('Target Backend Path:', backendPath);
    if (!fs.existsSync(backendPath)) {
        electron_1.dialog.showErrorBox('后端丢失', `找不到后端文件:\n${backendPath}`);
        electron_1.app.quit();
        return;
    }
    if (process.platform !== 'win32') {
        try {
            const stats = fs.statSync(backendPath);
            if (!(stats.mode & 0o100)) {
                fs.chmodSync(backendPath, 0o755);
            }
        }
        catch (err) {
            if (err.code === 'EROFS') {
                console.warn('文件系统只读，无法修改权限（AppImage 中属正常）');
            }
            else {
                console.error('权限检查/修改失败:', err);
            }
        }
    }
    // 显示主界面
    createWindow();
    // 启动子进程：启动go后端
    // stdio: 'pipe' (默认) 会创建管道。
    backendProcess = (0, child_process_1.spawn)(backendPath, [], {
        cwd: process.resourcesPath,
        stdio: 'pipe'
    });
    backendProcess.on('error', (err) => {
        console.error('启动后端进程失败:', err);
        electron_1.dialog.showErrorBox('后端启动失败', `无法启动 Go 后端:\n${err.message}`);
    });
    // 下面这俩是匹配后端的输出流的，
    // 得到信息传给preload.ts，
    // 然后再传给frontend/src/utils/loadingPageController.ts，
    // 然后通过return传给frontend/src/App.vue，
    // 然后通过props参数传给frontend/src/components/LoadingScreen.vue进行展示
    if (backendProcess.stdout) {
        backendProcess.stdout.on('data', (data) => {
            console.log('Backend:', data.toString().trim());
        });
    }
    if (backendProcess.stderr) {
        backendProcess.stderr.on('data', (data) => {
            console.error('Backend Error:', data.toString().trim());
        });
    }
    // IPC 通信句柄 (给前端 Vue 使用)
    // handle: 响应前端发来的异步调用 (invoke)
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
});
// 生命周期钩子：应用即将关闭
electron_1.app.on('will-quit', () => {
    // 强制杀掉 Go 后端，否则 Electron 关闭了 Go 还会留在后台跑，导致端口占用
    if (backendProcess)
        backendProcess.kill();
});
