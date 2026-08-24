import { PrismaFactory } from "@/lib/PrismaFactory";
import { ReporteDAO } from "./datos/ReporteDAO";
import { ServicioReportes } from "./negocio/ServicioReportes";

export function createServicioReportes(): ServicioReportes {
  const dao = new ReporteDAO(PrismaFactory.getCliente());
  return new ServicioReportes(dao);
}
