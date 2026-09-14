const express = require("express");
const multer = require("multer");
const rateLimit = require("../lib/rateLimit");
const extractText = require("../lib/extractText");
const buildPrompt = require("../lib/buildPrompt");
const getClaudeResponse = require("../lib/claudeClient");
const validateResponse = require("../lib/validateResponse");
const getSticker = require("../lib/stickerMap");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", rateLimit, upload.single("cv"), async (req, res) => {
	const voice = req.body.voice;

	if (!req.file) {
		res.status(400).json({ message: "import file" });
		return;
	}

	// Extract file text
	const fileText = await extractText(req.file.buffer);

	// if file format is wrong
	if (fileText === null) {
		res.status(400).json({ message: "Wrong file format" });
		return;
	}

	try {
		// Build prompt
		const prompt = buildPrompt(fileText, voice);

		// Claude response
		const response = await getClaudeResponse(prompt.system, prompt.messages);

		if (response === null) {
			res.status(500).json({ message: "AI unavailable" });
			return;
		}

		// Validate + parse Claude's JSON output
		const findings = validateResponse(response);

		if (!findings) {
			res.status(500).json({ message: "AI returned an unexpected format" });
			return;
		}

		const findingsWithStickers = findings.map((finding) => ({
			...finding,
			sticker: getSticker(finding.category),
		}));

		res.status(200).json({ findings: findingsWithStickers, voice });
	} catch (error) {
		console.error("Error in /api/roast pipeline:", error);
		res
			.status(500)
			.json({ message: "Something went wrong generating your roast" });
	}
});

module.exports = router;
