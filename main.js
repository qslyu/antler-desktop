const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const createWindow = () => {
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
}

app.commandLine.appendSwitch("disable-hid-blocklist");

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});