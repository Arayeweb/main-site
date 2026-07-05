# bug-list — بخش AI (آرایه Arena)

> آخرین بررسی: ۱۴۰۴/۰۴/۱۴  
> محدوده: `app/ai/` + `app/api/ai/`  
> تم اصلی: **مهاجرت ناقص از guest به login-required**

---

## اولویت بالا

| # | عنوان | شدت | مسیر | توضیح |
|---|--------|-----|------|-------|
| 1 | API نبرد guest غیرفعال، تست‌ها هنوز guest می‌خواهند | High | `app/api/ai/battle/route.ts`, `tests/integration/ai-battle.test.ts` | API همه guestها را با `login_required` (401) رد می‌کند. تست integration `"allows guest battle without auth"` fail می‌شود. E2E هم هنوز نبرد بدون لاگین را فرض می‌کند. |
| 2 | کاربر free از persona chat بلاک می‌شود | High | `app/api/ai/chat/route.ts`, `app/ai/PersonaChatView.tsx` | `/api/ai/chat` برای free plan با `plan_upgrade_required` (403) fail می‌کند. UI این خطا را handle نمی‌کند → پیام generic «خطایی پیش آمد». در حالی که personaها «ثبت‌نام رایگان» تبلیغ می‌شوند. |
| 3 | بعد از login، mode lock نادیده گرفته می‌شود | High | `app/ai/ArenaHomePage.tsx` (~467) | بعد از auth اگر mode=direct باشد، `startDirectChat` بدون چک `canUseMode` اجرا می‌شود. کاربر free بعد از ثبت‌نام به session شکسته می‌خورد. |
| 4 | UI خطاهای chat ناقص | High | `DirectChatView.tsx`, `PersonaChatView.tsx` | کدهای `unauthorized`, `guest_direct_limit`, `plan_upgrade_required` set می‌شوند ولی render نمی‌شوند. |
| 5 | تناقض «۵ پرسش هدیه» با plan gating | High | `lib/aiCredits.ts`, `ArenaHomePage.tsx` | signup پلن free + ۵ credit می‌دهد، ولی `MODE_MIN_PLAN.direct = "starter"`. فقط battle روی free کار می‌کند. |

---

## اولویت متوسط

| # | عنوان | شدت | مسیر | توضیح |
|---|--------|-----|------|-------|
| 6 | endpoint guest chat stub شده، client هنوز صدا می‌زند | Medium | `app/api/ai/chat/guest/route.ts`, `PersonaChatClient.tsx` | route همیشه `login_required` برمی‌گرداند. `guestMode={!authed}` هنوز فعال است. |
| 7 | کد مرده guest در battle/stream | Medium | `app/api/ai/battle/stream/route.ts` | guest در خط ۷۴ reject می‌شود ولی branchهای guest limit پایین‌تر unreachable هستند. |
| 8 | attachment بعد از login guest گم می‌شود | Medium | `app/ai/ArenaHomePage.tsx` | فقط `pendingPrompt` ذخیره می‌شود، attachmentها نه. |
| 9 | CompareSessionView — SSE 401 را JSON parse می‌کند | Medium | `app/ai/CompareSessionView.tsx` (~119) | API روی 401 پاسخ SSE می‌دهد ولی client `res.json()` صدا می‌زند. |
| 10 | E2E copy قدیمی guest | Medium | `tests/e2e/ai-panel.spec.ts` | تست `/نبرد رایگان/` را می‌خواهد؛ copy جدید «ثبت‌نام رایگان — ۵ پرسش هدیه» است. |
| 11 | debug telemetry به localhost | Medium | `lib/aiEngine.ts`, `VideoStudioView.tsx`, `middleware.ts` | `fetch("http://127.0.0.1:7595/ingest/...")` در production paths. |
| 12 | `ai:open-login` prompt را پاک می‌کند | Medium | `app/ai/ArenaHomePage.tsx` (~269) | `setPendingPrompt("")` باعث از دست رفتن پیام queue شده می‌شود. |

---

## اولویت پایین

| # | عنوان | شدت | مسیر | توضیح |
|---|--------|-----|------|-------|
| 13 | UI/state مربوط به guest limit منسوخ | Low | `ArenaHomePage.tsx`, `CompareSessionView.tsx`, `app/api/ai/auth/route.ts` | copy و listenerهای `guest_limit` / `guest_direct_limit` دیگر trigger نمی‌شوند. |
| 14 | خطای voice input بی‌صدا | Low | `useComposerVoice.ts`, `DirectChatView.tsx` | mic denied و transcribe failure swallow می‌شوند. |

---

## تست fail تأییدشده

```
tests/integration/ai-battle.test.ts > allows guest battle without auth
Expected: 200 → Received: 401
```

---

## پیشنهاد اولویت‌بندی

1. **یکپارچه‌سازی guest→login** در یک PR: API + UI gate + error messages + tests + copy
2. **خطاهای free plan** (#2–5): بیشترین impact روی conversion بعد از signup
3. **پاکسازی dead code** (#6, #7, #13) بعد از تصمیم نهایی روی guest
4. **حذف debug telemetry** (#11) قبل از release

---

## مانیتورینگ (جدید)

| ابزار | محدوده | env |
|-------|--------|-----|
| Sentry | کل اپ، tag `section: ai` برای `/ai` و `/api/ai` | `NEXT_PUBLIC_SENTRY_DSN` |
| PostHog | فقط `/ai` | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |

کلید PostHog موجود در `public/assets/js/posthog.js` را می‌توان در `.env` production کپی کرد.
