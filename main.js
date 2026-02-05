const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
let robot; 
try { robot = require('robotjs'); } catch(e) { robot = null; }

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

ipcMain.handle('set-proxy', async (event, proxy) => {
  win.webContents.session.setProxy({ proxyRules: proxy || '' });
});

ipcMain.handle('set-user-agent', async (event, ua) => {
  win.webContents.setUserAgent(ua);
});

ipcMain.handle('capture-screenshot', async () => {
  const image = await win.webContents.capturePage();
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