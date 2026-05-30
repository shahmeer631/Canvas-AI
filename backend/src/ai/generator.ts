import { CanvasNode } from '../types/index';
import { validateAndSanitize, CANVAS_WIDTH, CANVAS_HEIGHT } from '../services/validation';

// ============================================================
// System prompt — strict JSON-only output enforced
// ============================================================

export const SYSTEM_PROMPT = `You are a canvas layout engine. Your ONLY job is to return a single valid JSON object.

RULES (NEVER break these):
1. Output ONLY a JSON object. No markdown. No code blocks. No explanations. No preamble. No trailing text.
2. The JSON must have a single key "nodes" containing an array of shape objects.
3. Maximum 12 nodes total.
4. Each node MUST have exactly these fields:
   - id: string like "node-1", "node-2" etc (must be unique)
   - type: "circle" OR "rectangle" (no other values)
   - x: number (horizontal center for circle, left edge for rectangle)
   - y: number (vertical center for circle, top edge for rectangle)
   - radius: number (ONLY for circles, between 20 and 60)
   - width: number (ONLY for rectangles, between 60 and 180)
   - height: number (ONLY for rectangles, between 40 and 100)
   - fill: a hex color string like "#3B82F6"
   - label: a string of AT MOST 2 characters (can be empty string)

5. Canvas is ${CANVAS_WIDTH}x${CANVAS_HEIGHT} pixels.
   - For circles: x must be between radius and ${CANVAS_WIDTH}-radius. y must be between radius and ${CANVAS_HEIGHT}-radius.
   - For rectangles: x must be between 0 and ${CANVAS_WIDTH}-width. y must be between 0 and ${CANVAS_HEIGHT}-height.

6. Choose attractive, harmonious fill colors. Use blues, purples, greens, teals, oranges as appropriate.
7. Distribute nodes with good spacing. Avoid overlaps.
8. For "star layout" patterns: place 1 center node, surround with evenly-spaced nodes in a circle around it.
9. For "grid" patterns: compute equal row/column spacing.

Example output for "2 circles":
{"nodes":[{"id":"node-1","type":"circle","x":350,"y":350,"radius":35,"width":70,"height":70,"fill":"#3B82F6","label":"A"},{"id":"node-2","type":"circle","x":650,"y":350,"radius":35,"width":70,"height":70,"fill":"#8B5CF6","label":"B"}]}

IMPORTANT: Your entire response must be parseable by JSON.parse(). Nothing else.`;

// ============================================================
// Parse and validate AI response safely
// ============================================================

function safeParseJSON(text: string): unknown {
  // Strip any accidental markdown fences
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Find first '{' and last '}' to extract JSON even if there's surrounding junk
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in AI response');

  return JSON.parse(cleaned.slice(start, end + 1));
}

// ============================================================
// Groq provider
// ============================================================

async function generateWithGroq(prompt: string): Promise<CanvasNode[]> {
  const { default: Groq } = await import('groq-sdk');
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const text = response.choices[0]?.message?.content ?? '';
  const parsed = safeParseJSON(text);
  const result = validateAndSanitize(parsed);
  if (!result.valid) throw new Error(`Validation failed: ${result.errors.join(', ')}`);
  return result.nodes;
}

// ============================================================
// OpenAI provider
// ============================================================

async function generateWithOpenAI(prompt: string): Promise<CanvasNode[]> {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content ?? '';
  const parsed = safeParseJSON(text);
  const result = validateAndSanitize(parsed);
  if (!result.valid) throw new Error(`Validation failed: ${result.errors.join(', ')}`);
  return result.nodes;
}

// ============================================================
// Main generate function with retry logic
// ============================================================

const MAX_RETRIES = 2;

export async function generateCanvasNodes(prompt: string): Promise<CanvasNode[]> {
  const provider = (process.env.AI_PROVIDER ?? 'groq').toLowerCase();

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[AI] Attempt ${attempt}/${MAX_RETRIES} with provider: ${provider}`);

      if (provider === 'openai') {
        return await generateWithOpenAI(prompt);
      } else {
        // Default: Groq
        return await generateWithGroq(prompt);
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[AI] Attempt ${attempt} failed: ${lastError.message}`);
      // Small delay before retry
      if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, 800));
    }
  }

  throw lastError ?? new Error('AI generation failed after all retries');
}
