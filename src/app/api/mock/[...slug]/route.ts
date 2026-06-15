import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

const BLOB_KEY = "mock-db.json";

// ── DB helpers ─────────────────────────────────────────────────────────────────

type DB = Record<string, Record<string, unknown>[]>;

// In-memory cache — ensures read-your-writes within the same server instance.
// Blob is the persistent backing store (survives cold starts / redeploys).
let memDb: DB | null = null;

function getBlobUrl(): string {
  const storeId = (process.env.BLOB_STORE_ID ?? "").replace("store_", "").toLowerCase();
  return `https://${storeId}.private.blob.vercel-storage.com/${BLOB_KEY}`;
}

async function readDB(): Promise<DB> {
  if (memDb !== null) return memDb;
  try {
    const res = await fetch(`${getBlobUrl()}?t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) { memDb = {}; return {}; }
    memDb = (await res.json()) as DB;
    return memDb;
  } catch {
    memDb = {};
    return {};
  }
}

async function writeDB(db: DB): Promise<void> {
  memDb = db;
  await put(BLOB_KEY, JSON.stringify(db), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

function nextId(items: Record<string, unknown>[]): number {
  if (!items.length) return 1;
  return Math.max(...items.map((i) => Number(i.id) || 0)) + 1;
}

// ── Route handlers ─────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const [resource, id] = slug;
  const db = await readDB();
  const items = db[resource] ?? [];

  if (id) {
    const item = items.find((i) => String(i.id) === id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: item });
  }

  return NextResponse.json({
    data: items,
    meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: items.length } },
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const [resource] = slug;
  const body = (await req.json()) as Record<string, unknown>;
  const db = await readDB();

  if (!db[resource]) db[resource] = [];
  const newItem = { id: nextId(db[resource]), ...body };
  db[resource].push(newItem);
  await writeDB(db);

  return NextResponse.json({ data: newItem }, { status: 201 });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const [resource, id] = slug;
  const body = (await req.json()) as Record<string, unknown>;
  const db = await readDB();

  const items = db[resource] ?? [];
  const idx = items.findIndex((i) => String(i.id) === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  items[idx] = { id: items[idx].id, ...body };
  db[resource] = items;
  await writeDB(db);

  return NextResponse.json({ data: items[idx] });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const [resource, id] = slug;
  const db = await readDB();

  if (db[resource]) {
    db[resource] = db[resource].filter((i) => String(i.id) !== id);
    await writeDB(db);
  }

  return new NextResponse(null, { status: 204 });
}

// ── Seed: PATCH /api/mock/_seed ────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  if (slug[0] !== "_seed") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const seed = (await req.json()) as DB;
  await writeDB(seed);
  return NextResponse.json({ ok: true });
}
