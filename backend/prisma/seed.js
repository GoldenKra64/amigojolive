require("dotenv/config");

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Iniciando seed inicial...");

  const roles = [
    {
      name: "docente",
      description: "Usuario docente de la plataforma",
    },
    {
      name: "moderador",
      description: "Usuario encargado de moderar contenido y reportes",
    },
    {
      name: "admin",
      description: "Administrador del sistema con permisos de gestión",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        active: true,
      },
      create: {
        name: role.name,
        description: role.description,
        active: true,
      },
    });
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  if (!adminRole) {
    throw new Error("No se pudo encontrar el rol admin.");
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@institucion.edu.ec";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123456";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: {
      institutionalEmail: adminEmail.toLowerCase(),
    },
    update: {
      passwordHash,
      roleId: adminRole.id,
      status: "ACTIVO",
    },
    create: {
      institutionalEmail: adminEmail.toLowerCase(),
      passwordHash,
      firstName: "Administrador",
      lastName: "Sistema",
      status: "ACTIVO",
      roleId: adminRole.id,
    },
  });

  console.log("Roles creados o actualizados correctamente.");
  console.log(`Usuario administrador inicial: ${adminUser.institutionalEmail}`);
  console.log("Seed finalizada correctamente.");
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });