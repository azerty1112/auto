const electron = require('electron');
if (typeof electron === 'string' || !electron || !electron.ipcMain) {
  console.error('This script must be run with Electron. Try: npx electron .');
  process.exit(1);
}

const { app, BrowserWindow, ipcMain, dialog } = electron;
const path = require('path');
let robot;
let mainWindow;
try {
  robot = require('robotjs');
} catch (e) {
  robot = null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    }
  });

  mainWindow.loadFile('index.html');
}

ipcMain.handle('set-proxy', async (event, proxy) => {
  if (!mainWindow) return;
  mainWindow.webContents.session.setProxy({ proxyRules: proxy || '' });
});

ipcMain.handle('set-user-agent', async (event, ua) => {
  if (!mainWindow) return;
  mainWindow.webContents.setUserAgent(ua);
});

ipcMain.handle('capture-screenshot', async () => {
  if (!mainWindow) return;
  const image = await mainWindow.webContents.capturePage();
  const { filePath } = await dialog.showSaveDialog({ filters: [{ name: 'PNG', extensions: ['png'] }] });
  if (filePath) require('fs').writeFileSync(filePath, image.toPNG());
});

ipcMain.handle('robot-action', async (event, action) => {
  if (!robot) return 'robotjs غير مثبت';
  switch(action.type) {
    case 'key': robot.keyTap(action.key, action.modifier || []); break;
    case 'mouseMove': robot.moveMouse(action.x, action.y); break;
    case 'mouseClick': robot.mouseClick(action.button || 'left'); break;
  }
  return 'تم';
});

app.whenReady().then(createWindow);
