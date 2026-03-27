/* global Buffer, process */
import { createServer } from 'node:http';
import {
  createInitialMessages,
  generateProofSketches,
  iterateSketch,
  requestSketchSummary,
  sendChatCompletion,
} from './openaiService.js';

const PORT = Number(process.env.PORT || 8787);

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('Invalid JSON body.');
  }
}

function requireMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Expected a non-empty messages array.');
  }
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 404, { error: 'Not found.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  try {
    if (req.method === 'GET' && req.url === '/api/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && req.url === '/api/init') {
      sendJson(res, 200, { messages: createInitialMessages() });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/chat') {
      const body = await readJsonBody(req);
      requireMessages(body.messages);
      const content = await sendChatCompletion(body.messages);
      sendJson(res, 200, { content });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/sketch-now') {
      const body = await readJsonBody(req);
      requireMessages(body.messages);
      const content = await requestSketchSummary(body.messages);
      sendJson(res, 200, { content });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/generate') {
      const body = await readJsonBody(req);
      const sketches = await generateProofSketches(
        body.summary,
        body.sketchMode,
        body.emotions,
        body.weather
      );
      sendJson(res, 200, { sketches });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/iterate') {
      const body = await readJsonBody(req);
      const code = await iterateSketch(
        body.summary,
        body.sketchMode,
        body.currentCode,
        body.feedbackHistory
      );
      sendJson(res, 200, { code });
      return;
    }

    sendJson(res, 404, { error: 'Not found.' });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Server error.',
    });
  }
});

server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
