const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  getOpenAtLogin: () => ipcRenderer.invoke('app:get-open-at-login'),
  setOpenAtLogin: (enabled) => ipcRenderer.invoke('app:set-open-at-login', enabled),
  allowHIDForVPID: (vendorId, productId) =>
    ipcRenderer.invoke('hid:allow-vpid', `${vendorId}:${productId}`),
  getActiveApp: () => ipcRenderer.invoke('app:get-active-app'),
  listApps: () => ipcRenderer.invoke('app:list-apps'),
  onActiveAppChanged: (cb) => {
    const listener = (_evt, data) => {
      try { cb && cb(data); } catch {}
    };
    ipcRenderer.on('active-app-changed', listener);
    return () => ipcRenderer.removeListener('active-app-changed', listener);
  },
});
