import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { verifyPassword } from "../lib/auth";
import { getSupabaseAdmin } from "../lib/supabase";

async function main() {
  const email = "abtin@araaye.com";
  const password = "change-me-now-1!";
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("admin_users")
    .select("id, role, password_hash, is_active")
    .eq("email", email)
    .maybeSingle();

  const hashOk = data
    ? verifyPassword(password, data.password_hash as string)
    : false;

  console.log(
    JSON.stringify({
      step: "H4-legacy-sim",
      found: !!data,
      isActive: data?.is_active ?? null,
      hashLen: (data?.password_hash as string)?.length ?? 0,
      hashOk,
      wouldLogin: !!(data && data.is_active && hashOk),
    })
  );
}

main().catch(console.error);
