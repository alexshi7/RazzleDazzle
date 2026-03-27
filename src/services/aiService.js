import { validateSketchCode } from '../utils/buildSketchHtml';

let chatHistory = [];
let conversationSummary = '';

const MODE_SYSTEM_PREFIX = 'CURRENT_SKETCH_DIRECTION:';

function getModeInstruction(sketchMode) {
  if (sketchMode === 'literal') {
    return `${MODE_SYSTEM_PREFIX} literal\nThe user currently wants a literal sketch. Ask about concrete scene details, visible objects, place, people, weather, lighting, and actions. Keep the conversation grounded in what was actually there.`;
  }

  if (sketchMode === 'abstract') {
    return `${MODE_SYSTEM_PREFIX} abstract\nThe user currently wants an abstract sketch. Ask about emotional tone, rhythm, motion, color, intensity, atmosphere, and sensory feeling. Do not steer toward concrete scene reconstruction unless the user asks for it.`;
  }

  return `${MODE_SYSTEM_PREFIX} unspecified\nThe user has not chosen a sketch direction yet.`;
}

function syncSketchMode(sketchMode) {
  const modeMessage = { role: 'system', content: getModeInstruction(sketchMode) };
  const existingIndex = chatHistory.findIndex(
    message => message.role === 'system' && message.content?.startsWith(MODE_SYSTEM_PREFIX)
  );

  if (existingIndex === -1) {
    chatHistory.push(modeMessage);
    return;
  }

  chatHistory[existingIndex] = modeMessage;
}

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
}

export async function sendChatMessage(text, sketchMode) {
  if (chatHistory.length === 0) {
    const initData = await getJson('/api/init');
    chatHistory = initData.messages;
  }

  syncSketchMode(sketchMode);
  chatHistory.push({ role: 'user', content: text });

  const { content: rawResponse } = await postJson('/api/chat', { messages: chatHistory });
  chatHistory.push({ role: 'assistant', content: rawResponse });

  if (rawResponse.includes('[READY_TO_SKETCH]')) {
    const parts = rawResponse.split('[READY_TO_SKETCH]');
    const summary = parts[1]?.trim() || '';
    conversationSummary = summary;
    const displayParts = rawResponse.split('[READY_TO_SKETCH]');
    return {
      text: displayParts[0].trim() + (displayParts[0].trim() ? '\n\n' : '') + summary,
      ready: true,
      summary,
    };
  }

  return { text: rawResponse, ready: false };
}

export async function requestSketchNow(sketchMode) {
  syncSketchMode(sketchMode);

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

export async function generateProofSketches(summary, sketchMode, emotions = [], weather = 'n/a') {
  const { sketches } = await postJson('/api/generate', {
    summary,
    sketchMode,
    emotions,
    weather,
  });

  if (!Array.isArray(sketches) || sketches.length !== 4) {
    throw new Error(`Expected 4 sketches, got ${sketches?.length ?? 0}`);
  }

  return sketches.map((code, index) => assertValidSketch(code, `Sketch ${index + 1}`));
}

export async function iterateSketch(summary, sketchMode, currentCode, feedbackHistory) {
  const { code } = await postJson('/api/iterate', {
    summary,
    sketchMode,
    currentCode,
    feedbackHistory,
  });

  return assertValidSketch(code, 'Refined sketch');
}
