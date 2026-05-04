const authService = require("./auth.service");

async function registerRequest(req, res, next) {
  try {
    const request = await authService.createRegistrationRequest(req.body);

    return res.status(201).json({
      message: "Solicitud de registro enviada correctamente. Un administrador revisará la información.",
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json({
      message: "Inicio de sesión correcto",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);

    return res.status(200).json({
      message: "Usuario autenticado",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerRequest,
  login,
  me,
};