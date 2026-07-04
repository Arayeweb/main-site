import { beforeEach, vi } from "vitest";

// Required secrets for auth modules (never use production values in tests)
process.env.ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "test-admin-secret-32chars-min!!";
process.env.NEXT_PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
process.env.SUPABASE_URL =
  process.env.SUPABASE_URL || "https://test-project.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "test-service-role-key";
process.env.ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || "zibal";
process.env.OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY || "test-openrouter-key-for-vitest";

beforeEach(() => {
  vi.restoreAllMocks();
});
