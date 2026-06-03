const { z } = require("zod");
const { chatWithTools, chatCompletionRaw } = require("../../lib/openai");
const { listTools, callTool } = require("../../mcp/mcp-client");
const { mcpToolsToOpenAI } = require("../../mcp/mcp-tools-openai");

const CLASSIFY_SYSTEM_PROMPT = `Eres un asistente de clasificación pedagógica para el foro AmigojoLive (Fe y Alegría).
Debes analizar publicaciones de docentes y sugerir etiquetas SOLO del catálogo proporcionado.
Responde únicamente con JSON válido sin markdown, con esta forma:
{"suggestedTagIds":[1,2],"suggestedTagNames":["Nombre"],"pedagogicalScore":0.0,"rationale":"..."}
pedagogicalScore es un número entre 0 y 1 indicando valor pedagógico percibido.`;

const classifyResultSchema = z.object({
  suggestedTagIds: z.array(z.number().int()),
  suggestedTagNames: z.array(z.string()),
  pedagogicalScore: z.number().min(0).max(1).optional(),
  rationale: z.string().optional(),
});

const FORUM_CHAT_SYSTEM_PROMPT = `Eres un asistente educativo del foro AmigojoLive.
Puedes consultar publicaciones del foro usando las herramientas disponibles.
Mantén respuestas centradas en educación y en el contenido del foro.`;

const MAX_ITERATIONS = Number(process.env.AI_AGENT_MAX_ITERATIONS) || 5;
const CLASSIFY_MAX_TOKENS = Number(process.env.AI_CLASSIFY_MAX_TOKENS) || 800;

const FORUM_TOOL_NAMES = new Set([
  "posts_get_feed",
  "posts_get_by_id",
  "posts_list_tags",
]);

async function runAgentLoop({
  messages,
  mcpContext,
  toolFilter,
  systemPrompt,
  maxIterations = MAX_ITERATIONS,
  maxTokens,
}) {
  const toolsList = await listTools(mcpContext);
  let openAiTools = mcpToolsToOpenAI(toolsList);

  if (toolFilter) {
    openAiTools = openAiTools.filter((t) => toolFilter(t.function.name));
  }

  const conversation = [
    { role: "system", content: systemPrompt },
    ...messages.filter((m) => m.role !== "system"),
  ];

  for (let i = 0; i < maxIterations; i++) {
    const assistantMessage = await chatWithTools({
      messages: conversation,
      tools: openAiTools,
      maxTokens,
      systemPrompt,
    });

    conversation.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls;
    if (!toolCalls?.length) {
      return {
        finalMessage: assistantMessage,
        messages: conversation,
      };
    }

    for (const toolCall of toolCalls) {
      const fnName = toolCall.function.name;
      let fnArgs = {};
      try {
        fnArgs = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        fnArgs = {};
      }

      let toolResult;
      try {
        toolResult = await callTool(fnName, fnArgs, mcpContext);
      } catch (err) {
        toolResult = { error: err.message, statusCode: err.statusCode ?? 500 };
      }

      conversation.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      });
    }
  }

  const last = conversation[conversation.length - 1];
  return { finalMessage: last, messages: conversation };
}

function parseClassifyJson(text) {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
  const parsed = JSON.parse(jsonStr);
  return classifyResultSchema.parse(parsed);
}

async function classifyWithMcp({ title, content, mcpContext }) {
  const tagCatalog = await callTool("posts_list_tags", {}, mcpContext);
  const draftContext = await callTool(
    "posts_classify_draft",
    { title, content },
    mcpContext
  );

  const userPrompt = `Clasifica esta publicación:

Título: ${title}
Contenido: ${content}

Catálogo de etiquetas (usa solo estos ids y nombres):
${JSON.stringify(tagCatalog.tags ?? tagCatalog, null, 2)}

Contexto del borrador:
${JSON.stringify(draftContext, null, 2)}`;

  try {
    const { finalMessage } = await runAgentLoop({
      messages: [{ role: "user", content: userPrompt }],
      mcpContext,
      toolFilter: (name) => name === "posts_list_tags" || name === "posts_classify_draft",
      systemPrompt: CLASSIFY_SYSTEM_PROMPT,
      maxIterations: 3,
      maxTokens: CLASSIFY_MAX_TOKENS,
    });

    const content =
      typeof finalMessage.content === "string"
        ? finalMessage.content
        : JSON.stringify(finalMessage.content);

    return parseClassifyJson(content);
  } catch {
    const fallbackText = await chatCompletionRaw({
      messages: [
        { role: "system", content: CLASSIFY_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      maxTokens: CLASSIFY_MAX_TOKENS,
      temperature: 0.2,
    });
    return parseClassifyJson(fallbackText);
  }
}

async function chatWithForumTools(messages, mcpContext) {
  const { finalMessage } = await runAgentLoop({
    messages,
    mcpContext,
    toolFilter: (name) => FORUM_TOOL_NAMES.has(name),
    systemPrompt: FORUM_CHAT_SYSTEM_PROMPT,
    maxIterations: MAX_ITERATIONS,
  });

  return (
    finalMessage.content ||
    "No pude generar una respuesta en este momento."
  );
}

module.exports = {
  runAgentLoop,
  classifyWithMcp,
  chatWithForumTools,
  CLASSIFY_SYSTEM_PROMPT,
  classifyResultSchema,
};
