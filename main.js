const { app, Menu, Tray, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

app.commandLine.appendSwitch("disable-hid-blocklist");

app.whenReady().then(() => {
  const window = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  window.webContents.session.on("select-hid-device", (event, details, callback) => {
    event.preventDefault();
    if (details.deviceList && details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId);
    }
  });

  window.webContents.on("did-finish-load", () => {
    window.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname, "dist/bundle.js"), "utf8"));
  })

  window.loadURL("https://drunkdeer-antler.com/#/");

  const tray = new Tray(path.join(__dirname, "icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    { label: "show window", click: () => { window.show(); } },
    { label: "quit", click: () => { app.quit(); } }
  ]);
  tray.setToolTip("DrunkDeer Antler");
  tray.setContextMenu(contextMenu);

  window.on('close', function (event) {
    event.preventDefault();
    window.hide();
  });

  tray.on('click', function () {
    window.show();
  });
});