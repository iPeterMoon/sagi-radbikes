import { PrismaFactory } from "@/lib/PrismaFactory";
import { ReporteVentasDAO } from "./datos/ReporteVentasDAO";
import { ServicioReporteVentas } from "./negocio/ServicioReporteVentas";

export function createServicioReporteVentas(): ServicioReporteVentas {
  const dao = new ReporteVentasDAO(PrismaFactory.getCliente());
  return new ServicioReporteVentas(dao);
}
