import { Queue } from "bullmq";

/**
 * Configuración de la conexión a Redis para el manejo de colas.
 */
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

/**
 * Cola de BullMQ encargada de gestionar las actualizaciones de stock en segundo plano.
 */
const queue = new Queue("stock-updates", { connection });

/**
 * Publicador de eventos de stock.
 * Se encarga de encolar trabajos para decrementar el inventario de forma asíncrona.
 */
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
