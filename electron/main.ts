
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import { spawn, ChildProcess } from 'child_process'
import * as fs from 'fs'


// 解决部分 Linux 环境下的 GPU 兼容性报错
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');


let backendProcess: ChildProcess | null = null

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
                                  contextIsolation: true,
                                  nodeIntegration: false
        }
    })

    const indexPath = path.join(process.resourcesPath, 'frontend', 'dist', 'index.html')
    win.loadURL(`file://${indexPath}`)
    console.log('Frontend path:', path.resolve(process.resourcesPath, 'frontend', 'dist','index.html'))


}


app.whenReady().then(() => {
    const isProd = app.isPackaged;
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

dialog.showErrorBox(
    'JVM 启动失败',
    `预期 Java 路径: ${javaPath}\n\n` +
    `resources 目录下有: ${dirContent.join(', ')}\n` +
    `jre 目录下有: ${subContent}`
);
        } else {
            // Linux/Mac 下必须赋予可执行权限
            if (process.platform !== 'win32') {
                try {
                    fs.chmodSync(javaPath, 0o755);
                } catch (err) {
                    console.error('Failed to chmod java:', err);
                }
            }
        }

        if (!fs.existsSync(jarPath)) {
            dialog.showErrorBox('后端丢失', `找不到后端文件: ${jarPath}`);
        }
    }

    // 3. 启动后端进程
    backendProcess = spawn(javaPath, ['-jar', jarPath], {
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
    ipcMain.handle('open-file', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] });
        if (canceled || filePaths.length === 0) return null;
        return fs.readFileSync(filePaths[0], 'utf-8');
    });

    ipcMain.handle('save-file', async (_event, content: string) => {
        const { filePath } = await dialog.showSaveDialog({});
        if (!filePath) return null;
        fs.writeFileSync(filePath, content, 'utf-8');
        return true;
    });

    createWindow();
});



app.on('will-quit', () => {
    if (backendProcess) backendProcess.kill()
})
