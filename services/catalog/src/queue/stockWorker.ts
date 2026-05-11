import { Worker, Job } from "bullmq";
import { PrismaFactory } from "../datos/PrismaFactory";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

interface StockUpdateJob {
  items: Array<{ productId: string; qty: number }>;
}

export function startStockWorker(): void {
  const prisma = PrismaFactory.getCliente();

  let worker: Worker<StockUpdateJob>;
  try {
    worker = new Worker<StockUpdateJob>(
      "stock-updates",
      async (job: Job<StockUpdateJob>) => {
        const { items } = job.data;
        for (const item of items) {
          await prisma.products.update({
            where: { id: BigInt(item.productId) },
            data: { stock: { decrement: item.qty } },
          });
          console.log(`[stock-worker] Decrementado stock de producto ${item.productId} en ${item.qty}`);
        }
      },
      { connection },
    );

    worker.on("completed", (job) => {
      console.log(`[stock-worker] Job ${job.id} completado`);
    });

    worker.on("failed", (job, err) => {
      console.error(`[stock-worker] Job ${job?.id} falló:`, err.message);
    });

    worker.on("error", (err) => {
      console.error("[stock-worker] Error de conexión Redis:", err.message);
    });

    console.log(`[stock-worker] Worker iniciado → Redis ${connection.host}:${connection.port}`);
  } catch (err: any) {
    console.warn("[stock-worker] No se pudo iniciar (Redis no disponible):", err.message);
  }
}
