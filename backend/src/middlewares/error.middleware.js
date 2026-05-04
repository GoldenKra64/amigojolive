function errorMiddleware(error, req, res, next) {
  console.error(error);

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    message: error.message || "Error interno del servidor",
  });
}

module.exports = errorMiddleware;