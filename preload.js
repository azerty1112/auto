const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  execPython: (code) => ipcRenderer.invoke('exec-python', code),
  setProxy: (proxy) => ipcRenderer.invoke('set-proxy', proxy),
  setUA: (ua) => ipcRenderer.invoke('set-user-agent', ua),
  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),
  robotAction: (action) => ipcRenderer.invoke('robot-action', action)
});