/* global process */
import { existsSync, readFileSync } from 'node:fs';
import OpenAI from 'openai';
import { validateSketchCode } from '../src/utils/buildSketchHtml.js';

function loadEnvFile() {
  if (process.env.OPENAI_API_KEY || !existsSync('.env')) return;

  const contents = readFileSync('.env', 'utf8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY. Set OPENAI_API_KEY in your server environment.');
}

const openai = new OpenAI({ apiKey });

const CHAT_MODEL = 'gpt-4o-mini';
const SKETCH_MODEL = 'gpt-5.1';

const SYSTEM_INSTRUCTION = `You are a creative technologist helping users translate personal life experiences into p5.js visual art.

Your job: ask at most ONE short clarifying question per turn to understand the experience better — its emotional texture, key imagery, colors, mood, and rhythm. Be concise and warm.

Do not provide psychological advice, therapy guidance, crisis counseling, or self-help instructions. If the user shares distressing emotions, gently acknowledge them and redirect toward the visual and sensory details needed to make the sketch.

As soon as you have a reasonable understanding of the experience (even after just one user message if it's detailed enough), respond with the token [READY_TO_SKETCH] on its own line, followed by a one-sentence summary of what you'll create.

Do NOT ask more than 3 clarifying questions total before proceeding. Do NOT use [READY_TO_SKETCH] before the user has sent at least one message.`;

const CODE_RULES = `
CRITICAL CODE RULES — violating these will crash the sketch:
- Every statement must be on its own line and end with a semicolon.
- Use the p5 instance API throughout: p.setup, p.draw, p.background, p.fill, p.createCanvas, etc.
- p.createCanvas(600, 600) must be called inside p.setup.
- p.draw must animate; at least one visible property must change over time.
- No console.log, alert, DOM APIs, shaders, external assets, fonts, images, sound files, or libraries beyond p5.
- Return only code that can live inside: new p5(function(p) { ... })
- Keep the sketch stable and runnable; avoid undefined variables, missing semicolons, or broken loops.
- Make the visuals clearly visible on a 600x600 canvas.
`;

async function withRetry(fn, maxAttempts = 3, baseDelayMs = 5000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.message?.includes('429') || err.status === 429;
      if (attempt === maxAttempts) {
        if (is429) throw new Error('Rate limit reached. Please wait a moment and try again.');
        throw err;
      }
      if (!is429) throw err;
      const match = err.message?.match(/retry[^\d]*(\d+)s/i);
      const wait = match ? parseInt(match[1], 10) * 1000 : baseDelayMs * attempt;
      await new Promise(resolve => setTimeout(resolve, wait));
    }
  }
}

function assertValidSketch(code, label) {
  const result = validateSketchCode(code);
  if (!result.ok) {
    throw new Error(`${label} returned invalid JavaScript: ${result.error}`);
  }
  return result.code;
}

export function createInitialMessages() {
  return [{ role: 'system', content: SYSTEM_INSTRUCTION }];
}

export async function sendChatCompletion(messages) {
  return withRetry(() =>
    openai.chat.completions.create({ model: CHAT_MODEL, messages })
      .then(response => response.choices[0].message.content)
  );
}

export async function requestSketchSummary(messages) {
  const summaryPrompt = [
    ...messages,
    {
      role: 'user',
      content: 'Please summarize what you know about my experience in one sentence, then output [READY_TO_SKETCH] on its own line followed by that summary. Do it now even if you have more questions.',
    },
  ];

  return withRetry(() =>
    openai.chat.completions.create({ model: CHAT_MODEL, messages: summaryPrompt })
      .then(response => response.choices[0].message.content)
  );
}

