const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('scan-folders', (event, { sourceFolder, targetFolder }) => {
  const pythonProcess = spawn('python', ['backend.py', sourceFolder, targetFolder]);

  pythonProcess.stdout.on('data', (data) => {
    event.reply('scan-result', data.toString());
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
    event.reply('scan-error', data.toString());
  });
});