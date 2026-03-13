"use strict";

import { app, protocol, BrowserWindow, Menu } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";

const isDevelopment = process.env.NODE_ENV !== "production";

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

let mainWindow = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#fdf1f0",
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.setFullScreen(true);
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);

    if (!process.env.IS_TEST) {
      mainWindow.webContents.openDevTools();
    }
  } else {
    createProtocol("app");
    mainWindow.loadURL("app://./index.html");
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (error) {
      console.error("Vue Devtools failed to install:", error.toString());
    }
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate([]));
  createWindow();
});

if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
