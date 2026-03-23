import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import { spawn, ChildProcess } from 'child_process'
import * as fs from 'fs'

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
    // 后端 jar 在生产模式下放到 resources/backend.jar
    const jarPath = path.join(process.resourcesPath, 'backend.jar')
    // backendProcess = spawn('java', ['-jar', jarPath])

    let javaPath: string
    switch (process.platform) {
        case 'win32':
            javaPath = path.join(process.resourcesPath, 'jre/win_x64/bin/java.exe')
            break
        case 'darwin':
            javaPath = path.join(process.resourcesPath, 'jre/mac_arm/bin/java')
            break
        case 'linux':
            javaPath = path.join(process.resourcesPath, 'jre/linux_x64/bin/java')
            break
        default:
            throw new Error('Unsupported platform: ' + process.platform)
    }

    backendProcess = spawn(javaPath, ['-jar', jarPath], {
        cwd: process.resourcesPath,
        stdio: 'inherit'
    })

    if (backendProcess.stdout) {
        backendProcess.stdout.on('data', data => console.log(`Backend: ${data}`))
    }
    if (backendProcess.stderr) {
        backendProcess.stderr.on('data', data => console.error(`Backend Error: ${data}`))
    }

    ipcMain.handle('open-file', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] })
        if (canceled || filePaths.length === 0) return null
            return fs.readFileSync(filePaths[0], 'utf-8')
    })

    ipcMain.handle('save-file', async (_event, content: string) => {
        const { filePath } = await dialog.showSaveDialog({})
        if (!filePath) return null
            fs.writeFileSync(filePath, content, 'utf-8')
            return true
    })

    createWindow()
})

app.on('will-quit', () => {
    if (backendProcess) backendProcess.kill()
})
