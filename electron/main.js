const {app, BrowserWindow, session, Tray, Menu, nativeImage, ipcMain} = require('electron');
const {execFile} = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

let mainWindow;
let tray;
const allowedHidDevices = new Set(); // vendorId:productId strings
let lastActive = {bundleId: '', name: ''};
let appDetectorStarted = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

// Debug: forward renderer console/errors to main process
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    try {
      console.log(`renderer console [${level}]: ${message} (${sourceId}:${line})`);
    } catch {}
  });
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDesc, validatedURL, isMainFrame) => {
    try {
      console.error('did-fail-load', {errorCode, errorDesc, validatedURL, isMainFrame});
    } catch {}
  });
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    try {
      console.error('render-process-gone', details);
    } catch {}
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_START_URL;
  const loadDist = () => {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  };

  if (devUrl) {
    const maxRetries = 30;
    let tries = 0;

    const tryLoad = () => {
      tries += 1;
      // Attempt to load the Vite dev server. If it's not ready yet, we'll retry.
      mainWindow.loadURL(devUrl).catch(() => {});
    };

    const onFail = () => {
      if (tries < maxRetries && mainWindow && !mainWindow.isDestroyed()) {
        setTimeout(tryLoad, 500);
      } else if (tries >= maxRetries) {
        // Fallback to bundled dist if retries exhausted
        loadDist();
      }
    };

    const onFinish = () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      mainWindow.webContents.removeListener('did-fail-load', onFail);
      if (process.env.ELECTRON_OPEN_DEVTOOLS || process.env.NODE_ENV !== 'production') {
        try { mainWindow.webContents.openDevTools({mode: 'detach'}); } catch {}
      }
    };

    mainWindow.webContents.on('did-finish-load', onFinish);
    mainWindow.webContents.on('did-fail-load', onFail);
    tryLoad();
  } else {
    loadDist();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupHIDPermissions() {
  try {
    if (session.defaultSession.setPermissionCheckHandler) {
      session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
        if (permission === 'hid') return true;
        return false;
      });
    }
    if (session.defaultSession.setDevicePermissionHandler) {
      session.defaultSession.setDevicePermissionHandler((details) => {
        if (details.deviceType === 'hid') return true;
        return false;
      });
    }
  } catch (_) {}

  session.defaultSession.on('select-hid-device', (event, details, callback) => {
    // If we have an explicitly allowed vendorId:productId, auto-select it.
    const preferred = details.deviceList.find((d) =>
      allowedHidDevices.has(`${d.vendorId}:${d.productId}`),
    );
    if (preferred) {
      event.preventDefault();
      return callback(preferred.deviceId);
    }

    // If there is exactly one candidate, auto-select it to avoid a stuck flow
    // in environments where the chooser may not appear.
    if (details.deviceList && details.deviceList.length === 1) {
      event.preventDefault();
      return callback(details.deviceList[0].deviceId);
    }

    // Otherwise, do not preventDefault so the chooser appears when there are multiple options.
  });

  session.defaultSession.on('hid-device-added', (_event, _device) => {
    // no-op; could notify renderer if needed
  });
  session.defaultSession.on('hid-device-removed', (_event, _device) => {
    // no-op; could notify renderer if needed
  });
}

function setupTray() {
  try {
    const candidates = [
      path.join(app.getAppPath(), 'public', 'android-chrome-192x192.png'),
      path.join(app.getAppPath(), 'public', 'favicon-16x16.png'),
      path.join(app.getAppPath(), 'public', 'favicon.ico'),
    ];
    let image = null;
    for (const p of candidates) {
      const img = nativeImage.createFromPath(p);
      if (img && !img.isEmpty()) {
        image = img;
        break;
      }
    }
    if (!image) {
      console.warn('Tray icon not found; skipping tray setup');
      return;
    }
    if (process.platform === 'darwin') {
      try {
        image = image.resize({ width: 16, height: 16 });
        image.setTemplateImage(true);
      } catch {}
    }
    tray = new Tray(image);
    const contextMenu = Menu.buildFromTemplate([
      {label: 'Show', click: () => (mainWindow ? mainWindow.show() : createWindow())},
      {type: 'separator'},
      {label: 'Quit', role: 'quit'},
    ]);
    tray.setToolTip('VIA');
    tray.setContextMenu(contextMenu);
  } catch (e) {
    try { console.warn('Failed to set up tray:', e?.message || e); } catch {}
  }
}

function setupIPC() {
  ipcMain.handle('app:get-open-at-login', () => {
    const {openAtLogin} = app.getLoginItemSettings();
    return openAtLogin;
  });
  ipcMain.handle('app:set-open-at-login', (_evt, enabled) => {
    app.setLoginItemSettings({openAtLogin: !!enabled});
    return true;
  });
  ipcMain.handle('hid:allow-vpid', (_evt, vpid) => {
    if (typeof vpid === 'string') allowedHidDevices.add(vpid);
    return true;
  });
  ipcMain.handle('app:get-active-app', () => {
    return lastActive;
  });
  ipcMain.handle('app:list-apps', async () => {
    try {
      const apps = await listInstalledApplications();
      return apps;
    } catch (e) {
      try { console.warn('Failed listing apps', e?.message || e); } catch {}
      return [];
    }
  });
}

