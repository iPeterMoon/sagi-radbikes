import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

const queue = new Queue("stock-updates", { connection });

export const stockPublisher = {
  async publicar(items: Array<{ productId: string; qty: number }>): Promise<void> {
    try {
      await queue.add("decrement", { items });
    } catch (err: any) {
      // Redis no disponible — la venta ya fue guardada, el stock se ajustará luego
      console.warn("[stock-publisher] No se pudo encolar job (Redis no disponible):", err.message);
    }
  },
};
