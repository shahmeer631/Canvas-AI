import { z } from 'zod';
import { CanvasNode, ValidationResult } from '../types/index';

// ============================================================
// Canvas boundaries
// ============================================================

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 700;
const MAX_NODES = 12;
const MAX_LABEL_LENGTH = 2;

// ============================================================
// Zod schema for a single canvas node
// ============================================================

const CanvasNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['circle', 'rectangle']),
  x: z.number(),
  y: z.number(),
  radius: z.number().min(5).max(100).optional(),
  width: z.number().min(10).max(300).optional(),
  height: z.number().min(10).max(300).optional(),
  fill: z
    .string()
    .regex(/^#[0-9A-Fa-f]{3,8}$|^rgb|^hsl/, 'Must be a valid CSS color')
    .optional()
    .default('#3B82F6'),
  label: z.string().max(MAX_LABEL_LENGTH).optional().default(''),
});

const CanvasResponseSchema = z.object({
  nodes: z.array(CanvasNodeSchema).max(MAX_NODES),
});

// ============================================================
// Clamp value between min and max
// ============================================================

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

// ============================================================
// Auto-fix node dimensions
// ============================================================

function normalizeNode(raw: z.infer<typeof CanvasNodeSchema>): CanvasNode {
  const node = { ...raw } as CanvasNode;

  if (node.type === 'circle') {
    node.radius = clamp(raw.radius ?? 30, 10, 80);
    node.width = node.radius * 2;
    node.height = node.radius * 2;
    // Clamp position so circle stays fully inside canvas
    node.x = clamp(node.x, node.radius, CANVAS_WIDTH - node.radius);
    node.y = clamp(node.y, node.radius, CANVAS_HEIGHT - node.radius);
  } else {
    node.width = clamp(raw.width ?? 80, 20, 250);
    node.height = clamp(raw.height ?? 50, 20, 200);
    node.radius = 0;
    // Clamp so rectangle stays fully inside canvas
    node.x = clamp(node.x, 0, CANVAS_WIDTH - node.width);
    node.y = clamp(node.y, 0, CANVAS_HEIGHT - node.height);
  }

  node.fill = raw.fill ?? '#3B82F6';
  node.label = (raw.label ?? '').slice(0, MAX_LABEL_LENGTH);

  return node;
}

// ============================================================
// Main validation entry point
// ============================================================

export function validateAndSanitize(raw: unknown): ValidationResult {
  const errors: string[] = [];

  const parseResult = CanvasResponseSchema.safeParse(raw);

  if (!parseResult.success) {
    return {
      valid: false,
      nodes: [],
      errors: parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
  }

  const normalized: CanvasNode[] = parseResult.data.nodes.map((n) => normalizeNode(n));

  // Ensure unique IDs
  const ids = new Set<string>();
  const deduped: CanvasNode[] = [];
  for (const node of normalized) {
    if (ids.has(node.id)) {
      errors.push(`Duplicate id "${node.id}" removed`);
    } else {
      ids.add(node.id);
      deduped.push(node);
    }
  }

  return { valid: true, nodes: deduped, errors };
}

// ============================================================
// Validate a node-move payload
// ============================================================

const NodeMoveSchema = z.object({
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
});

export function validateNodeMove(payload: unknown): { id: string; x: number; y: number } | null {
  const result = NodeMoveSchema.safeParse(payload);
  if (!result.success) return null;
  return result.data;
}
