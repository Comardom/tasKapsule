// app: 控制应用生命周期；BrowserWindow: 创建原生窗口；ipcMain: 主进程通信句柄；dialog: 显示原生对话框
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
// path: 处理文件路径的 Node.js 内置工具，能自动处理 Windows(\) 和 Linux(/) 的斜杠差异
import * as path from 'path'
// spawn: 异步启动子进程（不阻塞主线程）；ChildProcess: 进程对象的类型定义
import { spawn, ChildProcess } from 'child_process'
// fs: Node.js 文件系统模块，用于读写文件、判断文件是否存在、修改权限等
import * as fs from 'fs'
// execSync: 同步执行 Shell 命令，常用于需要立即获取返回结果的操作（如检查端口
import { execSync } from 'child_process';


// 解决部分 Linux 环境下的 GPU 兼容性报错
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

// 定义全局变量，用于存储 Java 后端进程对象，方便在应用关闭时销毁它
let backendProcess: ChildProcess | null = null

function createWindow() {
    //创建窗口并且引入preload.js,其实是用ts写的，但是编译成js以后，通过__dirname引入的
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // contextIsolation: 开启上下文隔离（安全核心），防止前端脚本直接访问 Node API
                                  contextIsolation: true,
            // nodeIntegration: 关闭 Node 集成（安全核心），前端必须通过 preload 暴露的方法与主进程通信
                                  nodeIntegration: false
        }
    })


    // process.resourcesPath 在生产环境下指向安装目录下的 resources 文件夹
    const indexPath = path.join(process.resourcesPath, 'frontend', 'dist', 'index.html')
    // 加载 Vue 打包后的静态资源文件
    win.loadURL(`file://${indexPath}`)
    // path.resolve 用于将路径解析为绝对路径，方便在调试日志中查看确切位置
    console.log('Frontend path:', path.resolve(process.resourcesPath, 'frontend', 'dist','index.html'))
}

// app.whenReady(): 当 Electron 完成初始化，准备好创建窗口和调用 API 时触发
app.whenReady().then(() => {
    // 获取当前环境：app.isPackaged 为 true 表示是打包后的生产环境，false 为开发环境
    const isProd = app.isPackaged;
    // 资源根目录：生产环境下是 process.resourcesPath，开发环境下是项目根目录
    const resPath = isProd ? process.resourcesPath : path.join(__dirname, '../../');

    // 处理端口冲突（很重要！！！）
    // 在启动 Java 之前，先清理可能残留在内存中的旧端口占用
    killPort(9999);

    // 定义 Java 路径
    const javaExe = process.platform === 'win32' ? 'java.exe' : 'java';
    const javaPath = isProd
    ? path.join(resPath, 'jre', 'bin', javaExe)
    : path.join(resPath, 'jre', 'linux_x64', 'bin', javaExe);

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

            dialog.showErrorBox(
                'JVM 启动失败',
                `预期 Java 路径: ${javaPath}\n\n` +
                `resources 目录下有: ${dirContent.join(', ')}\n` +
                `jre 目录下有: ${subContent}`
            );
        } else {
            // Linux 权限处理：Node.js spawn 启动二进制文件需要 755 (可执行) 权限
            if (process.platform !== 'win32') {
                try {
                    // 0o755 是八进制表示法：所有者读写执行，组/其他人读取执行
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

    // 启动子进程：启动 Spring Boot 后端
    // stdio: 'pipe' (默认) 会创建管道。
    backendProcess = spawn(javaPath, ['-jar', jarPath], {
        cwd: resPath, // 将工作目录设为 resources 目录，方便后端读写相对路径的文件
        stdio: 'pipe'// 修改为 pipe 才能捕获 stdout/stderr 日志
    });

    // 日志监听：将 Java 的控制台输出重定向到 Electron 的控制台
    if (backendProcess.stdout) {
        backendProcess.stdout.on('data', data => console.log(`Backend: ${data}`));
    }
    if (backendProcess.stderr) {
        backendProcess.stderr.on('data', data => console.error(`Backend Error: ${data}`));
    }

    // IPC 通信句柄 (给前端 Vue 使用)
    // handle: 响应前端发来的异步调用 (invoke)
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

    // 最后：显示主界面
    createWindow();
});


// 生命周期钩子：应用即将关闭
app.on('will-quit', () => {
    // 强制杀掉 Java 后端，否则 Electron 关闭了 Java 还会留在后台跑，导致端口占用
    if (backendProcess) backendProcess.kill()
})


// 杀死占用特定端口的进程
function killPort(port: number) {
  try {
      //先尝试查看端口对应的pid（cmd是一段shell命令）
    const cmd = process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port} -t`;

    //运行cmd这段shell命令，把结果变成字符串然后去掉头尾的空格
    const pid = execSync(cmd).toString().trim();

    if (pid) {
        // 如果是 Linux 且 lsof 返回了多个 PID，pid 字符串会包含换行符
      const pids = pid.split('\n');
      pids.forEach(p => {
          const killCmd = process.platform === 'win32'
            ? `taskkill /F /PID ${p}`
            : `kill -9 ${p}`;
          execSync(killCmd);
          console.log(`已清理端口 ${port} 的占用进程: ${p}`);
      });
    }
  } catch (e) {
    // 报错通常意味着端口没被占用，正常忽略
  }
}
