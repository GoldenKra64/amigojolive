"use strict";

const PLACEHOLDER_HOSTS = new Set(["ruta", "host", "user", "password", "dummy"]);

function trimOrEmpty(value) {
  if (value == null) return "";
  const s = String(value).trim();
  return s;
}

function isPlaceholderUserInfo(url) {
  try {
    const normalized = url.replace(/^postgresql:/, "postgres:");
    const parsed = new URL(normalized);
    const user = decodeURIComponent(parsed.username || "");
    const pass = decodeURIComponent(parsed.password || "");
    if (/^USER$/i.test(user)) return true;
    if (/^PASSWORD$/i.test(pass)) return true;
    return false;
  } catch {
    return false;
  }
}

function looksLikePostgres(url) {
  return typeof url === "string" && /^postgres(ql)?:\/\//i.test(url.trim());
}

/**
 * Una URL válida para arrancar Postgres (filtra placeholders del .env de ejemplo).
 */
function isProbablyValidPostgresUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!looksLikePostgres(trimmed)) return false;
  try {
    const normalized = trimmed.replace(/^postgresql:/, "postgres:");
    const parsed = new URL(normalized);
    const host = (parsed.hostname || "").toLowerCase();
    if (!host) return false;
    if (PLACEHOLDER_HOSTS.has(host)) return false;
    if (isPlaceholderUserInfo(trimmed)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Resuelve la cadena para el adaptador PG.
 * Prioridad: DATABASE_APP_URL → DIRECT_URL → DATABASE_URL,
 * usando solo valores que parezcan URLs reales (no marcadores tipo "ruta").
 */
function resolvePostgresConnectionString() {
  const candidates = [
    trimOrEmpty(process.env.DATABASE_APP_URL),
    trimOrEmpty(process.env.DIRECT_URL),
    trimOrEmpty(process.env.DATABASE_URL),
  ].filter(Boolean);

  for (const cs of candidates) {
    if (isProbablyValidPostgresUrl(cs)) return cs.trim();
  }

  throw new Error(
    [
      "No hay una cadena de conexión PostgreSQL válida.",
      'Revise DIRECT_URL / DATABASE_URL en backend/.env (DATABASE_APP_URL con valor placeholder como "postgresql://ruta" se ignora).',
      "Si usa Supabase, pegue aqui su cadena remota real.",
      "Docker solo es necesario si quiere una base local.",
    ].join(" ")
  );
}

function postgresHostname(connectionString) {
  try {
    const normalized = connectionString.replace(/^postgresql:/, "postgres:");
    return (new URL(normalized).hostname || "").toLowerCase();
  } catch {
    return "";
  }
}

/**
 * RDS/Cloud: suele necesitar TLS. Local suele rechazar solicitudes SSL desde el servidor.
 */
function sslOptionForPg(connectionString) {
  const host = postgresHostname(connectionString);
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (!host || localHosts.has(host)) return undefined;
  return { rejectUnauthorized: false };
}

module.exports = {
  resolvePostgresConnectionString,
  postgresHostname,
  sslOptionForPg,
};
