const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token de autenticación requerido",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Usuario no encontrado",
      });
    }

    if (user.status !== "ACTIVO") {
      return res.status(403).json({
        message: "Usuario inactivo o bloqueado",
      });
    }

    if (!user.role || !user.role.active) {
      return res.status(403).json({
        message: "Rol inactivo o no válido",
      });
    }

    req.user = {
      id: user.id,
      institutionalEmail: user.institutionalEmail,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
}

module.exports = authMiddleware;