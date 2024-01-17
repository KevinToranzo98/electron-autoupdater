const { app, BrowserWindow, Menu, Tray } = require('electron');
const { autoUpdater, AppUpdater } = require('electron-updater');
const { windowConfig } = require('./utils/windowConfig');
const path = require('path');
const { stopServers } = require('./services');

let win;

//Basic flags
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  win = new BrowserWindow(windowConfig);
  win.loadFile(path.join(__dirname, 'main.html'));
  win.once('ready-to-show', () => {
    win.show(); // Muestra la ventana cuando está lista
    setTimeout(() => {
      win.hide();
      autoUpdater.checkForUpdates();
      console.log(`Checking for updates. Current version ${app.getVersion()}`);
    }, 2000);
    win.isMinimized();
  });

  // Menú contextual de la bandeja del sistema
  const trayMenuTemplate = [
    {
      label: 'Salir',
      click: () => app.quit(),
    },
  ];
  // Directorio de iconos de la bandeja del sistema
  const iconPath = path.join(__dirname, 'assets', 'images'); // app es el directorio seleccionado
  const appTray = new Tray(path.join(iconPath, 'splash.png')); // app.ico es el archivo ico en el directorio de la aplicación
  // El menú contextual del icono
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  // Establecer texto al hacer hover en icono de bandeja
  appTray.setToolTip('Firmador');
  // Establecer el menú contextual de este icono
  appTray.setContextMenu(contextMenu);
}

/*New Update Available*/
autoUpdater.on('update-available', (info) => {
  curWindow.showMessage(
    `Update available. Current version ${app.getVersion()}`
  );
  let pth = autoUpdater.downloadUpdate();
  curWindow.showMessage(pth);
});

autoUpdater.on('update-not-available', (info) => {
  curWindow.showMessage(
    `No update available. Current version ${app.getVersion()}`
  );
});

/*Download Completion Message*/
autoUpdater.on('update-downloaded', (info) => {
  curWindow.showMessage(
    `Update downloaded. Current version ${app.getVersion()}`
  );
});

autoUpdater.on('error', (info) => {
  curWindow.showMessage(info);
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  stopServers();
  app.quit();
});
