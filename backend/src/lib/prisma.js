require("dotenv/config");

const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const {
  resolvePostgresConnectionString,
  sslOptionForPg,
} = require("./resolve-database-url");

const connectionString = resolvePostgresConnectionString();
const ssl = sslOptionForPg(connectionString);

const pool = new Pool({
  connectionString,
  ...(ssl !== undefined ? { ssl } : {}),
  connectionTimeoutMillis: 60_000,
  max: 10,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;
