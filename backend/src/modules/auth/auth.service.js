const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");

function validateInstitutionalEmail(email) {
  return typeof email === "string" && email.includes("@");
}

async function createRegistrationRequest(data) {
  const {
    institutionalEmail,
    password,
    firstName,
    lastName,
    area,
    description,
  } = data;

  if (!institutionalEmail || !password || !firstName || !lastName) {
    const error = new Error("Correo, contraseña, nombres y apellidos son obligatorios");
    error.statusCode = 400;
    throw error;
  }

  if (!validateInstitutionalEmail(institutionalEmail)) {
    const error = new Error("Correo institucional no válido");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error("La contraseña debe tener al menos 8 caracteres");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = institutionalEmail.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { institutionalEmail: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error("Ya existe un usuario registrado con este correo");
    error.statusCode = 409;
    throw error;
  }

  const existingPendingRequest = await prisma.registrationRequest.findFirst({
    where: {
      institutionalEmail: normalizedEmail,
      status: "PENDIENTE",
    },
  });

  if (existingPendingRequest) {
    const error = new Error("Ya existe una solicitud pendiente con este correo");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const request = await prisma.registrationRequest.create({
    data: {
      institutionalEmail: normalizedEmail,
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      area: area?.trim() || null,
      description: description?.trim() || null,
      status: "PENDIENTE",
    },
    select: {
      id: true,
      institutionalEmail: true,
      firstName: true,
      lastName: true,
      area: true,
      description: true,
      status: true,
      createdAt: true,
    },
  });

  return request;
}

async function login(data) {
  const { institutionalEmail, password } = data;

  if (!institutionalEmail || !password) {
    const error = new Error("Correo y contraseña son obligatorios");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = institutionalEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { institutionalEmail: normalizedEmail },
    include: {
      role: true,
    },
  });

  if (!user) {
    const error = new Error("Credenciales incorrectas");
    error.statusCode = 401;
    throw error;
  }

  const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordIsValid) {
    const error = new Error("Credenciales incorrectas");
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== "ACTIVO") {
    const error = new Error("Usuario inactivo, pendiente o bloqueado");
    error.statusCode = 403;
    throw error;
  }

  if (!user.role || !user.role.active) {
    const error = new Error("Rol no válido o inactivo");
    error.statusCode = 403;
    throw error;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
  });

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.institutionalEmail,
      role: user.role.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      institutionalEmail: user.institutionalEmail,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      status: user.status,
    },
  };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      teacherProfile: true,
    },
  });

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    institutionalEmail: user.institutionalEmail,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    role: user.role?.name,
    profile: user.teacherProfile,
  };
}

module.exports = {
  createRegistrationRequest,
  login,
  getMe,
};