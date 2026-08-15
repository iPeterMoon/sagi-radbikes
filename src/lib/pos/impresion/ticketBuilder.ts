// lib/pos/impresion/ticketBuilder.ts

import { ThermalPrinter, PrinterTypes, CharacterSet } from "node-thermal-printer";
import { spawn } from "child_process";
import { NEGOCIO_CONFIG } from "../negocio-config";
import { VentaTicketDTO } from "../negocio/DTOsSalida";
import path from "path";

const LOGO_PATH = path.join(process.cwd(), "public", "logo-ticket.png");

function crearImpresora(): ThermalPrinter {
    return new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: "tcp://127.0.0.1",
        width: 42,
        characterSet: CharacterSet.PC852_LATIN2,
        
    });
}

function conTimeout<T>(promesa: Promise<T>, ms: number, mensajeTimeout: string): Promise<T> {
  return Promise.race([
    promesa,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(mensajeTimeout)), ms),
    ),
  ]);
}

const money = (n: number) => `$${n.toFixed(2)}`;

/**
 * Construye y envía el ticket ESC/POS a la impresora térmica.
 * @throws Error si la impresora no está conectada o falla la escritura.
 */
export async function imprimirTicket(venta: VentaTicketDTO): Promise<void> {
    const printer = crearImpresora();

    printer.alignCenter();
    try {
        await printer.printImage(LOGO_PATH);
        printer.println("");
    } catch(err) {
        console.error("No se pudo imprimir el logo, continuando sin el: ", err);
    }
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println(NEGOCIO_CONFIG.nombre);
    printer.setTextNormal();
    printer.println("");
    printer.bold(false);
    for (const line of NEGOCIO_CONFIG.direccionLineas) {
        printer.println(line);
    }
    printer.println("")
    printer.println(`Tel: ${NEGOCIO_CONFIG.telefono}`);
    printer.println(NEGOCIO_CONFIG.titular);
    printer.println(`RFC: ${NEGOCIO_CONFIG.rfc}`);
    printer.drawLine();

    printer.alignLeft();
    printer.println(`Folio: ${venta.folio}`);
    printer.println(`Fecha: ${venta.fecha.toLocaleString("es-MX")}`);
    printer.drawLine();

    for (const item of venta.items) {
        printer.println(item.nombre);
        if (item.atributos) {
            printer.println(`  ${item.atributos}`);
        }
        printer.leftRight(
            `  ${item.cantidad} x ${money(item.precioUnitario)}`,
            money(item.cantidad * item.precioUnitario),
        );
    }
    printer.drawLine();

    printer.leftRight("Subtotal", money(venta.subtotal));
    printer.leftRight(`IVA (${venta.porcentajeImpuesto}%)`, money(venta.importeIVA));
    printer.bold(true);
    printer.leftRight("TOTAL", money(venta.total));
    printer.bold(false);
    printer.drawLine();

    printer.println(`Pago: ${venta.metodoPago.replace("_", " ").toUpperCase()}`);
    printer.println("");
    printer.alignCenter();
    printer.println("¡Gracias por su compra!");
    printer.cut();

    const buffer = printer.getBuffer();

    const enviarACups = new Promise<void> ((resolve, reject) => {
        const nombreImpresora = process.env.PRINTER_NAME || "EPSON_TM_T88V";
        const lp = spawn("lp", ["-d", nombreImpresora, "-o", "raw"]);
        
        lp.stdin.write(buffer);
        lp.stdin.end();

        lp.on("close", (code) => {
            if (code == 0){
                resolve();
            } else {
                reject(new Error("IMPRESORA_ERROR"));
            }
        });

        lp.on("error", () => {
            reject(new Error("IMPRESORA_ERROR"));
        });
    });

    try {
        await conTimeout(enviarACups, 3000, "IMPRESORA_TIMEOUT");
    } catch(err: any) {
        if(err.message === "IMPRESORA_TIMEOUT") {
            throw new Error(err.message);
        } else {
            throw new Error("IMPRESORA_ERROR");
        }
    }
}