const profileService = require("./profile.service");

async function getMyProfile(req, res, next) {
  try {
    const profile = await profileService.getMyProfile(req.user.id);

    return res.status(200).json({
      message: "Perfil obtenido correctamente",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const profile = await profileService.updateMyProfile(
      req.user.id,
      req.body
    );

    return res.status(200).json({
      message: "Perfil actualizado correctamente",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
};