const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  detectShell: () => ipcRenderer.invoke('detect-shell'),
  getConfig: (configFile) => ipcRenderer.invoke('get-config', configFile),
  saveConfig: (configFile, data) => ipcRenderer.invoke('save-config', { configFile, data }),
  reloadShell: (shellPath, configFile) => ipcRenderer.invoke('reload-shell', { shellPath, configFile }),
  testAlias: (command) => ipcRenderer.invoke('test-alias', command),
  getAvailableShells: () => ipcRenderer.invoke('get-available-shells')
});