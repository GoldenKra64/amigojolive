## AmigojoLive: Red Pedagógica para Docentes

## 1. Descripción del Proyecto
AmigojoLive es una plataforma colaborativa diseñada como un espacio seguro y exclusivo para los docentes de la red educativa Fe y Alegría. El objetivo principal es permitir que los profesores compartan recursos pedagógicos, experiencias de aula, consejos y frustraciones de manera profesional o anónima, fomentando el aprendizaje entre pares y el crecimiento comunitario.

## 2. Stack Tecnológico
Para la construcción del Prototipo 1, se ha definido el siguiente conjunto de tecnologías:

Frontend: Web responsiva (accesible desde móviles sin instalación).

Backend: Framework robusto para gestión de APIs (ej. .NET Core o Node.js).

Base de Datos: PostgreSQL, seleccionada por su eficiencia y escalabilidad para el manejo de contenidos.

Inteligencia Artificial: Implementación del modelo DeepSeek-v4-flash para la clasificación inteligente de publicaciones y generación de métricas de valor pedagógico.

Infraestructura: Despliegue en producción mediante servicios como Vercel, Render o Railway.

## 3. Definición de Pantallas del Prototipo
El prototipo inicial se centra en tres flujos principales:

Pantalla de Entrada de Datos: Interfaz intuitiva donde el docente redacta su publicación (título, cuerpo, resumen), selecciona categorías (Matemáticas, Pedagogía, Recursos Didácticos) y adjunta archivos como PDFs o imágenes.

Pantalla de Resultado/Acción (Feed): Muro de la comunidad donde se visualizan los artículos publicados, permitiendo filtrar por etiquetas y nivel de utilidad percibida por otros colegas.

Pantalla de Confirmación: Validación visual que indica al docente que su aporte ha sido publicado con éxito en la red.

## 4. Endpoints de la API
Se han definido las siguientes rutas base para la interacción del sistema:

POST /api/auth/login: Gestión de acceso para docentes y directivos.

GET /api/publications: Recuperación del feed de noticias y consejos pedagógicos.

POST /api/publications/create: Punto de entrada para nuevos artículos con integración de metadatos.

GET /api/resources/download: Acceso a guías de estudio y materiales adjuntos.

POST /api/ai/classify: Endpoint que utiliza DeepSeek para categorizar automáticamente el contenido y sugerir etiquetas.

## 5. Plan de Pruebas
Para garantizar la calidad del software, se ejecutarán tres niveles de testing:

Caja Blanca: Verificación de la lógica interna del código y cumplimiento de políticas de seguridad.

Caja Negra: Evaluación de las respuestas de los endpoints basándose estrictamente en las entradas del usuario.


## 6. Arranque local (monorepo)

1. **PostgreSQL**: en la raíz del repositorio, `docker compose up -d postgres` (necesita Docker Desktop activo). Usuario/clave/base: `amigo` / `amigo_dev` / `amigojolive`; copiar la cadena de conexión a `backend/.env` desde `backend/.env.example`.
2. **Migraciones y datos iniciales** (directorio `backend/`): `npx prisma generate`, `npm run prisma:deploy`, `npm run db:seed`.
3. **API**: `npm run dev` en `backend/` (puerto 3000).
4. **Web (Vite)**: `npm run dev` en `frontend/` (`VITE_API_URL=http://localhost:3000/api/v1`; puede omitirse la variable para usar el proxy configurado en Vite contra el puerto 3000).
5. **Cliente Kotlin web** (opcional): en `composeApp/`, `./gradlew jsBrowserDevelopmentRun` (suele servir en el puerto 8080).

Para comprobar si el backend alcanza la base de datos: `GET http://localhost:3000/api/v1/health/db` debe devolver JSON con mensaje positivo tras las migraciones.

Si Postgres devuelve error de usuario/contraseña (`28P01`, autentificación fallida) pero la URL en `backend/.env` coincide con `docker-compose.yml`, es habitual que exista **un volumen antiguo** con otra clave; en ese caso ejecute desde la raíz `docker compose down -v`, luego `docker compose up -d postgres`, y vuelva a aplicar migraciones y seed.
