const path = require("path");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const { createLinkedTransportPair } = require("./linked-transport");
const { createPostsMcpServer } = require("./posts-server-factory");
const { executeTool, TOOL_DEFINITIONS } = require("./posts-tool-handlers");
const { parseToolResultContent } = require("./mcp-tools-openai");

let embeddedClient = null;
let embeddedContext = null;

async function connectEmbedded(context) {
  const { clientTransport, serverTransport } = createLinkedTransportPair();
  const { server } = createPostsMcpServer(context);
  await server.connect(serverTransport);

  const client = new Client(
    { name: "amigojolive-api", version: "1.0.0" },
    { capabilities: {} }
  );
  await client.connect(clientTransport);

  embeddedClient = client;
  embeddedContext = context;
  return client;
}

async function connectStdio() {
  const serverPath =
    process.env.MCP_POSTS_SERVER_PATH ||
    path.join(__dirname, "posts-server.js");

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    env: {
      ...process.env,
      MCP_DEV_USER_ID: process.env.MCP_DEV_USER_ID ?? "",
      MCP_DEV_ROLE: process.env.MCP_DEV_ROLE ?? "docente",
    },
  });

  const client = new Client(
    { name: "amigojolive-api", version: "1.0.0" },
    { capabilities: {} }
  );
  await client.connect(transport);
  return client;
}

async function getMcpClient(context = {}) {
  const mode = (process.env.MCP_MODE || "embedded").toLowerCase();

  if (mode === "stdio") {
    return connectStdio();
  }

  if (
    embeddedClient &&
    embeddedContext?.userId === context.userId &&
    embeddedContext?.role === context.role
  ) {
    return embeddedClient;
  }

  if (embeddedClient) {
    try {
      await embeddedClient.close();
    } catch {
      /* ignore */
    }
    embeddedClient = null;
  }

  return connectEmbedded(context);
}

async function listTools(context) {
  const mode = (process.env.MCP_MODE || "embedded").toLowerCase();

  if (mode === "embedded" && !embeddedClient) {
    return {
      tools: TOOL_DEFINITIONS.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: buildJsonSchemaFromZodShape(t.inputSchema),
      })),
    };
  }

  const client = await getMcpClient(context);
  return client.listTools();
}

function buildJsonSchemaFromZodShape(shape) {
  if (!shape || Object.keys(shape).length === 0) {
    return { type: "object", properties: {} };
  }
  const properties = {};
  const required = [];
  for (const [key, schema] of Object.entries(shape)) {
    const def = schema?._def;
    const typeName = def?.typeName ?? "ZodUnknown";
    let jsonType = "string";
    if (typeName === "ZodNumber") jsonType = "number";
    if (typeName === "ZodBoolean") jsonType = "boolean";
    if (typeName === "ZodArray") jsonType = "array";
    properties[key] = { type: jsonType };
    if (!schema.isOptional?.()) {
      required.push(key);
    }
  }
  return {
    type: "object",
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

async function callTool(name, args, context = {}) {
  const mode = (process.env.MCP_MODE || "embedded").toLowerCase();

  if (mode === "embedded") {
    const result = await executeTool(name, args, {
      userId: context.userId ?? null,
      role: context.role ?? null,
    });
    if (result.isError) {
      const parsed = parseToolResultContent(result);
      const err = new Error(parsed?.error ?? "Error en herramienta MCP");
      err.statusCode = parsed?.statusCode ?? 500;
      throw err;
    }
    return parseToolResultContent(result);
  }

  const client = await getMcpClient(context);
  const result = await client.callTool({
    name,
    arguments: args ?? {},
  });

  if (result.isError) {
    const parsed = parseToolResultContent(result);
    const err = new Error(parsed?.error ?? "Error en herramienta MCP");
    err.statusCode = parsed?.statusCode ?? 500;
    throw err;
  }

  return parseToolResultContent(result);
}

async function readResource(uri, context = {}) {
  const client = await getMcpClient(context);
  const result = await client.readResource({ uri });
  const text = result.contents?.[0]?.text;
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function closeMcpClient() {
  if (embeddedClient) {
    try {
      await embeddedClient.close();
    } catch {
      /* ignore */
    }
    embeddedClient = null;
    embeddedContext = null;
  }
}

module.exports = {
  getMcpClient,
  listTools,
  callTool,
  readResource,
  closeMcpClient,
};
