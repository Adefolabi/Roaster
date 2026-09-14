const express = require("express");
const pdf = require("pdf-parse");

async function extractText(fileBuffer) {
	const text = await pdf(fileBuffer)
		.then(function (data) {
			// The actual text content
			return data.text;
		})
		.catch(function (error) {
			console.error("Error parsing PDF:", error);
			return null;
		});

	if (!text) {
		return null;
	}

	return text;
}

module.exports = extractText;
