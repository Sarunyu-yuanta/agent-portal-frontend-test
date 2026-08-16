import type { RJSFSchema } from "@rjsf/utils";

export interface OpenAPISpec {
  paths: Record<string, PathItem>;
  components?: { schemas?: Record<string, RJSFSchema> };
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
}

export interface Operation {
  tags?: string[];
  requestBody?: {
    content?: { "application/json"?: { schema?: { $ref?: string } } };
  };
}

export interface Resource {
  path: string;
  name: string;
  schema: RJSFSchema;
}

export interface ApiItem {
  id: number | string;
  [key: string]: unknown;
}

function resolveRef(ref: string, spec: OpenAPISpec): RJSFSchema | null {
  const parts = ref.split("/").filter((p) => p !== "#");
  let node: unknown = spec;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return null;
    node = (node as Record<string, unknown>)[part];
  }
  return (node as RJSFSchema) ?? null;
}

export function extractResources(spec: OpenAPISpec): Resource[] {
  const result: Resource[] = [];
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    if (path.includes("{")) continue;
    const postOp = item.post;
    if (!postOp?.requestBody) continue;
    const ref = postOp.requestBody.content?.["application/json"]?.schema?.$ref;
    if (!ref) continue;
    const schema = resolveRef(ref, spec);
    if (!schema) continue;
    const name = postOp.tags?.[0] ?? item.get?.tags?.[0] ?? path.replace(/^\//, "");
    result.push({ path, name, schema });
  }
  return result;
}

export function previewColumns(schema: RJSFSchema): string[] {
  return Object.keys(schema.properties ?? {});
}

export function formatCellValue(key: string, value: unknown, schema: RJSFSchema): string {
  if (value == null || value === "") return "—";
  const props = (schema.properties ?? {}) as Record<string, { type?: string; description?: string }>;
  const field = props[key];
  if (!field) return String(value);

  const desc = (field.description ?? "").toLowerCase();
  const keyLower = key.toLowerCase();
  const isNumeric = field.type === "number" || field.type === "integer";

  if (isNumeric && typeof value === "number") {
    const isPct = keyLower.includes("pct") || keyLower.includes("ytd") || keyLower.includes("probability") ||
      desc.includes("percentage") || desc.includes("percent");
    const isCurrency = desc.includes("฿") || desc.includes("thb") || desc.includes("millions");

    if (isPct) {
      const sign = value >= 0 ? "+" : "";
      return `${sign}${value}%`;
    }
    if (isCurrency) {
      if (value >= 1000) return `฿ ${(value / 1000).toFixed(1).replace(/\.0$/, "")}B`;
      return `฿ ${value}M`;
    }
  }

  return String(value);
}

export function formatColName(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^[a-z]/, (c) => c.toUpperCase())
    .trim();
}

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
