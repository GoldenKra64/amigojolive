package com.amigojolive.navigation

/**
 * Documentación de la decisión de navegación (nav-kmp-choice).
 *
 * ─── Librería elegida: Voyager ────────────────────────────────────────────────
 * Se evaluaron tres opciones:
 *
 *   1. Navigation Compose (Google oficial)
 *      ✗ Tosca en web (jsMain): manejo de deep links y backstack difieren del navegador.
 *      ✗ Serialización de argumentos compleja en KMP.
 *
 *   2. Decompose (arkivanov)
 *      ✓ Excelente para arquitecturas complejas con flujos de back personalizados.
 *      ✗ Mayor curva de aprendizaje; boilerplate alto para equipos pequeños.
 *
 *   3. Voyager (adrielcafe) ← ELEGIDO
 *      ✓ Estándar de facto en la comunidad KMP.
 *      ✓ Soporte nativo para Android, JS y JVM.
 *      ✓ ScreenModel = ViewModel multiplataforma con screenModelScope.
 *      ✓ API mínima: Screen, Navigator, rememberScreenModel().
 *      ✓ Transiciones, Tab Navigator y Bottom Sheet incluidos.
 *
 * ─── Segmentación de roles ────────────────────────────────────────────────────
 * Flujo post-login según role de UserSummary:
 *
 *   "docente"  → TeacherHomeScreen  (TeacherNavGraph)
 *                Inicio · Feed · Mis aportes · Chatbot · Perfil
 *
 *   "admin"    → AdminHomeScreen    (AdminNavGraph)
 *                Usuarios · Solicitudes · Categorías
 *
 * La barra de navegación del docente NO muestra destinos admin.
 * Cada Screen admin verifica SessionStore.currentUser.role y devuelve
 * early si el rol no es "admin", bloqueando deep links no autorizados.
 *
 * ─── Punto de entrada ─────────────────────────────────────────────────────────
 * App.kt crea un Navigator(LoginScreen) que arranca en el login.
 * Tras autenticación, AuthViewModel actualiza SessionStore y navega
 * a TeacherHomeScreen o AdminHomeScreen con replaceAll() para limpiar
 * el backstack de auth.
 */
