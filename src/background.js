'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import {
    createProtocol,
    /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let updateCellWin
let configWin

let mainWidth   = 800
let mainHeight  = 600

let smallWidth  = 200
let smallHeight = 200

let phoneWidth  = 300
let phoneHeight = 600

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
    win = new BrowserWindow({ width: mainWidth, height: mainHeight, webPreferences: {
        nodeIntegration: true
    } })
    updateCellWin = new BrowserWindow({ width: smallWidth, height: smallHeight, parent: win, show: false, webPreferences: {
        nodeIntegration: true
    } })
    configWin = new BrowserWindow({ width: phoneWidth, height: phoneHeight, parent: win, show: false, webPreferences: {
        nodeIntegration: true
    } })
    updateCellWin.setMenu(null)
    configWin.setMenu(null)
//   updateCellWin.toggleDevTools();
//   configWin.webContents.toggleDevTools();

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        updateCellWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/#/update-cell')
        configWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/#/config')
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    }
    else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }

    win.on('closed', () => {
        win = null
    })

    updateCellWin.on('close', (e) => {
        e.preventDefault()
        updateCellWin.hide()
    })

    configWin.on('close', (e) => {
        e.preventDefault()
        configWin.hide()
    })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        // Devtools extensions are broken in Electron 6.0.0 and greater
        // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
        // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
        // If you are not using Windows 10 dark mode, you may uncomment these lines
        // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
        // try {
        //   await installVueDevtools()
        // } catch (e) {
        //   console.error('Vue Devtools failed to install:', e.toString())
        // }

    }
    createWindow()
})


let cellIndxs = null;

ipcMain.on('update-cell', (event, inCellIndxs) => {
    updateCellWin.center()
    updateCellWin.setSize(smallWidth, smallHeight)
    updateCellWin.show()
    cellIndxs = inCellIndxs;
})


ipcMain.on('receive-cell-val', (event, cellval) => {
    win.webContents.send('receive-cell-val', cellval, cellIndxs)
    updateCellWin.close()
})


ipcMain.on('toggle-config', (event) => {
    configWin.center()
    configWin.setSize(phoneWidth, phoneHeight)
    configWin.show()
})


ipcMain.on('config-change', (event, config) => {
    win.webContents.send('config-change', config)
    configWin.close()
})


ipcMain.on('shut-down', (event) => {
    app.quit()
})


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
    process.on('message', data => {
        if (data === 'graceful-exit') {
        app.quit()
        }
    })
    } else {
    process.on('SIGTERM', () => {
        app.quit()
    })
    }
}


