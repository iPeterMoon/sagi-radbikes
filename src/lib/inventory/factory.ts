import { IServicioInventario } from "./negocio/interfaces/IServicioInventario";
import { ServicioInventario } from "./negocio/ServicioInventario";
import { ICatalogoAccesoDatos } from "./datos/daos/interfaces/ICatalogoAccesoDatos";
import { CatalogoAccesoDatos } from "./datos/CatalogoAccesoDatos";


export function createServicioCatalogo(): IServicioInventario {
    const accesoDatos = crearAccesoDatos();
    return new ServicioInventario(accesoDatos);
}

const crearAccesoDatos = (): ICatalogoAccesoDatos => {
    return new CatalogoAccesoDatos();
}