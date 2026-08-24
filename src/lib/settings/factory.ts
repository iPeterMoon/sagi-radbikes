import { PrismaFactory } from "@/lib/PrismaFactory";
import { ConfiguracionDAO } from "./datos/ConfiguracionDAO";
import { ServicioConfiguracion } from "./negocio/ServicioConfiguracion";

export function createServicioConfiguracion(): ServicioConfiguracion {
  const dao = new ConfiguracionDAO(PrismaFactory.getCliente());
  return new ServicioConfiguracion(dao);
}
