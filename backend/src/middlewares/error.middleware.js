function errorMiddleware(error, req, res, next) {
  console.error(error);

  const statusCode = error.statusCode || 500;

  let message = error.message || "Error interno del servidor";

  if (
    error.code === "ETIMEDOUT" ||
    error.code === "ECONNREFUSED" ||
    /timeout|timed out/i.test(String(message))
  ) {
    message =
      "No se pudo conectar a la base de datos. Compruebe DIRECT_URL (puerto 5432), firewall, IPv6/IPv4 y que el proyecto en Supabase esté activo.";
  }

  return res.status(statusCode).json({
    message,
  });
}

module.exports = errorMiddleware;