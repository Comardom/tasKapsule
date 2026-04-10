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
const killPort_1 = require("./killPort");
// 解决部分 Linux 环境下的 GPU 兼容性报错
electron_1.app.commandLine.appendSwitch('disable-gpu');
electron_1.app.commandLine.appendSwitch('disable-software-rasterizer');
// 关闭硬件加速
// if (process.platform === 'linux') {
//     app.disableHardwareAcceleration();
// }
// 定义全局变量，用于存储 Java 后端进程对象，方便在应用关闭时销毁它
let backendProcess = null;
// 提升 win 的作用域，方便在日志回调中使用
let mainWindow = null;
function createWindow() {
    //创建窗口并且引入preload.js,其实是用ts写的，但是编译成js以后，通过__dirname引入的
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
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
    // 资源根目录：生产环境下是 process.resourcesPath，开发环境下是项目根目录
    const resPath = isProd ? process.resourcesPath : path.join(__dirname, '../../');
    // 处理端口冲突（很重要！！！）
    // 在启动 Java 之前，先清理可能残留在内存中的旧端口占用
    (0, killPort_1.killPort)(9999);
    // 定义 Java 路径
    const javaExe = process.platform === 'win32' ? 'java.exe' : 'java';
    let javaPath;
    if (isProd) {
        javaPath = path.join(resPath, 'jre', 'bin', javaExe);
    }
    else {
        // 开发环境下，根据当前操作系统去寻找对应的 jre 目录
        const platformFolder = process.platform === 'win32' ? 'win_x64' :
            process.platform === 'darwin' ? 'mac_arm' : 'linux_x64';
        javaPath = path.join(resPath, 'jre', platformFolder, 'bin', javaExe);
    }
    // const javaPath = isProd
    // ? path.join(resPath, 'jre', 'bin', javaExe)
    // : path.join(resPath, 'jre', 'linux_x64', 'bin', javaExe);
    // 定义后端 JAR 路径 (根据 package.json 的 "to": "backend.jar" 配置)
    const jarPath = path.join(resPath, 'backend.jar');
    console.log('Target Java Path:', javaPath);
    console.log('Target JAR Path:', jarPath);
    if (isProd) {
        // 生产环境下的自检与权限处理
        if (!fs.existsSync(javaPath)) {
            // 如果 JRE 丢失，获取 resources 目录列表，生成详细错误提示
            const dirContent = fs.readdirSync(resPath);
            const jreExists = fs.existsSync(path.join(resPath, 'jre'));
            let subContent = jreExists ? fs.readdirSync(path.join(resPath, 'jre')).join(', ') : '未发现jre文件夹';
            electron_1.dialog.showErrorBox('JVM 启动失败', `预期 Java 路径: ${javaPath}\n\n` +
                `resources 目录下有: ${dirContent.join(', ')}\n` +
                `jre 目录下有: ${subContent}`);
        }
        else {
            // Linux 权限处理：Node.js spawn 启动二进制文件需要 755 (可执行) 权限
            if (process.platform !== 'win32') {
                try {
                    const stats = fs.statSync(javaPath);
                    const isExecutable = !!(stats.mode & 100); // 检查是否有执行权限
                    if (!isExecutable) {
                        fs.chmodSync(javaPath, 0o755);
                    }
                }
                catch (err) {
                    if (err.code !== 'EROFS') {
                        console.error('权限检查/修改失败:', err);
                    }
                    console.error('RROFS', err);
                }
            }
        }
        if (!fs.existsSync(jarPath)) {
            electron_1.dialog.showErrorBox('后端丢失', `找不到后端文件: ${jarPath}`);
        }
    }
    // 启动子进程：启动 Spring Boot 后端
    // stdio: 'pipe' (默认) 会创建管道。
    backendProcess = (0, child_process_1.spawn)(javaPath, ['-jar', jarPath], {
        cwd: resPath, // 将工作目录设为 resources 目录，方便后端读写相对路径的文件
        stdio: 'pipe' // 修改为 pipe 才能捕获 stdout/stderr 日志
    });
    if (backendProcess.stdout) {
        backendProcess.stdout.on('data', (data) => {
            const line = data.toString();
            console.log(`Backend: ${line}`);
            // 匹配 [STAGE] 标签
            // 匹配格式: [STAGE] KEY: 内容
            const match = line.match(/\[STAGE\]\s*(\w+):\s*(.*)/);
            if (match && mainWindow) {
                const stageText = match[2].trim();
                // 通过 IPC 发送给渲染进程
                mainWindow.webContents.send('jvm-status-update', stageText);
            }
        });
    }
    if (backendProcess.stderr) {
        backendProcess.stderr.on('data', data => {
            const errLog = data.toString();
            console.error(`Backend Error: ${errLog}`);
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
    // 最后：显示主界面
    createWindow();
});
// 生命周期钩子：应用即将关闭
electron_1.app.on('will-quit', () => {
    // 强制杀掉 Java 后端，否则 Electron 关闭了 Java 还会留在后台跑，导致端口占用
    if (backendProcess)
        backendProcess.kill();
});
