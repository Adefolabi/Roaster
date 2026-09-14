const fs = require("fs");
const path = require("path");
const CATEGORIES = require("./categories");

const STICKERS_DIR = path.join(__dirname, "..", "assets", "stickers");

/**
 * Looks up a meme sticker for a given finding category. Picks randomly
 * among the files in that category's folder; falls back to "generic" for
 * unrecognized categories or empty folders.
 *
 * @param {string} category - finding category, e.g. "buzzword_soup"
 * @returns {string} public URL path to the sticker, served from /assets/stickers
 */
function getSticker(category) {
	const folder = CATEGORIES.includes(category) ? category : "generic";

	const files = listStickerFiles(folder);
	if (files.length > 0) {
		const file = files[Math.floor(Math.random() * files.length)];
		return `/assets/stickers/${folder}/${file}`;
	}

	// Folder has no real assets yet — fall back to generic.
	if (folder !== "generic") {
		const genericFiles = listStickerFiles("generic");
		if (genericFiles.length > 0) {
			const file = genericFiles[Math.floor(Math.random() * genericFiles.length)];
			return `/assets/stickers/generic/${file}`;
		}
	}

	return null;
}

function listStickerFiles(folder) {
	try {
		return fs
			.readdirSync(path.join(STICKERS_DIR, folder))
			.filter((f) => !f.startsWith("."));
	} catch (error) {
		return [];
	}
}

module.exports = getSticker;