export async function generateProofSketches(summary, sketchMode, emotions = [], weather = 'n/a') {
  const directionBlock = sketchMode === 'literal'
    ? `
DIRECTION: Literal.

Depict the user's experience as a recognizable animated scene based on the actual event or environment described.

Literal mode requirements:
- Show the real scene or moment, not an abstract interpretation.
- Include 3 to 5 concrete visual details grounded in the experience, such as people, silhouettes, objects, landmarks, weather, lighting, architecture, vehicles, furniture, or natural elements.
- Build a readable composition with foreground, middle ground, and background when possible.
- Animate real motion that could plausibly occur in the scene, such as walking, rain falling, traffic moving, lights flickering, snow drifting, water rippling, or crowds shifting.
- Use color and atmosphere to support mood, but keep the image representational and scene-based.
- Do not use purely abstract patterns, decorative geometry, or symbolic visuals unless they are clearly part of the real scene.

Variation rule for the 4 outputs:
All 4 sketches must depict the same underlying event or setting, but differ in composition and visual treatment. Vary them using things like:
- camera distance: wide shot, medium shot, close-up
- point of view: straight-on, side view, elevated view
- time emphasis: calmer moment, peak action moment, aftermath glow
- rendering style: silhouette-heavy, layered landscape, simplified illustrative scene, motion-emphasized scene
- motion language: drifting, pulsing, crowded, sparse, sweeping, flickering
- composition anchor: architecture-heavy, character-heavy, weather-heavy, object-heavy

Before writing code, identify the 3 to 5 most important visual details from the experience and make sure they appear clearly in each sketch.
`
    : `
DIRECTION: Abstract.

Do not depict the literal scene, place, or event. Instead, express the emotional character of the experience through non-representational animated visuals.

Abstract mode requirements:
- Translate feeling into motion, rhythm, density, contrast, shape behavior, and color.
- Avoid recognizable people, buildings, vehicles, rooms, landscapes, or story objects.
- Use non-representational systems such as particles, fields, waves, blobs, pulses, grids, swarms, smoke-like motion, ripples, or morphing forms.
- Let pacing, repetition, turbulence, softness, and spatial balance communicate the experience.
- The sketch should feel emotionally faithful, not narratively literal.

Variation rule for the 4 outputs:
All 4 sketches must express the same emotional core, but each must use a different visual system. Vary them using things like:
- particle system
- flowing wave field
- pulsing geometric composition
- drifting layered color field
- orbiting swarm
- jittering line network
- expanding ripple system
- morphing organic blob system
- dense vs sparse spatial distribution
- slow meditative motion vs jittery unstable motion

Before writing code, identify the main emotional qualities of the experience, such as calm, tension, grief, warmth, awe, confusion, intimacy, release, or momentum, and express those qualities visually.
`;

  const emotionBlock = emotions?.length
    ? `
EMOTIONAL CONTEXT:
The user selected these emotions: ${emotions.join(', ')}.

These emotions should meaningfully influence:
- color palette
- motion intensity
- pacing
- atmosphere
- softness vs harshness
- visual density
`
    : `
EMOTIONAL CONTEXT:
No specific emotions were selected.
Infer the emotional tone from the user's experience only.
`;

  const weatherBlock = weather && weather !== 'n/a'
    ? `
WEATHER CONTEXT:
The user selected this weather: ${weather}.

Reflect this when appropriate through:
- lighting
- particles
- atmosphere
- motion
- environmental texture
`
    : `
WEATHER CONTEXT:
No specific weather was selected.
Do not force weather into the sketch unless it is clearly implied by the experience.
`;

  const portfolioStructureBlock = sketchMode === 'literal'
    ? `
STRUCTURE OF THE 4 SKETCHES:
- Sketch 1 and Sketch 2 should be safe, basic, and faithful interpretations of the same experience. They should be clear, readable, and grounded in the story.
- Sketch 3 should be a stronger and more visually interesting interpretation that still faithfully represents the same scene or event.
- Sketch 4 should be the most visually bold, striking, and creative interpretation while still fully honoring the experience.
- Sketch 4 must still be high-quality, coherent, attractive, and runnable.
- Do not make Sketch 4 broken, low-effort, ugly, or obviously bad.
`
    : `
STRUCTURE OF THE 4 SKETCHES:
- Sketch 1 and Sketch 2 should be safe, basic, and faithful emotional interpretations of the experience. They should be clear, readable, and emotionally coherent.
- Sketch 3 should be a stronger and more visually interesting abstract interpretation that still matches the emotional core.
- Sketch 4 should be the most visually bold, striking, and creative interpretation while still matching the emotional core.
- Sketch 4 must still be high-quality, coherent, attractive, and runnable.
- Do not make Sketch 4 broken, low-effort, ugly, or obviously bad.
`;

  const prompt = `You are an expert creative coder making personal, expressive p5.js sketches.

EXPERIENCE:
${summary}

${directionBlock}
${emotionBlock}
${weatherBlock}
${portfolioStructureBlock}

You must generate EXACTLY 4 distinct p5.js sketches, and they must follow the required role of Sketch 1, Sketch 2, Sketch 3, and Sketch 4 described above.

Variation planning requirements:
- First decide on 4 clearly different interpretations before writing code.
- Each sketch must differ from the others on at least 3 axes chosen from: composition, viewpoint, scale, motion behavior, palette, density, shape language, level of detail, pacing, and atmosphere.
- Do not produce four minor variants of the same layout or animation system.
- Give each sketch a distinct visual thesis so a user can immediately tell why it exists.
- In literal mode, all four should feel like different cinematic readings of the same memory.
- In abstract mode, all four should feel like different visual metaphors for the same emotional core.

Global requirements:
- Each sketch must be meaningfully different from the others.
- Each sketch must be visually rich and clearly animated.
- Each sketch must be complete and runnable.
- Prioritize strong composition, visible motion, and emotional clarity.
- If emotions are provided, they must clearly influence the sketch design.
- If weather is provided and is not "n/a", it must clearly influence the sketch design.
- In literal mode, all 4 sketches must depict the same underlying event or setting.
- In abstract mode, all 4 sketches must express the same emotional core while using different visual systems.
- Maximize variety across the four outputs before maximizing polish within any one output.
${CODE_RULES}

Respond with a JSON object in this exact shape:
{"sketches":["...body1...","...body2...","...body3...","...body4..."]}

Each string must be the full code body for:
new p5(function(p) { YOUR CODE HERE })

Formatting requirements:
- Use \\n for newlines inside each string.
- Escape all internal double quotes as \\".
- Output only valid JSON.
`;

  const text = await withRetry(() =>
    openai.chat.completions.create({
      model: SKETCH_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }).then(response => response.choices[0].message.content)
  );

  const parsed = JSON.parse(text);
  const sketches = parsed.sketches;

  if (!Array.isArray(sketches) || sketches.length !== 4) {
    throw new Error(`Expected 4 sketches, got ${sketches?.length ?? 0}`);
  }

  return sketches.map((code, index) => assertValidSketch(code, `Sketch ${index + 1}`));
}

