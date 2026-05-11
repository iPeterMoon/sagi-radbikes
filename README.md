# SAGI - RAD Bikes

Sistema de Automatización y Gestión de Inventarios para RAD Bikes.

## Configuración del Entorno (.env)

Antes de ejecutar el proyecto, es estrictamente necesario configurar las variables de entorno. 
El proyecto incluye archivos de ejemplo llamados `.env.example` tanto en la raíz como dentro de los diferentes microservicios (`services/auth`, `services/catalog`, `services/pos`).

Debes copiar estos archivos y renombrarlos a `.env`:

```bash
# En Windows (PowerShell):
Copy-Item .env.example .env
Copy-Item services/auth/.env.example services/auth/.env
Copy-Item services/catalog/.env.example services/catalog/.env
Copy-Item services/pos/.env.example services/pos/.env

# En Linux/macOS/Git Bash:
cp .env.example .env
cp services/auth/.env.example services/auth/.env
cp services/catalog/.env.example services/catalog/.env
cp services/pos/.env.example services/pos/.env
```

Asegúrate de abrir cada archivo `.env` creado y ajustar los valores de conexión a bases de datos y otras credenciales según tu entorno de desarrollo.

---

## Ejecución del Proyecto

El proyecto está diseñado con una arquitectura de microservicios. Puedes ejecutarlo de dos maneras: utilizando Docker (recomendado) o levantando los servicios de forma manual (local).

### Opción 1: Ejecución con Docker (Recomendado)

Esta es la forma más rápida y sencilla, ya que Docker se encargará de levantar todos los microservicios, el frontend de Next.js y cualquier dependencia de red automáticamente.

**Requisitos previos:** Tener [Docker](https://www.docker.com/) y Docker Compose instalados.

1. Asegúrate de haber creado todos los archivos `.env` (ver sección anterior).
2. Abre una terminal en la raíz del proyecto y ejecuta:

```bash
docker-compose up --build
```

*(Para detener el proyecto, usa `docker-compose down`)*

El sistema principal estará disponible en [http://localhost:3000](http://localhost:3000).

---

### Opción 2: Ejecución Local (Manual)

Si necesitas desarrollar o depurar servicios individualmente y prefieres no usar Docker, puedes ejecutar todo localmente usando Node.js.

**Requisitos previos:** 
- Node.js (v18+)
- Tener una base de datos de PostgreSQL (u otra definida en tus `.env`) corriendo y accesible.

**1. Instalar dependencias:**
Debes instalar los paquetes NPM en la raíz (para el frontend) y en cada uno de los microservicios.

```bash
# Frontend
npm install

# Microservicios
cd services/auth && npm install && cd ../..
cd services/catalog && npm install && cd ../..
cd services/pos && npm install && cd ../..
```

**2. Ejecutar bases de datos / migraciones (Prisma):**
Asegúrate de generar los clientes de Prisma y correr las migraciones correspondientes en cada servicio que lo utilice según tu esquema actual.

**3. Iniciar los servidores:**
Necesitarás varias terminales para levantar el proyecto completo de forma manual:

- **Terminal 1 (Auth Service):**
  ```bash
  cd services/auth
  npm run dev
  ```
- **Terminal 2 (Catalog Service):**
  ```bash
  cd services/catalog
  npm run dev
  ```
- **Terminal 3 (POS Service):**
  ```bash
  cd services/pos
  npm run dev
  ```
- **Terminal 4 (Frontend Next.js):**
  ```bash
  # En la raíz del proyecto
  npm run dev
  ```

Una vez que todos los procesos estén corriendo, el sistema estará disponible en [http://localhost:3000](http://localhost:3000).
