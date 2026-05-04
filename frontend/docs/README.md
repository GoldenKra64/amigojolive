# Frontend AmigoJoLive

Aplicación web (React 19 + TypeScript + Vite + TailwindCSS v4) que se integra con el backend NodeJS / Prisma del repositorio.

## Stack

- React 19 + TypeScript
- Vite 8 (`@vitejs/plugin-react`)
- TailwindCSS v4 (vía `@tailwindcss/vite`)
- React Router DOM 7
- Axios (cliente HTTP)
- Context API para autenticación y notificaciones (toasts)

## Requisitos previos

- Node.js 18+ y npm
- Backend en ejecución (por defecto en `http://localhost:3000`). Antes de levantar el frontend asegúrate de:

  ```sh
  # desde backend/
  npx prisma validate
  npx prisma generate
  npx prisma migrate deploy
  npx prisma db seed
  npm run dev
  ```

  El seed crea los roles (`admin`, `docente`, `moderador`) y un usuario administrador inicial:

  - Email: `admin@institucion.edu.ec`
  - Password: `Admin123456`

## Variables de entorno

Crear `.env` en la raíz de `frontend/` (ya hay `.env.example`):

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Registro en `/register` no envía o falla

1. Confirme que el backend responde: `GET http://localhost:3000/api/v1/health`.
2. El formulario llama a `POST /api/v1/auth/register-request`. Si el toast dice que no hay conexión con el API, revise `VITE_API_URL` y que `npm run dev` del backend esté en el puerto **3000**.
3. Si el mensaje habla de **base de datos / timeout**, el fallo está en la conexión Postgres (Supabase). En `backend/src/lib/prisma.js` se usa `DIRECT_URL` antes que `DATABASE_URL` para evitar timeouts del pooler en el puerto **6543**. Si persiste, defina `DATABASE_APP_URL` en `backend/.env` con la cadena **Direct connection** del panel de Supabase y reinicie el backend.
4. Las rutas públicas de login y registro **no** envían cabecera `Authorization` para evitar interferencias con tokens antiguos.

## Scripts

```sh
npm install     # instalar dependencias
npm run dev     # servidor de desarrollo (puerto 5173)
npm run build   # build de producción (genera dist/)
npm run preview # preview del build
npm run lint    # ESLint
```

## Estructura de carpetas

```
src/
├── api/                  # cliente axios + servicios por módulo
│   ├── client.ts
│   ├── auth.service.ts
│   ├── profile.service.ts
│   └── admin.service.ts
├── components/           # UI reutilizable
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── Button.tsx
│   ├── Field.tsx
│   ├── Badge.tsx
│   ├── Spinner.tsx
│   ├── Modal.tsx
│   └── Toast.tsx
├── context/
│   └── AuthContext.tsx   # estado global de sesión + JWT
├── routes/
│   ├── AppRoutes.tsx
│   ├── ProtectedRoute.tsx
│   ├── PublicOnlyRoute.tsx
│   └── RoleRoute.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterRequestPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProfilePage.tsx
│   ├── AdminUsersPage.tsx
│   ├── AdminRequestsPage.tsx
│   └── NotFoundPage.tsx
├── types/index.ts        # tipos TypeScript de las entidades
├── App.tsx
├── main.tsx
└── index.css             # @import "tailwindcss"; + tema
```

## Endpoints integrados

Base URL: `${VITE_API_URL}` (default `http://localhost:3000/api/v1`).

| Método | Ruta                                            | Permisos | UI                       |
| ------ | ----------------------------------------------- | -------- | ------------------------ |
| POST   | `/auth/login`                                   | público  | `LoginPage`              |
| POST   | `/auth/register-request`                        | público  | `RegisterRequestPage`    |
| GET    | `/auth/me`                                      | auth     | `AuthContext` (refresh)  |
| GET    | `/profiles/me`                                  | auth     | `ProfilePage`            |
| PATCH  | `/profiles/me`                                  | auth     | `ProfilePage`            |
| GET    | `/admin/users`                                  | admin    | `AdminUsersPage`         |
| PATCH  | `/admin/users/:id/status`                       | admin    | `AdminUsersPage`         |
| GET    | `/admin/registration-requests`                  | admin    | `AdminRequestsPage`      |
| PATCH  | `/admin/registration-requests/:id/approve`      | admin    | `AdminRequestsPage`      |
| PATCH  | `/admin/registration-requests/:id/reject`       | admin    | `AdminRequestsPage`      |

## Flujo de autenticación

1. El usuario inicia sesión vía `POST /auth/login`. La respuesta `{ token, user }` se guarda en `AuthContext` y `localStorage('amigojolive_token')`.
2. El cliente axios añade automáticamente `Authorization: Bearer <token>` en cada request.
3. Si una respuesta retorna `401`, el interceptor limpia la sesión y redirige a `/login`.
4. Al recargar la app, se llama a `/auth/me` para rehidratar el usuario y validar el token.

## Roles

- `admin`: puede ver el panel de usuarios y solicitudes de registro.
- `docente`: puede acceder a su perfil y al dashboard.
- `moderador`: por ahora con permisos equivalentes al docente; se ampliará cuando el backend exponga moderación.

## Próximos pasos (no incluidos)

Las vistas de **Blog/Posts**, **Comentarios**, **Etiquetas** y **Recursos** se construirán cuando el backend exponga sus endpoints (los modelos ya existen en `backend/prisma/schema.prisma`).
