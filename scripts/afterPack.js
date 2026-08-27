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

    // Turbopack marca ciertos paquetes (bcrypt, pg, node-thermal-printer...)
    // como "external modules" y en vez de copiarlos deja un symlink en
    // .next/node_modules/<paquete>-<hash> apuntando con RUTA ABSOLUTA al
    // checkout del runner de CI (/Users/runner/work/...). Esa ruta no existe
    // en la máquina del usuario final, así que cualquier require() de esos
    // paquetes tira "Cannot find module" apenas se usan (login, impresión,
    // etc). Los recreamos como symlinks relativos hacia el propio
    // node_modules/ que ya copiamos arriba.
    const externalsDir = path.join(appDest, '.next', 'node_modules');
    if (fs.existsSync(externalsDir)) {
        for (const entry of fs.readdirSync(externalsDir)) {
            const linkPath = path.join(externalsDir, entry);
            if (!fs.lstatSync(linkPath).isSymbolicLink()) continue;
            const target = fs.readlinkSync(linkPath);
            const packageName = target.split('node_modules/').pop();
            fs.rmSync(linkPath);
            fs.symlinkSync(path.join('..', '..', 'node_modules', packageName), linkPath);
        }
    }

    console.log('[afterPack] Copia manual completada.');
}