const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
	if (!req.file) {
		return res.status(200).json({ message: "Upload a file" });
	}
	console.log("roast");
	return res.status(501).json({ message: "Share card generation is not implemented yet" });
});

module.exports = router;
