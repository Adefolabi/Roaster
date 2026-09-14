const SYSTEM_PROMPT_TEMPLATE = require("./promptTemplate");
const CATEGORIES = require("./categories");

const VOICE_DESCRIPTIONS = {
	savage:
		"Brutally sarcastic and merciless — holds nothing back, mocks weaknesses directly, no sugar-coating. Still clever, not just mean.",

	dryBritishRecruiter:
		"Deadpan, understated British wit — delivers devastating observations in the most polite, bored tone possible, as if mildly inconvenienced by how bad this is.",

	drillSergeant:
		"Loud, aggressive, all-caps energy — barks orders and insults like a military drill instructor who's disappointed in every recruit.",

	pidgin:
		"Speaks in Nigerian Pidgin — witty, blunt, and full of local flavor ('this one no clean at all,' 'oga, you wan hustle with this CV?'). Roasts like a sharp-tongued elder brother who won't let you carry last, but genuinely wants you to shine.",

	default:
		"Brutally sarcastic and merciless — holds nothing back, mocks weaknesses directly, no sugar-coating. Still clever, not just mean.",
};

function buildPrompt(fileText, voice) {
	if (!fileText) {
		throw new Error("buildPrompt: fileText is required");
	}

	// Fall back to default voice if an unrecognized key comes in
	const voiceDescription =
		VOICE_DESCRIPTIONS[voice] || VOICE_DESCRIPTIONS.default;

	const categoryList = CATEGORIES.join(", ");

	const system = SYSTEM_PROMPT_TEMPLATE.replace(
		"{{voiceDescription}}",
		voiceDescription,
	).replace("{{categoryList}}", categoryList);

	const messages = [
		{
			role: "user",
			content: `Here is the CV to roast:\n\n${fileText}`,
		},
	];

	return { system, messages };
}

module.exports = buildPrompt;
