const { response, chat, chatStream } = require("../../lib/openai");
const { chatWithForumTools } = require("../ai/ai.orchestrator");
const { buildMcpContext } = require("../ai/ai.service");

async function getResponse(prompt) {
    return await response(prompt);
}

async function sendChat(messages) {
    return await chat(messages);
}

async function sendChatStream(messages, onToken) {
    return await chatStream(messages, onToken);
}

async function sendChatWithForumContext(messages, user) {
    const mcpContext = buildMcpContext(user);
    return chatWithForumTools(messages, mcpContext);
}

module.exports = {
    getResponse,
    sendChat,
    sendChatStream,
    sendChatWithForumContext,
};