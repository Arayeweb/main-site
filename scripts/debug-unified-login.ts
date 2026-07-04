import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { authenticateAdmin } from "../lib/adminLogin";

async function main() {
  const result = await authenticateAdmin("abtin@araaye.com", "change-me-now-1!");
  console.log(
    JSON.stringify({
      step: "post-fix-unified",
      ok: result.ok,
      error: !result.ok ? result.error : null,
      role: result.ok ? result.role : null,
    })
  );
}

main().catch(console.error);
