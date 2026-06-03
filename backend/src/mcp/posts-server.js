#!/usr/bin/env node
require("dotenv/config");

const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { createPostsMcpServer } = require("./posts-server-factory");

async function main() {
  const userId = process.env.MCP_DEV_USER_ID
    ? Number(process.env.MCP_DEV_USER_ID)
    : null;
  const role = process.env.MCP_DEV_ROLE ?? "docente";

  if (process.env.NODE_ENV === "production" && !userId) {
    console.error(
      "MCP stdio en producción requiere MCP_DEV_USER_ID o usar MCP_MODE=embedded en la API."
    );
    process.exit(1);
  }

  const { server } = createPostsMcpServer({ userId, role });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
