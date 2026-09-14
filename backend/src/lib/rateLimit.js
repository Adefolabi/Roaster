const express = require("express");
const router = express.Router();

const DAILY_LIMIT = Number(process.env.DAILY_LIMIT) || 5;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Persists across requests — declared once, outside the handler
const memory = {};

function rateLimit(req, res, next) {
	const ip = req.ip;
	const now = Date.now();
	const entry = memory[ip];

	// Branch 1: unseen IP — create entry, allow
	if (!entry) {
		memory[ip] = { count: 1, resetAt: now + WINDOW_MS };
		return next();
	}

	// Branch 2: seen IP, but window has expired — reset, allow
	if (now >= entry.resetAt) {
		memory[ip] = { count: 1, resetAt: now + WINDOW_MS };
		return next();
	}

	// Branch 3: seen IP, window still active — check the count
	if (entry.count < DAILY_LIMIT) {
		entry.count++;
		return next();
	}

	// Over the limit — reject
	const retryInSeconds = Math.ceil((entry.resetAt - now) / 1000);
	return res.status(429).json({
		error: "Daily roast limit reached. Try again later.",
		retryInSeconds,
	});
}

module.exports = rateLimit;
