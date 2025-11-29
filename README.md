<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LAWBiX – Corporate Legal Engine

**Plataforma integral de asesoría legal corporativa con IA** 🚀

[![Estado](https://img.shields.io/badge/Estado-Producción-success)](https://github.com)
[![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)](CHANGELOG.md)
[![Fase 3](https://img.shields.io/badge/Fase%203-100%25%20Completado-brightgreen)](FASE_3_PROGRESO.md)
[![Backend Tests](https://img.shields.io/badge/Tests-8%2F8%20Passing-success)](backend/test_system_complete.js)

LAWBiX es un motor legal corporativo bilingüe (ES/EN) que combina React + TypeScript en el frontend con Express.js + MySQL en el backend, integrando IA (OpenAI + Gemini) para diagnósticos automatizados, generación de documentos y asistencia legal en tiempo real.

---

## 🎯 Características Principales

### ✅ Módulos Funcionales (100% Completados)

- **🏢 Gestión de Empresas** - CRUD completo con edición en tiempo real
- **📊 Dashboard Ejecutivo** - KPIs, semáforo de riesgos, roadmap dinámico
- **📄 Generación de Documentos** - Políticas, contratos, términos (IA-powered)
- **🗺️ Roadmap Estratégico** - CRUD completo con fases, progreso y dependencias
- **⚠️ Análisis de Riesgos** - Categorización, mitigación, tracking
- **🩺 Diagnóstico Corporativo** - Cuestionarios inteligentes con generación automática de roadmap
- **🤖 Chatbot Legal** - Asistente con OpenAI, context-aware

### 🔒 Seguridad y Autenticación

- Autenticación JWT con tokens persistentes
- Middleware RBAC (roles: admin, lawyer, client)
- Protección CORS configurada
- Interceptores automáticos en Axios
- Validación de entradas con middlewares dedicados

### 🎨 UI/UX

- **Framework**: TailwindCSS 3.4.17
- **Iconografía**: Ionicons 7.1.0 (100% integrado)
- **Tipografía**: Inter (Google Fonts)
- **Modo oscuro**: Implementado por defecto
- **Responsive**: Mobile-first design

---

## 🏗️ Arquitectura Técnica

### Frontend
```
React 19.2.0 + TypeScript 5.8.2 + Vite 6.2.0
├── Context API (AppContext para estado global)
├── Custom Hooks (useTranslate para i18n)
├── Componentes Modulares (layout, common, pages)
└── Services sin mocks (apiService, chatbotService, authService)
```

### Backend
```
Express 4.18.2 + MySQL 8 (MariaDB 10.4.32)
├── JWT Authentication (jsonwebtoken 9.0.2)
├── OpenAI Integration (SDK 6.9.0)
├── Rules Engine (lifecycle, risk_analysis, recommendations)
├── Document Generator (IA-powered)
└── Logging con Winston 3.18.3
```

### Base de Datos
```sql
12 tablas relacionadas:
- users, companies, company_partners
- risks, roadmap_items
- documents, document_templates
- diagnosis_questions, diagnosis_answers, diagnosis_results
- chat_conversations, chat_messages
```

---

## 🚀 Instalación y Ejecución

### Requisitos Previos
- **Node.js** >= 18.x
- **MySQL** 8.x o MariaDB 10.4+
- **XAMPP** (opcional, para desarrollo local)
- **Git**

### 1. Clonar Repositorio
```bash
git clone https://github.com/tu-usuario/lawbix.git
cd lawbix
```

### 2. Configurar Base de Datos

**Opción A: MySQL Manual**
```bash
mysql -u root -p
CREATE DATABASE lawbix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lawbix_user'@'localhost' IDENTIFIED BY 'lawbix2025';
GRANT ALL PRIVILEGES ON lawbix.* TO 'lawbix_user'@'localhost';
FLUSH PRIVILEGES;
exit;

mysql -u lawbix_user -plawbix2025 lawbix < backend/database/schema.sql
mysql -u lawbix_user -plawbix2025 lawbix < backend/database/seed_demo_complete.sql
```

**Opción B: XAMPP (Windows)**
```powershell
# MySQL ya está en XAMPP, solo ejecuta:
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE lawbix;"
C:\xampp\mysql\bin\mysql.exe -u root lawbix < backend/database/schema.sql
```

### 3. Configurar Variables de Entorno

**Frontend** (`.env.local` en raíz):
```env
GEMINI_API_KEY=tu_gemini_api_key_aqui
```

**Backend** (`backend/.env`):
```env
# Database
DB_HOST=localhost
DB_USER=lawbix_user
DB_PASSWORD=lawbix2025
DB_NAME=lawbix
DB_PORT=3306

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion

# OpenAI
OPENAI_API_KEY=sk-tu_openai_key_aqui
OPENAI_MODEL=gpt-4-turbo-mini
```

### 4. Instalar Dependencias

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 5. Ejecutar Aplicación

**Opción A: Comando Rápido (PowerShell)**
```powershell
.\start-lawbix.ps1
```

**Opción B: Manual**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

### 6. Acceder

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Credenciales Demo**:
  - Email: `demo@lawbix.com`
  - Password: `demo123`

---

## Run Locally

**Prerequisites:**  Node.js >= 18, MySQL 8


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Configure backend `.env` with database credentials
4. Run the app:
   `npm run dev`

---

## 📚 Documentación

- **[FASE_3_PROGRESO.md](FASE_3_PROGRESO.md)** - Estado completo de Fase 3 (100%)
- **[CHANGELOG.md](CHANGELOG.md)** - Registro de cambios por versión
- **[QUICK_START.md](QUICK_START.md)** - Guía rápida de inicio
- **[INFORME_MYSQL_COMPLETO.md](INFORME_MYSQL_COMPLETO.md)** - Setup detallado de MySQL
- **[MAPEO_COMPLETO.md](MAPEO_COMPLETO.md)** - Mapeo de rutas y endpoints

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
node test_system_complete.js
```

**Resultados esperados:**
```
✓ Test 1: Login exitoso
✓ Test 2: Obtener empresa
✓ Test 3: Listar riesgos
✓ Test 4: Listar roadmap
✓ Test 5: Listar documentos
✓ Test 6: Crear riesgo
✓ Test 7: Actualizar riesgo
✓ Test 8: Eliminar riesgo

Tasa de éxito: 100.0%
```

### Build de Producción
```bash
npm run build
```

---

## 📊 Estructura del Proyecto

```
lawbix/
├── backend/
│   ├── ai/                  # Integración OpenAI
│   ├── controllers/         # Lógica de negocio (7 controladores)
│   ├── database/            # Schema SQL y seeds
│   ├── documents/           # Generador de documentos IA
│   ├── middlewares/         # Auth, RBAC, validación, errores
│   ├── routes/              # Definición de endpoints
│   ├── rules_engine/        # Motor de reglas (lifecycle, risk, recommendations)
│   └── services/            # Servicios de negocio
├── components/
│   ├── chatbot/             # Chatbot con OpenAI
│   ├── common/              # Card, Spinner, etc.
│   └── layout/              # Header, Sidebar, Layout
├── context/
│   └── AppContext.tsx       # Estado global (auth, language)
├── pages/
│   ├── CompanyPage.tsx      # CRUD empresas
│   ├── DashboardPage.tsx    # Dashboard ejecutivo
│   ├── DiagnosisPage.tsx    # Diagnóstico corporativo
│   ├── DocumentsPage.tsx    # Generación y gestión de docs
│   ├── LoginPage.tsx        # Autenticación
│   └── RoadmapPage.tsx      # Roadmap estratégico
├── services/
│   ├── apiService.ts        # Cliente API (sin mocks)
│   ├── authService.ts       # Manejo de JWT
│   └── chatbotService.ts    # Cliente chatbot
├── types/
│   ├── ionicons.d.ts        # Tipado Ionicons
│   └── ...
├── utils/
│   └── translations.ts      # i18n ES/EN
└── types.ts                 # Interfaces globales
```

---

## 🛣️ Roadmap del Proyecto

### ✅ Fase 1: Fundamentos (Completada)
- Estructura base frontend + backend
- Autenticación JWT
- Mock data inicial

### ✅ Fase 2: Base de Datos (Completada)
- MySQL setup completo
- 12 tablas con relaciones
- Datos de prueba

### ✅ Fase 3: Integración Frontend (Completada - 100%)
- Eliminación de todos los mocks
- CRUD completo en todos los módulos
- Integración Ionicons
- Chatbot con OpenAI
- DiagnosisPage funcional

### 🔄 Fase 4: Optimización (Próxima)
- Tests E2E (Playwright/Cypress)
- React.memo y lazy loading
- Drag & drop en roadmap
- Toast notifications

### 🔮 Fase 5: Features Avanzados (Futuro)
- Refresh token automático
- Vista timeline/gantt
- Dashboard analytics con gráficos
- Exportar a PDF/Excel
- Página dedicada de análisis de riesgos

### 🚀 Fase 6: DevOps (Futuro)
- Docker Compose
- CI/CD con GitHub Actions
- Deploy en AWS/Azure
- Monitoreo con Sentry

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📜 Licencia

Este proyecto es privado y confidencial.

---

## 👥 Equipo

- **Desarrollo**: Des Factory V1 Methodology
- **IA Integration**: OpenAI GPT-4 + Google Gemini
- **Database**: MySQL 8 / MariaDB 10.4

---

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: soporte@lawbix.com
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/lawbix/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/tu-usuario/lawbix/wiki)

---

<div align="center">

**LAWBiX v1.0.0** - Corporate Legal Engine
Hecho con ❤️ siguiendo metodología Des Factory V1

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-blue)](https://twitter.com)

</div>
```
