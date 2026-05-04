const userService = require("./user.service");

async function getUsers(req, res, next) {
  try {
    const users = await userService.getUsers();

    return res.status(200).json({
      message: "Usuarios obtenidos correctamente",
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const user = await userService.updateUserStatus(
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      message: "Estado de usuario actualizado correctamente",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  updateUserStatus,
};