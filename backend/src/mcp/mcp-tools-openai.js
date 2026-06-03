/**
 * Convierte herramientas MCP (listTools) al formato OpenAI function calling.
 */
function mcpToolsToOpenAI(mcpTools) {
  const tools = mcpTools?.tools ?? mcpTools ?? [];
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description ?? tool.title ?? tool.name,
      parameters: tool.inputSchema ?? { type: "object", properties: {} },
    },
  }));
}

function parseToolResultContent(result) {
  if (result?.structuredContent) {
    return result.structuredContent;
  }
  const textPart = result?.content?.find((c) => c.type === "text");
  if (!textPart?.text) {
    return null;
  }
  try {
    return JSON.parse(textPart.text);
  } catch {
    return textPart.text;
  }
}

module.exports = {
  mcpToolsToOpenAI,
  parseToolResultContent,
};
