/**
 * اولین کاربران ادمین را در Supabase Auth + جدول admin_users می‌سازد.
 *
 * استفاده:
 *   npx tsx scripts/seed-admin.ts
 *
 * متغیرهای محیطی مورد نیاز (.env یا .env.local):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * فلو:
 *   1. با service-role در Supabase Auth یوزر میسازد (admin.createUser)
 *   2. با همان UUID در جدول admin_users ثبت میکند (role, name, is_active)
 *   3. اگر یوزر Auth از قبل وجود داشت، فقط admin_users را upsert میکند
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

import { getSupabaseAdmin } from '../lib/supabase';

const USERS = [
  { email: 'abtin@araaye.com', name: 'آبتین', role: 'admin', password: 'abtinmehdi1029' },
  { email: 'mehdi@araaye.com', name: 'مهدی', role: 'admin', password: 'abtinmehdi1029' },
];

async function main() {
  const supabase = getSupabaseAdmin();

  for (const u of USERS) {
    // Step 1: Create or fetch user in Supabase Auth
    let authId: string;

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true, // skip confirmation email
    });

    if (createErr) {
      if (createErr.message.includes('already been registered') || createErr.message.includes('already exists')) {
        // User exists in Auth — look up their id
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((x) => x.email === u.email);
        if (!existing) {
          console.error(`✗ ${u.email}: در Auth وجود دارد ولی پیدا نشد`);
          continue;
        }
        authId = existing.id;
        const { error: pwErr } = await supabase.auth.admin.updateUserById(authId, {
          password: u.password,
        });
        if (pwErr) {
          console.error(`✗ ${u.email} [Auth password]:`, pwErr.message);
        } else {
          console.log(`  ↩ ${u.email} — موجود؛ رمز به‌روز شد (${authId})`);
        }
      } else {
        console.error(`✗ ${u.email} [Auth]:`, createErr.message);
        continue;
      }
    } else {
      authId = created.user.id;
      console.log(`  ✓ ${u.email} — در Supabase Auth ساخته شد`);
    }

    // Step 2: Remove any stale row with this email (different id) then upsert
    await supabase.from('admin_users').delete().eq('email', u.email).neq('id', authId);

    const { error: dbErr } = await supabase
      .from('admin_users')
      .upsert(
        { id: authId, email: u.email, name: u.name, role: u.role, is_active: true, password_hash: '' },
        { onConflict: 'id' }
      );

    if (dbErr) {
      console.error(`✗ ${u.email} [admin_users]:`, dbErr.message);
    } else {
      console.log(`  ✓ ${u.email} (${u.role}) — در admin_users ثبت شد`);
    }
  }

  console.log('\nتمام.');
}

main().catch(console.error);
