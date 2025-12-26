# LAWBiX - Corporate Legal Engine

Plataforma LegalTech para gestión corporativa automatizada.

## 🏗 Arquitectura
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + Prisma ORM
- **Base de Datos**: MySQL (Hostinger)

## 🚀 Despliegue en Hostinger (VPS/Cloud)

### 1. Requisitos Previos
- Node.js v18+ instalado en el servidor.
- Base de datos MySQL creada.

### 2. Instalación del Backend
Subir la carpeta `backend/` al servidor (ej: `/home/uXXXX/domains/lawbix.com/public_html/backend`).

```bash
cd backend
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Configurar variables de entorno
cp .env.example .env
nano .env # (Editar DATABASE_URL y JWT_SECRET)
```

### 3. Ejecución (Production)
Usamos **PM2** para mantener el proceso activo.

```bash
# Iniciar servidor
pm2 start app.js --name "lawbix-api"

# Guardar lista de procesos
pm2 save
pm2 startup
```

### 4. Configuración Proxy (.htaccess)
En la raíz `public_html`, asegura que el tráfico `/api` vaya al puerto 3001:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^api/(.*)$ http://127.0.0.1:3001/api/$1 [P,L]
    RewriteRule ^ index.html [L]
</IfModule>
```

## 🛠 Desarrollo Local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧹 Limpieza y Mantenimiento
Para mantener el proyecto ligero:
```bash
# Eliminar dependencias no usadas
npm prune --production
```