app.whenReady().then(async () => {
  // In dev, clear stale service workers/caches to avoid Workbox intercepting dev assets
  if (process.env.VITE_DEV_SERVER_URL) {
    try {
      await session.defaultSession.clearStorageData({storages: ['serviceworkers', 'caches']});
    } catch {}
  }
  setupHIDPermissions();
  setupIPC();
  createWindow();
  setupTray();
  startAppDetector();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function startAppDetector() {
  if (appDetectorStarted) return;
  appDetectorStarted = true;
  let activeWin;
  try {
    activeWin = require('active-win');
  } catch (e) {
    console.warn('active-win not available; falling back to AppleScript polling');
    startAppleScriptAppDetector();
    return;
  }
  const tick = async () => {
    try {
      const res = await activeWin();
      const bundleId = res?.owner?.bundleId || '';
      const name = res?.owner?.name || '';
      if (bundleId && bundleId !== lastActive.bundleId) {
        lastActive = {bundleId, name};
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('active-app-changed', lastActive);
        }
      }
    } catch {}
  };
  // Seed once immediately
  tick();
  setInterval(tick, 1000);
}

function startAppleScriptAppDetector() {
  const script = `tell application "System Events"
    set _p to first process whose frontmost is true
    set _bid to (bundle identifier of _p) as text
    set _name to (name of _p) as text
    return _bid & "|" & _name
  end tell`;
  const tick = () => {
    try {
      execFile('osascript', ['-e', script], (err, stdout) => {
        if (err) return; // likely missing permissions; silently ignore
        const out = (stdout || '').trim();
        if (!out) return;
        const [bundleId, name] = out.split('|');
        if (bundleId && bundleId !== lastActive.bundleId) {
          lastActive = {bundleId, name: name || ''};
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('active-app-changed', lastActive);
          }
        }
      });
    } catch {}
  };
  // Seed once and poll
  tick();
  setInterval(tick, 1000);
}

// Scans common Applications folders for .app bundles and extracts bundleId + name
let cachedApps = null;
async function listInstalledApplications() {
  if (cachedApps) return cachedApps;
  const roots = [
    '/Applications',
    path.join(process.env.HOME || '', 'Applications'),
    '/System/Applications',
  ].filter(Boolean);
  const found = new Map();
  for (const root of roots) {
    await scanDirForApps(root, found).catch(() => {});
  }
  cachedApps = Array.from(found.values()).sort((a, b) =>
    (a.name || '').localeCompare(b.name || ''),
  );
  return cachedApps;
}

async function scanDirForApps(dir, found, depth = 0) {
  if (depth > 2) return; // limit recursion
  let entries = [];
  try {
    entries = await fsp.readdir(dir, {withFileTypes: true});
  } catch { return; }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name.endsWith('.app')) {
      try {
        const {bundleId, name} = await getBundleInfo(full);
        if (bundleId && !found.has(bundleId)) {
          found.set(bundleId, {bundleId, name, path: full});
        }
      } catch {}
    } else if (ent.isDirectory()) {
      await scanDirForApps(full, found, depth + 1).catch(() => {});
    }
  }
}

function execPlistToJson(plistPath) {
  return new Promise((resolve, reject) => {
    execFile('plutil', ['-convert', 'json', '-o', '-', plistPath], {timeout: 3000}, (err, stdout) => {
      if (err) return reject(err);
      try { resolve(JSON.parse(stdout.toString('utf8'))); }
      catch (e) { reject(e); }
    });
  });
}

async function getBundleInfo(appPath) {
  // Try plutil first
  const infoPlist = path.join(appPath, 'Contents', 'Info.plist');
  try {
    const res = await execPlistToJson(infoPlist);
    const bundleId = res['CFBundleIdentifier'] || '';
    const name = res['CFBundleName'] || res['CFBundleDisplayName'] || path.basename(appPath).replace(/\.app$/, '');
    return {bundleId, name};
  } catch {}
  // Fallback to mdls metadata
  try {
    const {bundleId, name} = await execMdls(appPath);
    return {bundleId, name: name || path.basename(appPath).replace(/\.app$/, '')};
  } catch {}
  return {bundleId: '', name: ''};
}

function execMdls(appPath) {
  return new Promise((resolve, reject) => {
    execFile(
      'mdls',
      ['-name', 'kMDItemCFBundleIdentifier', '-name', 'kMDItemDisplayName', appPath],
      {timeout: 3000},
      (err, stdout) => {
        if (err) return reject(err);
        try {
          const text = stdout.toString('utf8');
          const idMatch = text.match(/kMDItemCFBundleIdentifier\s=\s"([^"]+)"/);
          const nameMatch = text.match(/kMDItemDisplayName\s=\s"([^"]+)"/);
          resolve({bundleId: idMatch ? idMatch[1] : '', name: nameMatch ? nameMatch[1] : ''});
        } catch (e) {
          reject(e);
        }
      },
    );
  });
}
