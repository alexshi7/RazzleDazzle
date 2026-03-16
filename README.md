# Razzle Dazzle

Razzle Dazzle is a React app built with Vite on the frontend and a small Node server on the backend. It turns a personal memory into animated p5.js sketch concepts: users describe an experience, choose planning inputs like weather and emotion, compare four generated sketches, then refine a selected sketch through feedback.

## How It Works

The app runs as two pieces:

- Frontend: React UI served by Vite for chat, planning controls, sketch previews, and refinement
- Backend: a small Node HTTP server that talks to the OpenAI API

The frontend never holds the OpenAI key. It sends requests to local `/api/*` endpoints, and the server reads `OPENAI_API_KEY` from the environment.

Current flow:

1. The user describes a memory.
2. The user explicitly chooses weather, emotion tags, and a sketch direction.
3. The chat model asks brief clarifying questions or produces a sketch-ready summary.
4. The server generates four p5.js sketch candidates.
5. The user selects one sketch and refines it with rating + text feedback.
6. The final sketch code can be copied into the p5 editor.

## Project Structure

```text
server/
  index.js             HTTP API endpoints
  openaiService.js     Server-side OpenAI calls and prompt logic

src/
  App.jsx                Main application flow
  services/aiService.js  Frontend API client for /api routes
  utils/buildSketchHtml.js
                         Sketch validation and iframe rendering helpers
```

## Environment Variables

Create a local `.env` file:

```env
OPENAI_API_KEY=your_real_openai_key
```

A placeholder template is included in [`.env.example`](./.env.example).

Notes:

- Do not prefix server secrets with `VITE_`
- Do not commit `.env`
- `.env.example` should contain placeholders only

## Local Development

Install dependencies:

```bash
npm install
```

Run the API server in one terminal:

```bash
npm run dev:server
```

Run the frontend in another:

```bash
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8787`.

## Production Build

Build the frontend:

```bash
npm run build
```

Start the API server:

```bash
npm run start:server
```

This repo currently includes the Node API server, but deployment is still your responsibility. For production, host the frontend and backend in a setup where the backend can securely read `OPENAI_API_KEY`.

## Security Notes

- OpenAI requests are handled server-side in [`server/openaiService.js`](./server/openaiService.js)
- The frontend calls local API routes through [`src/services/aiService.js`](./src/services/aiService.js)
- The repo is intended to be public, so never put real keys in tracked files
- If a key was ever exposed in an older client-side version, rotate it

## GitHub Setup

Before pushing this repo publicly:

1. Keep real secrets only in `.env`.
2. Keep [`.env.example`](./.env.example) as placeholders only.
3. Verify [`.gitignore`](./.gitignore) ignores `.env`.
4. Rotate any key that was previously exposed in an earlier browser-based version.

## Scripts

```bash
npm run dev          # start Vite frontend
npm run dev:server   # start local API server
npm run build        # build frontend assets
npm run preview      # preview built frontend
npm run start:server # start API server without Vite
npm run lint         # run ESLint
```

## Known Limitations

- The app currently depends on OpenAI availability and rate limits
- A few non-secret React hook lint warnings remain in the codebase
- Sketch generation quality still depends heavily on prompt compliance from the model
