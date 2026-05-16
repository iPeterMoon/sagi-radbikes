import express, { Request, Response, NextFunction } from 'express';
import proxy from 'express-http-proxy';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());

// Mapeo de servicios (pueden venir de variables de entorno)
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const CATALOG_SERVICE = process.env.CATALOG_SERVICE_URL || 'http://localhost:3002';
const POS_SERVICE = process.env.POS_SERVICE_URL || 'http://localhost:3003';

// 1. Rutas públicas (No requieren validación en el gateway)
app.use('/auth', proxy(AUTH_SERVICE));

// 2. Middleware de validación
const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
     res.status(401).json({ error: 'Unauthorized: No token provided' });
     return;
  }

  try {
    const response = await fetch(`${AUTH_SERVICE}/validate`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Gateway Auth Validation Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};

// 3. Rutas protegidas
app.use('/catalog', requireAuth, proxy(CATALOG_SERVICE));
app.use('/pos', requireAuth, proxy(POS_SERVICE));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`SAGI API Gateway running on port ${PORT}`);
});
