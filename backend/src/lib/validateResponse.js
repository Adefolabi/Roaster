const { z } = require("zod");
const categories = require("./categories");

const zodSchema = z.object({
	category: z.enum(categories),
	roastLine: z.string(),
	feedback: z.string(),
});

const responseSchema = z.array(zodSchema);

function validateResponse(response) {
	let parsedResponse;

	try {
		parsedResponse = JSON.parse(response);
	} catch (error) {
		console.error("Failed to parse Claude response as JSON:", error);
		return null;
	}

	const result = responseSchema.safeParse(parsedResponse);

	if (!result.success) {
		console.error("Claude response failed schema validation:", result.error);
		return null;
	}

	return result.data;
}

module.exports = validateResponse;
