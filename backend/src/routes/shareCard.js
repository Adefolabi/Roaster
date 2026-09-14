const express = require("express");
const { z } = require("zod");
const categories = require("../lib/categories");
const renderShareCard = require("../lib/renderShareCard");
const router = express.Router();

const MAX_FINDINGS = 6;

const findingSchema = z.object({
	category: z.enum(categories),
	roastLine: z.string().min(1),
	feedback: z.string().optional(),
	sticker: z.string().nullable().optional(),
});

const bodySchema = z.object({
	findings: z.array(findingSchema).min(1).max(MAX_FINDINGS),
	voice: z.string().optional(),
});

router.post("/", async (req, res) => {
	const result = bodySchema.safeParse(req.body);

	if (!result.success) {
		res.status(400).json({ message: "Expected a non-empty findings array" });
		return;
	}

	const { findings, voice } = result.data;

	try {
		const png = await renderShareCard(findings, voice);
		res.status(200);
		res.set("Content-Type", "image/png");
		res.set("Content-Disposition", 'inline; filename="roast-card.png"');
		res.send(png);
	} catch (error) {
		console.error("Error rendering share card:", error);
		res.status(500).json({ message: "Something went wrong generating your share card" });
	}
});

module.exports = router;
