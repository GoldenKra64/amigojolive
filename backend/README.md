# 🧠 Backend - AmigoJolive

Este proyecto corresponde al backend de **AmigoJolive**, construido con Node.js y organizado bajo una arquitectura modular que separa responsabilidades como configuración, lógica de negocio, middlewares y rutas.

---

## 📁 Estructura del proyecto

```
backend/
├── docs/
│   └── README.md          # Documentación adicional
├── prisma/
│   └── migrations/        # Migraciones de base de datos (Prisma ORM)
├── src/
│   ├── config/            # Configuraciones globales (env, DB, constantes)
│   ├── lib/               # Librerías y utilidades reutilizables
│   ├── mcp/               # Servidor MCP de publicaciones + cliente embebido
│   ├── middlewares/       # Middlewares de Express (auth, errores, logs)
│   ├── modules/           # Módulos de dominio (lógica de negocio, incl. ai/)
│   ├── routes/            # Definición de rutas HTTP
│   ├── app.js             # Configuración de la app Express
│   └── server.js          # Punto de entrada del servidor
├── test/                  # Pruebas (unitarias/integración)
├── .env.example           # Variables de entorno de ejemplo
```

---

## 🏗️ Arquitectura

El proyecto sigue una arquitectura **modular tipo "layered" (por capas)**, donde cada carpeta tiene una responsabilidad clara:

### 🔹 1. Capa de entrada (HTTP)

* `server.js`: Inicializa el servidor.
* `app.js`: Configura Express (middlewares, rutas, etc).

### 🔹 2. Capa de rutas

* `routes/`: Define los endpoints.
* Actúan como "adaptadores HTTP", delegando la lógica a los módulos.

### 🔹 3. Capa de lógica de negocio

* `modules/`: Contiene la lógica principal del sistema.
* Cada módulo representa un dominio (usuarios, auth, etc).
* Idealmente incluye:

  * controllers
  * services
  * schemas / validators

### 🔹 4. Middlewares

* `middlewares/`: Funciones intermedias como:

  * autenticación
  * manejo de errores
  * logging
  * validación

### 🔹 5. Configuración

* `config/`: Variables globales, configuración de DB, entorno.

### 🔹 6. Utilidades

* `lib/`: Funciones reutilizables (helpers, wrappers, etc).

### 🔹 7. Persistencia de datos

* `prisma/`: Manejo de base de datos usando Prisma ORM.
* Incluye migraciones y esquema.

---

## 🔄 Flujo de una petición

```
Cliente → Route → Middleware → Module (Service) → Prisma (DB)
                                 ↓
                              Response
```

1. El cliente hace una petición HTTP.
2. La ruta correspondiente la recibe.
3. Pasa por middlewares (auth, validación, etc).
4. Se ejecuta la lógica en `modules/`.
5. Se interactúa con la base de datos vía Prisma.
6. Se retorna la respuesta.

---

## ⚙️ Configuración

1. Clonar el repositorio
2. Copiar variables de entorno:

```bash
cp .env.example .env
```

3. Instalar dependencias:

```bash
npm install
```

4. Ejecutar migraciones:

```bash
npx prisma generate
```

5. Iniciar el servidor:

```bash
npm run dev
```

### Base de datos en línea (Supabase)

Copie `backend/.env.example` a `backend/.env` y pegue desde el panel de Supabase (**Settings → Database**):

- `DIRECT_URL`: **Session pooler** o **Direct connection** (puerto **5432**).
- `DATABASE_URL`: **Transaction pooler** (puerto **6543**), con `?pgbouncer=true` al final si usa el pooler.

El servidor Node usa `DIRECT_URL` en primer lugar (`resolve-database-url.js`) para evitar timeouts del pooler en consultas largas.

Aplique migraciones y ejecute el seed del administrador:

```bash
cd backend
npx prisma generate
npm run prisma:deploy
npm run db:seed
```

Con Prisma 7, la URL de **Migrate** viene de `prisma.config.ts` (`DIRECT_URL` primero, luego `DATABASE_URL`).

Para hosts remotos (Supabase, RDS, etc.), el adaptador activa TLS con `rejectUnauthorized: false`; en **localhost** el SSL se desactiva.

### Base de datos local con Docker (opcional)

En la raíz del monorepo existe `docker-compose.yml` con PostgreSQL 16 (`amigo` / `amigo_dev`, base `amigojolive`) solo si prefiere no usar Supabase.

### Railway: volumen de adjuntos

Monte el volumen persistente en la misma ruta física donde el proceso escribe `backend/public/` (adjuntos Multer estáticos por `/public/...`). Si cambia la ruta de despliegue, verifique las rutas resueltas en `src/app.js` y `publication-upload.middleware`.

---

## MCP e IA

Las publicaciones del foro se exponen al módulo de IA mediante **Model Context Protocol**:

- **Servidor MCP** (`src/mcp/posts-server.js`): herramientas `posts_get_feed`, `posts_get_by_id`, `posts_list_tags`, `posts_classify_draft`, `posts_apply_tags` y recursos `post://{id}`, `tags://catalog`.
- **Cliente embebido** (`MCP_MODE=embedded`, por defecto en la API) o **stdio** (`npm run mcp:posts`) para Cursor u otros clientes MCP.
- **Clasificación**: `POST /api/v1/ai/classify` (roles `docente` o `admin`) con body `{ title, content, postId?, applyTags? }`.

Variables en `.env.example`: `CHATBOT_API_KEY`, `MCP_MODE`, `AI_CLASSIFY_MAX_TOKENS`, `AI_AGENT_MAX_ITERATIONS`.

El chatbot admite consulta al foro con `useForumTools: true` en Socket.IO (`chat:message`, `chat:stream`) o el evento `chat:forum` (requiere JWT en `auth.token`).

## 🧪 Testing

Las pruebas se encuentran en:

```
test/
```

Ejecutar pruebas MCP (autorización de etiquetas):

```bash
npm run test:mcp
```

---

## 🧩 Principios de diseño

* Separación de responsabilidades
* Modularidad por dominio
* Reutilización de código (`lib`)
* Escalabilidad horizontal (añadir módulos fácilmente)
* Independencia entre capas (routes ≠ lógica)

---

## 🚀 Posibles mejoras

* Implementar arquitectura hexagonal o clean architecture
* Añadir DTOs y validación con Zod o Joi
* Integrar logging estructurado (Winston / Pino)
* Documentación con Swagger / OpenAPI
* Testing por capas (unit + integration + e2e)

---

## 📌 Notas

* Prisma se utiliza como ORM principal
* El proyecto está preparado para escalar mediante nuevos módulos
* Las rutas deben mantenerse delgadas (sin lógica de negocio)
* 
---
