const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { STICKERS_DIR } = require("./stickerMap");
const getVoiceLabel = require("./voiceLabels");

const WIDTH = 1200;
const PADDING = 60;
const HEADER_HEIGHT = 210;
const FOOTER_HEIGHT = 90;
const ROW_HEIGHT = 160;
const ROW_GAP = 24;

const CATEGORY_STYLE = {
	vague_metrics: { color: "#ff9f1c", emoji: "📊" },
	buzzword_soup: { color: "#e84855", emoji: "🍲" },
	wall_of_text: { color: "#8338ec", emoji: "📜" },
	passive_voice: { color: "#3a86ff", emoji: "😴" },
	no_summary: { color: "#ff006e", emoji: "❓" },
	generic_bullet: { color: "#06d6a0", emoji: "🔹" },
	generic: { color: "#6c757d", emoji: "🔥" },
};

/**
 * Renders a shareable PNG "roast card" summarizing a set of roast findings.
 *
 * @param {Array<{category: string, roastLine: string, sticker?: string|null}>} findings
 * @param {string} voice
 * @returns {Promise<Buffer>} PNG image buffer
 */
async function renderShareCard(findings, voice) {
	const height =
		HEADER_HEIGHT +
		findings.length * ROW_HEIGHT +
		(findings.length - 1) * ROW_GAP +
		FOOTER_HEIGHT;

	const rows = findings
		.map((finding, index) => renderRow(finding, index, height))
		.join("\n");

	const svg = `
<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color="#1a1a2e" />
			<stop offset="100%" stop-color="#16213e" />
		</linearGradient>
	</defs>
	<rect width="${WIDTH}" height="${height}" fill="url(#bg)" />
	${renderHeader(voice)}
	${rows}
	${renderFooter(height)}
</svg>`.trim();

	return sharp(Buffer.from(svg)).png().toBuffer();
}

function renderHeader(voice) {
	const pillText = `${escapeXml(getVoiceLabel(voice))} VOICE`;
	return `
	<text x="${PADDING}" y="80" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="#ffffff">🔥 Roast My CV</text>
	<rect x="${PADDING}" y="110" width="${measurePillWidth(pillText, 15, 40)}" height="44" rx="22" fill="#ff6b35" />
	<text x="${PADDING + 20}" y="139" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#1a1a2e">${pillText}</text>
	<line x1="${PADDING}" y1="${HEADER_HEIGHT - 20}" x2="${WIDTH - PADDING}" y2="${HEADER_HEIGHT - 20}" stroke="#ffffff22" stroke-width="2" />`;
}

function renderFooter(cardHeight) {
	const y = cardHeight - FOOTER_HEIGHT / 2 + 8;
	return `
	<line x1="${PADDING}" y1="${cardHeight - FOOTER_HEIGHT}" x2="${WIDTH - PADDING}" y2="${cardHeight - FOOTER_HEIGHT}" stroke="#ffffff22" stroke-width="2" />
	<text x="${WIDTH / 2}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#ffffff88">Made with Roast My CV 🔥</text>`;
}

function renderRow(finding, index, cardHeight) {
	const style = CATEGORY_STYLE[finding.category] || CATEGORY_STYLE.generic;
	const rowY = HEADER_HEIGHT + index * (ROW_HEIGHT + ROW_GAP);
	const iconSize = 110;
	const iconY = rowY + (ROW_HEIGHT - iconSize) / 2;
	const textX = PADDING + iconSize + 36;
	const textWidth = WIDTH - PADDING - textX;

	const icon = renderIcon(finding.sticker, style, PADDING, iconY, iconSize, index);
	const categoryLabel = escapeXml(formatCategory(finding.category));
	const lines = wrapText(finding.roastLine, textWidth, 30).slice(0, 3);

	const tagY = rowY + 34;
	const linesSvg = lines
		.map(
			(line, i) =>
				`<tspan x="${textX}" dy="${i === 0 ? 0 : 36}">${escapeXml(line)}</tspan>`,
		)
		.join("");

	return `
	<g>
		${icon}
		<rect x="${textX}" y="${tagY - 26}" width="${measurePillWidth(categoryLabel, 14, 16)}" height="30" rx="15" fill="${style.color}33" />
		<text x="${textX + 14}" y="${tagY - 6}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${style.color}">${categoryLabel}</text>
		<text x="${textX}" y="${tagY + 34}" font-family="Arial, sans-serif" font-size="26" fill="#ffffff">${linesSvg}</text>
	</g>`;
}

function renderIcon(stickerUrl, style, x, y, size, index) {
	const dataUri = loadStickerDataUri(stickerUrl);
	if (dataUri) {
		const clipId = `icon-clip-${index}`;
		return `
		<defs>
			<clipPath id="${clipId}">
				<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="16" />
			</clipPath>
		</defs>
		<image x="${x}" y="${y}" width="${size}" height="${size}" href="${dataUri}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />`;
	}

	const cx = x + size / 2;
	const cy = y + size / 2;
	return `
		<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="16" fill="${style.color}33" />
		<text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="56">${style.emoji}</text>`;
}

function loadStickerDataUri(stickerUrl) {
	if (!stickerUrl || typeof stickerUrl !== "string") return null;

	const prefix = "/assets/stickers/";
	if (!stickerUrl.startsWith(prefix)) return null;

	const relativePath = stickerUrl.slice(prefix.length);
	const filePath = path.resolve(STICKERS_DIR, relativePath);

	// Guard against path traversal escaping the stickers directory
	const relativeToStickers = path.relative(STICKERS_DIR, filePath);
	if (relativeToStickers.startsWith("..") || path.isAbsolute(relativeToStickers)) {
		return null;
	}

	try {
		const buffer = fs.readFileSync(filePath);
		const ext = path.extname(filePath).slice(1).toLowerCase();
		const mime = ext === "svg" ? "image/svg+xml" : `image/${ext === "jpg" ? "jpeg" : ext}`;
		return `data:${mime};base64,${buffer.toString("base64")}`;
	} catch (error) {
		return null;
	}
}

function formatCategory(category) {
	return category.replace(/_/g, " ").toUpperCase();
}

function measurePillWidth(text, charWidth = 14, extraPadding = 40) {
	return Math.round(text.length * charWidth) + extraPadding;
}

function wrapText(text, maxWidth, fontSize) {
	const avgCharWidth = fontSize * 0.56;
	const maxCharsPerLine = Math.max(10, Math.floor(maxWidth / avgCharWidth));

	const words = String(text).split(/\s+/).filter(Boolean);
	const lines = [];
	let current = "";

	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word;
		if (candidate.length > maxCharsPerLine && current) {
			lines.push(current);
			current = word;
		} else {
			current = candidate;
		}
	}
	if (current) lines.push(current);

	if (lines.length > 3) {
		lines[2] = lines[2].replace(/\s*\S*$/, "").trim() + "…";
		return lines.slice(0, 3);
	}

	return lines;
}

function escapeXml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

module.exports = renderShareCard;
