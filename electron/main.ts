import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import * as fs from 'fs'

let backendProcess: ChildProcessWithoutNullStreams | null = null

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
    backendProcess = spawn('java', ['-jar', jarPath])

    backendProcess.stdout.on('data', data => console.log(`Backend: ${data}`))
    backendProcess.stderr.on('data', data => console.error(`Backend Error: ${data}`))

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
