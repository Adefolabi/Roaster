const Anthropic = require("@anthropic-ai/sdk");

// create anthropic client 
const client = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getClaudeResponse(system, msg) {
	const params = {
		max_tokens: 4096,
		messages: msg,
		system: system,
		model: "claude-sonnet-5",
	};
	const message = await client.messages.create(params);
	const textBlock = message.content?.find((block) => block.type === "text");
	if (!textBlock) {
		return null;
	}
	return textBlock.text;
}

module.exports = getClaudeResponse;
