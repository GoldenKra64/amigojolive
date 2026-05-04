const registrationRequestService = require("./registrationRequest.service");

async function getRegistrationRequests(req, res, next) {
  try {
    const { status } = req.query;

    const requests = await registrationRequestService.getRegistrationRequests(status);

    return res.status(200).json({
      message: "Solicitudes de registro obtenidas correctamente",
      data: requests,
    });
  } catch (error) {
    next(error);
  }
}

async function approveRegistrationRequest(req, res, next) {
  try {
    const user = await registrationRequestService.approveRegistrationRequest(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      message: "Solicitud aprobada y usuario docente creado correctamente",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function rejectRegistrationRequest(req, res, next) {
  try {
    const request = await registrationRequestService.rejectRegistrationRequest(
      req.params.id,
      req.user.id,
      req.body.reviewComment
    );

    return res.status(200).json({
      message: "Solicitud rechazada correctamente",
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
};