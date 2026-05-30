const { ApiResponse } = require("../config/api.response");
const { publicMessageForDbError } = require("../lib/database-error-message");

function errorMiddleware(error, req, res, next) {
  console.error(error);

  const statusCode = error.statusCode || 500;

  let message = error.message || "Error interno del servidor";

  const friendlyDb = publicMessageForDbError(error, message);
  if (friendlyDb) {
    message = friendlyDb;
  }

  const response = new ApiResponse(false, statusCode, message);

  return res.status(statusCode).json(response);
}

module.exports = errorMiddleware;
