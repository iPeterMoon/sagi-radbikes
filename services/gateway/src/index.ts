import express, { Request, Response, NextFunction } from "express";
import proxy from "express-http-proxy";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

/**
 * Servidor principal del SAGI API Gateway.
 * Este módulo actúa como el único punto de entrada para los clientes,
 * encargándose de la gestión de CORS, cookies, autenticación centralizada
 * y el enrutamiento (proxy) hacia los microservicios correspondientes.
 *
 */

dotenv.config();

/**
 * Instancia principal de la aplicación Express.
 */
const app = express();

/**
 * Configuración del middleware CORS.
 * Permite peticiones cruzadas únicamente desde el origen del Frontend configurado
 * y habilita el intercambio de credenciales (cookies/headers de autenticación).
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

/**
 * Middleware para parsear las cookies adjuntas en las solicitudes HTTP.
 */
app.use(cookieParser());

/** URL base para el microservicio de Autenticación. */
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || "http://localhost:3001";

/** URL base para el microservicio de Catálogo. */
const CATALOG_SERVICE =
  process.env.CATALOG_SERVICE_URL || "http://localhost:3002";

/** URL base para el microservicio de Punto de Venta (POS). */
const POS_SERVICE = process.env.POS_SERVICE_URL || "http://localhost:3003";

/**
 * Redirección de rutas de autenticación.
 * Todo el tráfico hacia '/auth' se delega directamente al servicio de autenticación
 * sin requerir validación previa de token (por ejemplo, para login o registro).
 */
app.use("/auth", proxy(AUTH_SERVICE));

/**
 * Middleware de seguridad para interceptar y validar la sesión del usuario.
 * Extrae el token JWT tanto de las cookies como del encabezado 'Authorization'.
 * Posteriormente, realiza una petición síncrona al servicio de autenticación para validarlo.
 *
 * @param {Request} req - El objeto de solicitud HTTP de Express.
 * @param {Response} res - El objeto de respuesta HTTP de Express.
 * @param {NextFunction} next - La función callback para ceder el control al siguiente middleware.
 * @returns {Promise<void>} Retorna una promesa vacía. Si falla, corta el flujo enviando una respuesta HTTP.
 *
 * @throws {401} Si el token no está presente o si el servicio de autenticación lo rechaza.
 * @throws {500} Si ocurre un error de red o de servidor al intentar validar el token.
 */
const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token =
    req.cookies.token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  try {
    const response = await fetch(`${AUTH_SERVICE}/validate`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      res.status(401).json({ error: "Unauthorized: Invalid token" });
      return;
    }

    next();
  } catch (error) {
    console.error("Gateway Auth Validation Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

/**
 * Enrutamiento protegido para el microservicio de Catálogo.
 * Requiere un token válido antes de redirigir el tráfico.
 */
app.use("/catalog", requireAuth, proxy(CATALOG_SERVICE));

/**
 * Enrutamiento protegido para el microservicio de Punto de Venta (POS).
 * Requiere un token válido antes de redirigir el tráfico.
 * 
 * Configuración especial: El endpoint /pos/venta recibe y transfiere XML.
 * Se configura para preservar headers y no alterar el contenido.
 */
app.use(
  "/pos",
  requireAuth,
  proxy(POS_SERVICE, {
    // proxyReqPathResolver asegura que la ruta se mantenga igual al hacer proxy
    proxyReqPathResolver: (req) => {
      return req.baseUrl;
    },
    // userResDecorator permite modificar la respuesta antes de enviarla al cliente
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      // Conserva el header Content-Type de la respuesta del microservicio POS si es XML
      if (proxyRes.headers["content-type"]?.includes("application/xml")) {
        userRes.set("Content-Type", "application/xml");
      }
      return proxyResData;
    },
    parseReqBody: false,
  })
);

/** Puerto en el que escuchará el API Gateway. */
const PORT = process.env.PORT || 8080;

/**
 * Arranca el servidor HTTP del API Gateway.
 */
app.listen(PORT, () => {
  console.log(`SAGI API Gateway running on port ${PORT}`);
});
