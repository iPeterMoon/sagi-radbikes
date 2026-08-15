const fs = require('fs');
const path = require('path');

/**
 * Hook de electron-builder ejecutado después de armar el .app,
 * antes de generar el instalador final.
 * Copia manualmente el standalone de Next.js, ya que el copy interno de 
 * extraResources falla silenciosamente con volúmenes grandes de archivos
 * (node_modules de Next.js/Prisma tiene decenas de miles de archivos).
 */
exports.default = async function (context) {
    const { appOutDir, packager, electronPlatformName } = context;

    const resourcesPath =
        electronPlatformName === 'darwin'
            ? path.join(appOutDir, `${packager.appInfo.productFilename}.app`, 'Contents', 'Resources')
            : path.join(appOutDir, 'resources');

    const appDest = path.join(resourcesPath, 'app');

    console.log('[afterPack] Copiando manualmente standalone + assets a', appDest);

    fs.cpSync(path.join(process.cwd(), '.next', 'standalone'), appDest, {recursive: true});
    fs.cpSync(path.join(process.cwd(), 'public'), path.join(appDest, 'public'), {recursive: true});
    fs.cpSync(path.join(process.cwd(), '.next', 'static'), path.join(appDest, '.next', 'static'), {recursive: true});
    fs.cpSync(path.join(process.cwd(), 'runtime.env'), path.join(resourcesPath, 'runtime.env'));

    console.log('[afterPack] Copia manual completada.');
}