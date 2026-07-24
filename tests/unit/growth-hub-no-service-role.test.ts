import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx)$/.test(name)) acc.push(p);
  }
  return acc;
}

describe("Growth Hub — no service-role in client portal loaders", () => {
  it("app/app/** does not import getSupabaseAdmin", () => {
    const root = join(process.cwd(), "app/app");
    const files = walk(root);
    expect(files.length).toBeGreaterThan(0);
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      if (
        src.includes("getSupabaseAdmin") ||
        src.includes("SUPABASE_SERVICE_ROLE_KEY")
      ) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });
});
