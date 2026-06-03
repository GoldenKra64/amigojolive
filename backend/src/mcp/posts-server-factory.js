const { McpServer, ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  TOOL_DEFINITIONS,
  createExecutionContext,
  executeTool,
  readPostResource,
  readTagsCatalogResource,
} = require("./posts-tool-handlers");

/**
 * Crea y configura un McpServer de publicaciones con el contexto de ejecución dado.
 */
function createPostsMcpServer(context = {}) {
  const execContext = createExecutionContext(context);
  const server = new McpServer(
    {
      name: "amigojolive-posts",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  for (const tool of TOOL_DEFINITIONS) {
    server.registerTool(
      tool.name,
      {
        title: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args) => executeTool(tool.name, args, execContext)
    );
  }

  server.registerResource(
    "post",
    new ResourceTemplate("post://{postId}", { list: undefined }),
    {
      title: "Publicación del foro",
      description: "Detalle de una publicación (contenido truncado)",
    },
    async (_uri, variables) => {
      const postId = Number(variables.postId);
      const resource = await readPostResource(postId, execContext);
      return {
        contents: [resource],
      };
    }
  );

  server.registerResource(
    "tags-catalog",
    "tags://catalog",
    {
      title: "Catálogo de etiquetas",
      description: "Lista de etiquetas válidas del foro",
    },
    async () => {
      const resource = await readTagsCatalogResource();
      return {
        contents: [resource],
      };
    }
  );

  return { server, execContext };
}

module.exports = {
  createPostsMcpServer,
};
