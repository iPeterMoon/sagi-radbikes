import { IServicioVenta } from "./negocio/interfaces/IServicioVenta";
import { ServicioVenta } from "./negocio/ServicioVenta";
import { IPOSAccesoDatos } from "./datos/daos/interfaces/IPOSAccesoDatos";
import { POSAccesoDatos } from "./datos/POSAccesoDatos";

export function createServicioVenta(): IServicioVenta {
    const accesoDatos = crearAccesoDatos();
    return new ServicioVenta(accesoDatos);
}

const crearAccesoDatos = (): IPOSAccesoDatos => {
    return new POSAccesoDatos();
}