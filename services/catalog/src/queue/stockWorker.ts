import { Worker, Job } from "bullmq";
import { PrismaFactory } from "../datos/PrismaFactory";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

/**
 * Interfaz que define la estructura de datos para el trabajo de actualización de stock.
 */
interface StockUpdateJob {
  /** Lista de elementos que contienen el ID del producto y la cantidad a descontar. */
  items: Array<{ productId: string; qty: number }>;
}

/**
 * Inicializa y configura el Worker de BullMQ encargado de procesar las actualizaciones
 * de inventario de forma asíncrona mediante una cola de Redis.
 *
 * @returns void
 */
export function startStockWorker(): void {
  const prisma = PrismaFactory.getCliente();

  let worker: Worker<StockUpdateJob>;
  try {
    /**
     * Instancia del Worker que escucha en la cola "stock-updates".
     * Realiza el decremento de stock en la base de datos para cada producto recibido.
     *
     * @param job El trabajo (job) que contiene los datos de los productos y cantidades.
     */
    worker = new Worker<StockUpdateJob>(
      "stock-updates",
      async (job: Job<StockUpdateJob>) => {
        const { items } = job.data;
        for (const item of items) {
          await prisma.products.update({
            where: { id: BigInt(item.productId) },
            data: { stock: { decrement: item.qty } },
          });
          console.log(
            `[stock-worker] Decrementado stock de producto ${item.productId} en ${item.qty}`,
          );
        }
      },
      { connection },
    );

    /**
     * Manejador de evento para trabajos finalizados con éxito.
     */
    worker.on("completed", (job) => {
      console.log(`[stock-worker] Job ${job.id} completado`);
    });

    /**
     * Manejador de evento para trabajos que han fallado durante su ejecución.
     */
    worker.on("failed", (job, err) => {
      console.error(`[stock-worker] Job ${job?.id} falló:`, err.message);
    });

    /**
     * Manejador de errores críticos del Worker, generalmente relacionados con la conexión a Redis.
     */
    worker.on("error", (err) => {
      console.error("[stock-worker] Error de conexión Redis:", err.message);
    });

    console.log(
      `[stock-worker] Worker iniciado → Redis ${connection.host}:${connection.port}`,
    );
  } catch (err: any) {
    console.warn(
      "[stock-worker] No se pudo iniciar (Redis no disponible):",
      err.message,
    );
  }
}
