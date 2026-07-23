const { contextBridge } = require('electron');

/**
 * Expone información segura y limitada a la app web (Next.js).
 * Úsalo si tu app necesita saber que corre dentro de Electron
 * (por ejemplo, para mostrar/ocultar ciertos botones), o para
 * exponer funciones específicas del sistema más adelante
 * (por ejemplo, imprimir por USB directo desde el main process).
 */
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  appVersion: process.env.npm_package_version || null,
});