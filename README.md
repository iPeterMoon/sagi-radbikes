# SAGI - RAD Bikes

Sistema de Automatización y Gestión de Inventarios para RAD Bikes.

## Configuración Inicial

### 1. Variables de Entorno

Copia los archivos `.env.example` a `.env` en la raíz y en cada microservicio:

**Windows (PowerShell):**

```bash
Copy-Item .env.example .env
Copy-Item services/auth/.env.example services/auth/.env
Copy-Item services/catalog/.env.example services/catalog/.env
Copy-Item services/pos/.env.example services/pos/.env
```

**Linux/macOS:**

```bash
cp .env.example .env
cp services/auth/.env.example services/auth/.env
cp services/catalog/.env.example services/catalog/.env
cp services/pos/.env.example services/pos/.env
```

## Ejecución

### Con Docker (Recomendado)

```bash
docker-compose up --build
```

La aplicación estará disponible en:

- Frontend: http://localhost

#### Prueba de Load Balancing (Escalado de Servicios)

El proyecto utiliza Traefik, el cual balancea la carga automáticamente entre las instancias disponibles. Para probar esto, puedes usar el parámetro `--scale` al levantar los contenedores.

Ejemplo para levantar 3 instancias del servicio de catálogo y 2 del servicio POS:

```bash
docker-compose up --scale catalog-service=3 --scale pos-service=2 --build
```

### Local (sin Docker)

**Requisitos:** Node.js v18+, PostgreSQL corriendo

**1. Instalar dependencias:**

```bash
npm install
cd services/auth && npm install && cd ../..
cd services/catalog && npm install && cd ../..
cd services/pos && npm install && cd ../..
cd services/gateway && npm install && cd ../..
```

**2. Ejecutar migraciones (si aplica):**

```bash
cd services/auth && npm run migrate && cd ../..
cd services/catalog && npm run migrate && cd ../..
cd services/pos && npm run migrate && cd ../..
```

**3. Iniciar servicios (abrir terminales diferentes):**

Terminal 1:

```bash
cd services/auth && npm run dev
```

Terminal 2:

```bash
cd services/catalog && npm run dev
```

Terminal 3:

```bash
cd services/pos && npm run dev
```

Terminal 4:

```bash
cd services/gateway && npm run dev
```

Terminal 5:

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:3000
