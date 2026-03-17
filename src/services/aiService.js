import { validateSketchCode } from '../utils/buildSketchHtml';

const FIRST_REPLY_DISCLAIMER = `DISCLAIMER: Razzle Dazzle is a sketch tool, not a mental health service. If you need professional support, please seek professional help. To get Razzle Dazzle back on track, describe the scene, imagery, colors, motion, weather, or emotions you want visualized.`;

let chatHistory = [];
let conversationSummary = '';
let hasShownFirstReplyDisclaimer = false;

async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed.');
  }

  return payload;
}

async function getJson(path) {
  const response = await fetch(path);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error || 'Request failed. Make sure the API server is running and OPENAI_API_KEY is set in .env.'
    );
  }

  return payload;
}

function assertValidSketch(code, label) {
  const result = validateSketchCode(code);
  if (!result.ok) {
    throw new Error(`${label} returned invalid JavaScript: ${result.error}`);
  }
  return result.code;
}

export function initChat() {
  chatHistory = [];
  conversationSummary = '';
  hasShownFirstReplyDisclaimer = false;
}

export async function sendChatMessage(text) {
  if (chatHistory.length === 0) {
    const initData = await getJson('/api/init');
    chatHistory = initData.messages;
  }

  chatHistory.push({ role: 'user', content: text });

  const { content: rawResponse } = await postJson('/api/chat', { messages: chatHistory });
  chatHistory.push({ role: 'assistant', content: rawResponse });

  const response = hasShownFirstReplyDisclaimer
    ? rawResponse
    : `${FIRST_REPLY_DISCLAIMER}\n\n${rawResponse}`;

  hasShownFirstReplyDisclaimer = true;

  if (rawResponse.includes('[READY_TO_SKETCH]')) {
    const parts = rawResponse.split('[READY_TO_SKETCH]');
    const summary = parts[1]?.trim() || '';
    conversationSummary = summary;
    const displayParts = response.split('[READY_TO_SKETCH]');
    return {
      text: displayParts[0].trim() + (displayParts[0].trim() ? '\n\n' : '') + summary,
      ready: true,
      summary,
    };
  }

  return { text: response, ready: false };
}

export async function requestSketchNow() {
  const userMessages = chatHistory
    .filter(message => message.role === 'user')
    .map(message => message.content)
    .join('\n');

  const { content: response } = await postJson('/api/sketch-now', { messages: chatHistory });

  if (response.includes('[READY_TO_SKETCH]')) {
    const parts = response.split('[READY_TO_SKETCH]');
    conversationSummary = parts[1]?.trim() || userMessages;
  } else {
    conversationSummary = userMessages;
  }

  return conversationSummary;
}

export function getSummary() {
  return conversationSummary;
}

export async function generateProofSketches(summary, sketchMode, song, emotions = [], weather = 'n/a') {
  const { sketches } = await postJson('/api/generate', {
    summary,
    sketchMode,
    song,
    emotions,
    weather,
  });

  if (!Array.isArray(sketches) || sketches.length !== 4) {
    throw new Error(`Expected 4 sketches, got ${sketches?.length ?? 0}`);
  }

  return sketches.map((code, index) => assertValidSketch(code, `Sketch ${index + 1}`));
}

export async function iterateSketch(summary, sketchMode, currentCode, feedbackHistory, song) {
  const { code } = await postJson('/api/iterate', {
    summary,
    sketchMode,
    currentCode,
    feedbackHistory,
    song,
  });

  return assertValidSketch(code, 'Refined sketch');
}
