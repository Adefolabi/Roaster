# Roast My CV

Upload your resume/CV and get back a funny, persona-driven "roast" plus
genuine actionable feedback, each paired with a meme sticker.

This repo currently contains the **backend** only. The frontend (React) is
handled separately.

## Backend

### Install

```bash
cd backend
npm install
```

### Configure

Copy the example env file and fill in your Anthropic API key:

```bash
cp .env.example .env
```

| Variable              | Description                                      |
| ---------------------- | ------------------------------------------------- |
| `ANTHROPIC_API_KEY`    | Your Anthropic API key, used by `src/lib/claudeClient.js` |
| `PORT`                 | Port the Express server listens on (default 3001) |
| `RATE_LIMIT_PER_DAY`   | Max `/api/roast` requests allowed per IP per day   |

### Run

```bash
npm start
```

or, with auto-restart on file changes:

```bash
npm run dev
```

The server boots on `http://localhost:3001` (or your configured `PORT`).
Check it's alive:

```bash
curl http://localhost:3001/api/health
```

### API

- `GET /api/health` — liveness check.
- `POST /api/roast` — multipart form upload, field name `cv`. Runs the full
  pipeline: rate limit → extract text → build prompt → call Claude →
  validate response → attach stickers.
- `POST /api/share-card` — JSON body `{ findings: [{ category, roastLine, sticker? }], voice? }`
  (the same shape returned by `/api/roast`, 1-6 findings). Renders a PNG
  "roast card" image summarizing the findings, stickers, and persona voice.

### Project structure

```
backend/
├── src/
│   ├── routes/        # Express route handlers
│   ├── lib/            # Pipeline logic (currently stubbed placeholders)
│   ├── assets/stickers/ # Meme sticker images, by category
│   └── server.js       # App entry point
├── .env.example
└── package.json
```

Each file under `src/lib/` currently returns placeholder/mock data so the
whole pipeline runs end-to-end before real logic is filled in.
