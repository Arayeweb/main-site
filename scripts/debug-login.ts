import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "../lib/supabase";

async function main() {
  const email = process.argv[2] ?? "abtin@araaye.com";
  const password = process.argv[3] ?? "change-me-now-1!";

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  console.log(
    JSON.stringify({
      step: "H1-env",
      hasUrl: !!url,
      hasAnonKey: !!anonKey,
      hasSecret: !!process.env.ADMIN_SESSION_SECRET,
    })
  );

  const auth = createClient(url!, anonKey!, {
    auth: { persistSession: false },
  });
  const { data, error } = await auth.auth.signInWithPassword({
    email,
    password,
  });
  console.log(
    JSON.stringify({
      step: "H2-supabase",
      ok: !!data?.user,
      err: error?.message ?? null,
      userId: data?.user?.id ?? null,
    })
  );

  if (!data?.user) return;

  const sb = getSupabaseAdmin();
  const { data: admin, error: adminErr } = await sb
    .from("admin_users")
    .select("id, role, is_active, email, password_hash")
    .eq("id", data.user.id)
    .single();
  console.log(
    JSON.stringify({
      step: "H3-byId",
      found: !!admin,
      err: adminErr?.message ?? null,
      role: admin?.role ?? null,
      hashLen: admin?.password_hash?.length ?? 0,
    })
  );

  const { data: byEmail } = await sb
    .from("admin_users")
    .select("id, role, email, password_hash")
    .eq("email", email)
    .maybeSingle();
  console.log(
    JSON.stringify({
      step: "H4-byEmail",
      found: !!byEmail,
      id: byEmail?.id ?? null,
      idMatch: byEmail?.id === data.user.id,
      hashLen: byEmail?.password_hash?.length ?? 0,
    })
  );
}

main().catch((e) => {
  console.error("fatal", e);
  process.exit(1);
});
