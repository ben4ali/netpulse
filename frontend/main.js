const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow(page) {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'public', 'assets', 'icons', 'netpulse_icon_invert.png'), // Adjusted icon path
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.setMenu(null);
    win.loadFile(path.join(__dirname, 'public', page));
}

//app initialization
app.whenReady().then(() => {
    createWindow('index.html');  
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow('index.html');
        }
    });
});

//when all windows are closed quit the app
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

//listen for change-page event
ipcMain.handle('change-page', (event, page) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    focusedWindow.loadFile(path.join(__dirname, 'public', page));
});