export async function iterateSketch(summary, sketchMode, currentCode, feedbackHistory) {
  const historyText = feedbackHistory
    .map((feedback, index) => `Round ${index + 1}: Rating ${feedback.rating}/5 — "${feedback.text}"`)
    .join('\n');

  const lastFeedback = feedbackHistory[feedbackHistory.length - 1];

  const directionLine = sketchMode === 'literal'
    ? `
MODE: Literal.
Preserve the sketch as a recognizable depiction of the user's real scene or event.
Do not abstract away the main setting, people, objects, or actions.
Keep the scene readable while applying the requested changes.
`
    : `
MODE: Abstract.
Preserve the sketch as non-representational and emotion-driven.
Do not introduce literal people, places, objects, or narrative scene elements unless the user explicitly asks for them.
Keep the result expressive, atmospheric, and abstract while applying the requested changes.
`;

  const prompt = `You are an expert creative coder refining a p5.js sketch based on user feedback.

ORIGINAL EXPERIENCE:
${summary}

${directionLine}

FEEDBACK HISTORY:
${historyText}

CURRENT CODE:
${currentCode}

The user's latest feedback:
Rating ${lastFeedback.rating}/5
"${lastFeedback.text}"

INSTRUCTIONS:
- Treat the latest feedback as the highest priority.
- Implement every specific requested change clearly and noticeably.
- If the user asks for more or less of something, make the difference visually obvious.
- Preserve the current mode: literal stays literal, abstract stays abstract.
- Keep any strong parts of the sketch that the user did not ask to change.
- Do not return explanations, comments, or markdown.
${CODE_RULES}

Output only the improved sketch body code.
`;

  const code = await withRetry(() =>
    openai.chat.completions.create({
      model: SKETCH_MODEL,
      messages: [{ role: 'user', content: prompt }],
    }).then(response => response.choices[0].message.content)
  );

  return assertValidSketch(
    code.replace(/```(?:javascript|js)?\s*/gi, '').replace(/```/g, '').trim(),
    'Refined sketch'
  );
}
