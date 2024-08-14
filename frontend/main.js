const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');




//function to create a window
function createWindow(page) {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,        // allows Node.js features in the renderer
            contextIsolation: false       // allows access to Node.js features directly
        }
    });

    win.loadFile(path.join(__dirname, 'public', page)); // Load the specified page
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