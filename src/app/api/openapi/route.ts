import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = join(process.cwd(), "public", "openapi.yaml");
    const content = readFileSync(filePath, "utf8");
    const spec = yaml.load(content);
    return NextResponse.json(spec);
  } catch (err) {
    console.error("[/api/openapi]", err);
    return NextResponse.json(
      { error: "Failed to read openapi.yaml" },
      { status: 500 }
    );
  }
}
