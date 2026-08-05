const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");
const fs = require("fs");

const isDev = !app.isPackaged;
const PORT = process.env.PORT || 3000;

let mainWindow;
let nextServerProcess;

/**
 * En producción, .next/standalone se copia dentro de los recursos
 * de la app empaquetada (ver electron-builder.yml -> extraResources).
 * Ahí es donde vive el server.js autocontenido que genera Next.js.
 */
function getStandaloneServerPath() {
  return path.join(process.resourcesPath, "app", "server.js");
}

/**
 * Espera hasta que el servidor Next.js responda en el puerto,
 * para no abrir la ventana antes de que esté listo.
 */
function waitForPort(port, host = "127.0.0.1", timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    (function check() {
      const socket = net.createConnection(port, host);

      socket.once("connect", () => {
        socket.end();
        resolve();
      });

      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(
            new Error(
              `Timeout esperando el servidor Next.js en el puerto ${port}`,
            ),
          );
        } else {
          setTimeout(check, 300);
        }
      });
    })();
  });
}

/**
 * Lee el archivo runtime.env empaquetado junto a la app y devuelve
 * sus variables como objeto plano. En dev no hace nada porque el
 * .env de la raíz ya se carga normalmente por Next.js
 */
function loadRuntimeEnv() {
  if (isDev) return {};

  const envPath = path.join(process.resourcesPath, "runtime.env");
  if (!fs.existsSync(envPath)) {
    console.error("No se encontró runtime.env en: ", envPath);
    return {};
  }

  const contenido = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const linea of contenido.split("\n")) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) continue;
    const idx = limpia.indexOf("=");
    if (idx === -1) continue;
    const key = limpia.slice(0, idx).trim();
    let value = limpia.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

/**
 * Arranca el servidor Next.js.
 * - En desarrollo: no hace nada, porque `npm run dev` ya lo tiene corriendo
 *   por separado (ver script electron:dev en package.json).
 * - En producción: lanza el server.js standalone como proceso hijo.
 */
function startNextServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      resolve();
      return;
    }

    const serverPath = getStandaloneServerPath();

    nextServerProcess = spawn(process.execPath, [serverPath], {
      env: {
        ...process.env,
        ...loadRuntimeEnv(),
        ELECTRON_RUN_AS_NODE: "1",
        PORT: String(PORT),
        NODE_ENV: "production",
        HOSTNAME: "127.0.0.1",
      },
      stdio: "inherit",
      cwd: path.dirname(serverPath),
    });

    nextServerProcess.on("error", (err) => {
      console.error("Error al iniciar el servidor Next.js:", err);
      reject(err);
    });

    nextServerProcess.on("exit", (code) => {
      if (code !== null && code !== 0) {
        console.error(
          `El servidor Next.js terminó inesperadamente con código ${code}`,
        );
      }
    });

    resolve();
  });
}

async function createWindow() {
  try {
    await startNextServer();
    await waitForPort(PORT);
    // El puerto ya responde, pero en modo dev Next.js puede tardar un poco
    // más en terminar de compilar la primera ruta. Le damos un margen
    // extra antes de cargar la URL para evitar una pantalla en blanco.
    await new Promise((resolve) => setTimeout(resolve, isDev ? 1500 : 300));
  } catch (err) {
    console.error("No se pudo iniciar el servidor de la aplicación:", err);
    app.quit();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Oculta la barra de menú por defecto de Electron (File, Edit, View...)
  Menu.setApplicationMenu(null);

  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Cualquier link que intente abrir una ventana nueva (target=_blank)
  // se manda al navegador del sistema en vez de abrir dentro de la app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function stopNextServer() {
  if (nextServerProcess) {
    nextServerProcess.kill();
    nextServerProcess = null;
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  stopNextServer();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopNextServer();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
