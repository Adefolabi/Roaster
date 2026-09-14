const VOICE_LABELS = {
	savage: "Savage",
	dryBritishRecruiter: "Dry British Recruiter",
	drillSergeant: "Drill Sergeant",
	pidgin: "Pidgin",
	default: "Savage",
};

function getVoiceLabel(voice) {
	return VOICE_LABELS[voice] || VOICE_LABELS.default;
}

module.exports = getVoiceLabel;
