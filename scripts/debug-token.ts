import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { signUserToken, verifyUserToken } from "../lib/auth";

async function main() {
  const token = signUserToken("8253f6d0-76d7-474d-a6aa-b86332ea9783", "admin");
  const session = verifyUserToken(token);
  console.log(
    JSON.stringify({
      step: "H5-node",
      tokenLen: token.length,
      nodeVerify: !!session,
      role: session?.role ?? null,
    })
  );

  const dot = token.lastIndexOf(".");
  const body = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const sigMatch = expected === sigHex;
  const payload = JSON.parse(
    atob(body.replace(/-/g, "+").replace(/_/g, "/"))
  );
  console.log(
    JSON.stringify({
      step: "H5-edge",
      edgeSigMatch: sigMatch,
      edgePayloadOk: !!payload.role && payload.exp > Date.now(),
      role: payload.role,
    })
  );
}

main().catch(console.error);
