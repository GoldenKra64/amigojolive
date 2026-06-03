import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migraciones: conexión directa/sesión (5432). El pooler 6543 no sirve para migrate deploy.
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Debe definir DIRECT_URL o DATABASE_URL en el archivo .env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: databaseUrl,
  },
});