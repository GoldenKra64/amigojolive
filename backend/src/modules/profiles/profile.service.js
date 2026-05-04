const prisma = require("../../lib/prisma");

async function getMyProfile(userId) {
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
    role: user.role?.name,
    profile: user.teacherProfile,
  };
}

async function updateMyProfile(userId, data) {
  const { firstName, lastName, area, description, photoUrl } = data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      teacherProfile: true,
    },
  });

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: firstName?.trim() || user.firstName,
      lastName: lastName?.trim() || user.lastName,
      teacherProfile: {
        upsert: {
          create: {
            area: area?.trim() || null,
            description: description?.trim() || null,
            photoUrl: photoUrl?.trim() || null,
          },
          update: {
            area: area !== undefined ? area?.trim() || null : user.teacherProfile?.area,
            description:
              description !== undefined
                ? description?.trim() || null
                : user.teacherProfile?.description,
            photoUrl:
              photoUrl !== undefined
                ? photoUrl?.trim() || null
                : user.teacherProfile?.photoUrl,
          },
        },
      },
    },
    include: {
      role: true,
      teacherProfile: true,
    },
  });

  return {
    id: updatedUser.id,
    institutionalEmail: updatedUser.institutionalEmail,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    role: updatedUser.role?.name,
    profile: updatedUser.teacherProfile,
  };
}

module.exports = {
  getMyProfile,
  updateMyProfile,
};