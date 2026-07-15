import type { AraayePrompt, PromptCategoryId } from "./promptTypes";

function p(
  partial: Omit<AraayePrompt, "canonicalPath"> & { canonicalPath?: string }
): AraayePrompt {
  return {
    ...partial,
    canonicalPath: partial.canonicalPath ?? `/prompts/${partial.slug}`,
  };
}

export const ALL_PROMPTS: AraayePrompt[] = [
  // ── Programming ──────────────────────────────────────────────
  p({
    slug: "python-debug",
    title: "پرامپت دیباگ کد پایتون",
    category: "programming",
    shortDescription:
      "خطای پایتون را با توضیح علت، محل دقیق باگ و نسخه اصلاح‌شده پیدا کن.",
    searchIntent: "پرامپت دیباگ پایتون / debug python prompt",
    targetUser: "برنامه‌نویس پایتون، دانشجو و فریلنسر",
    basePrompt: `تو یک مهندس نرم‌افزار ارشد پایتون هستی. کد و پیام خطا را بررسی کن و خروجی را دقیقاً با این ساختار بده:

1) خلاصه مشکل (یک جمله)
2) علت ریشه‌ای (Root Cause)
3) محل دقیق باگ (فایل/تابع/خط تقریبی)
4) نسخه اصلاح‌شده کد
5) تست کوتاه برای تأیید اصلاح
6) نکته پیشگیری برای دفعات بعد

قوانین:
- فرض نکن؛ اگر اطلاعات کم است سؤال بپرس
- فقط روی همان خطا تمرکز کن مگر اینکه باگ مرتبط ببینی
- کد را کامل و قابل اجرا بنویس

کد:
{{CODE}}

پیام خطا / رفتار اشتباه:
{{ERROR}}`,
    gptVersion: `نقش: Senior Python Engineer.
کد و traceback را تحلیل کن. خروجی را با عناوین ثابت بده: Summary, Root Cause, Exact Location, Fixed Code, Minimal Test, Prevention Tip.
اگر داده ناقص است قبل از حدس زدن سؤال بپرس.
کد:
{{CODE}}
خطا:
{{ERROR}}`,
    claudeVersion: `You are a careful Python debugger. Prefer precise root-cause analysis over generic advice.
Return:
- What failed
- Why it failed
- The smallest correct fix
- A tiny reproduction/test
Ask clarifying questions if the traceback or inputs are missing.
Code:
{{CODE}}
Error:
{{ERROR}}`,
    geminiVersion: `دیباگ پایتون با تمرکز روی traceback.
مراحل: ۱) نوع Exception ۲) علت ۳) فیکس ۴) تست.
کد و خطا را بدون بازنویسی غیرضروری کل پروژه اصلاح کن.
کد:
{{CODE}}
خطا:
{{ERROR}}`,
    exampleInput: `کد:
def average(nums):
    return sum(nums) / len(nums)

print(average([]))

خطا:
ZeroDivisionError: division by zero`,
    exampleOutput: `1) خلاصه مشکل: تقسیم بر صفر وقتی لیست ورودی خالی است.
2) علت ریشه‌ای: len(nums) برابر ۰ است و تابع برای لیست خالی guard ندارد.
3) محل دقیق باگ: تابع average، خط return.
4) نسخه اصلاح‌شده:
def average(nums):
    if not nums:
        raise ValueError("nums must not be empty")
    return sum(nums) / len(nums)
5) تست کوتاه:
assert average([2, 4]) == 3
try:
    average([])
except ValueError:
    pass
6) نکته پیشگیری: برای عملیات روی collection، حالت خالی را صریح handle کن.`,
    useCases: [
      "رفع خطای runtime در اسکریپت پایتون",
      "درک traceback برای مبتدی‌ها",
      "اصلاح باگ قبل از ارسال PR",
      "دیباگ کد تمرین یا تکلیف",
      "پیدا کردن edge case در توابع عددی و لیستی",
    ],
    commonMistakes: [
      "فقط کد را می‌فرستی و پیام خطا را نمی‌دهی",
      "نسخه پایتون و کتابخانه را مشخص نمی‌کنی",
      "ورودی‌ای که باعث خطا شده را نمی‌نویسی",
      "از مدل می‌خواهی کل پروژه را بازنویسی کند به‌جای فیکس هدفمند",
    ],
    relatedPrompts: ["code-review", "javascript-function", "regex-generator", "sql-query"],
    faq: [
      {
        question: "این پرامپت برای چه نسخه‌ای از پایتون مناسب است؟",
        answer:
          "برای پایتون ۳ به‌طور کلی کار می‌کند. اگر از ویژگی نسخه خاص استفاده می‌کنی، نسخه را در پیام بنویس.",
      },
      {
        question: "آیا باید کل فایل را بفرستم؟",
        answer:
          "تابع/کلاس مرتبط و traceback کافی است. اگر وابستگی خارجی دارد، importها را هم اضافه کن.",
      },
      {
        question: "تفاوت نسخه GPT و Claude چیست؟",
        answer:
          "نسخه GPT ساختار خروجی ثابت‌تری می‌خواهد؛ نسخه Claude روی کوچک‌ترین فیکس و سؤال‌های شفاف‌سازی تأکید دارد.",
      },
      {
        question: "می‌توانم مستقیم در Araaye AI اجرا کنم؟",
        answer:
          "بله. دکمه «اجرا در Araaye AI» پرامپت را در چت پیش‌پر می‌کند تا همان‌جا تست کنی.",
      },
      {
        question: "اگر خطا intermittent باشد چه کنم؟",
        answer:
          "شرایط رخداد، داده ورودی و اینکه همیشه یا گاهی رخ می‌دهد را بنویس تا مدل race condition یا state را بررسی کند.",
      },
    ],
    metaTitle: "پرامپت دیباگ کد پایتون | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت آماده دیباگ پایتون با ساختار علت، محل باگ، کد اصلاح‌شده و تست. کپی کن یا مستقیم در Araaye AI اجرا کن.",
  }),

  p({
    slug: "sql-query",
    title: "پرامپت ساخت کوئری SQL",
    category: "programming",
    shortDescription: "از توضیح فارسی، کوئری SQL تمیز، ایمن و قابل اجرا بساز.",
    searchIntent: "پرامپت ساخت کوئری SQL",
    targetUser: "تحلیل‌گر داده، بک‌اند و محصول",
    basePrompt: `تو یک متخصص SQL هستی. بر اساس نیاز کسب‌وکار، کوئری را بنویس.

خروجی:
1) فرضیات schema (اگر داده نشد)
2) کوئری نهایی
3) توضیح کوتاه منطق
4) نسخه جایگزین در صورت نیاز به performance
5) هشدارهای مهم (NULL، duplicate، injection)

قوانین:
- از SELECT * پرهیز کن مگر صریحاً خواسته شود
- برای فیلتر تاریخ و وضعیت، شرط‌ها را واضح بنویس
- اگر dialect مشخص نشده، PostgreSQL فرض کن

نیاز:
{{REQUIREMENT}}

جداول / ستون‌ها (اگر داری):
{{SCHEMA}}`,
    gptVersion: `Write production-ready SQL for this requirement.
Prefer PostgreSQL unless another dialect is specified.
Return: assumptions, query, explanation, optional optimized variant, pitfalls.
Requirement:
{{REQUIREMENT}}
Schema:
{{SCHEMA}}`,
    exampleInput: `نیاز: تعداد سفارش‌های پرداخت‌شده هر مشتری در ۳۰ روز اخیر، فقط مشتریانی که حداقل ۲ سفارش دارند.
جداول: customers(id, name), orders(id, customer_id, status, created_at)`,
    exampleOutput: `فرضیات: status = 'paid' یعنی پرداخت‌شده؛ timezone دیتابیس UTC است.

SELECT
  c.id,
  c.name,
  COUNT(o.id) AS paid_orders_30d
FROM customers c
JOIN orders o
  ON o.customer_id = c.id
WHERE o.status = 'paid'
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY c.id, c.name
HAVING COUNT(o.id) >= 2
ORDER BY paid_orders_30d DESC;

منطق: join مشتری و سفارش، فیلتر پرداخت و بازه زمانی، سپس having برای حداقل ۲ سفارش.`,
    useCases: [
      "ساخت گزارش فروش از دیتابیس",
      "نوشتن کوئری برای داشبورد",
      "تبدیل نیاز محصول به SQL",
      "بازنویسی کوئری کند",
      "آموزش JOIN و GROUP BY با مثال واقعی",
    ],
    commonMistakes: [
      "dialect دیتابیس را مشخص نکردن (MySQL در برابر Postgres)",
      "تعریف نکردن معنای status یا تاریخ",
      "درخواست نتیجه بدون گفتن کلیدهای جدول",
      "خواستن کوئری بدون ذکر فیلترهای کسب‌وکار",
    ],
    relatedPrompts: ["python-debug", "code-review", "javascript-function"],
    faq: [
      {
        question: "اگر schema نداشته باشم چه می‌شود؟",
        answer:
          "مدل فرضیات را می‌نویسد. بعداً با schema واقعی اصلاحش کن تا دقیق شود.",
      },
      {
        question: "برای MySQL هم کار می‌کند؟",
        answer:
          "بله؛ در پرامپت بنویس dialect=MySQL تا syntax مثل DATE_SUB درست شود.",
      },
      {
        question: "آیا کوئری در برابر SQL injection امن است؟",
        answer:
          "این پرامپت کوئری ساختاریافته می‌سازد؛ در اپلیکیشن از parameterized query استفاده کن.",
      },
      {
        question: "می‌توانم از Araaye AI برای بهینه‌سازی هم استفاده کنم؟",
        answer:
          "بله. کوئری فعلی و EXPLAIN را بفرست تا نسخه بهینه‌تر پیشنهاد دهد.",
      },
      {
        question: "خروجی شامل ایندکس هم می‌شود؟",
        answer:
          "اگر بخواهی، در نیاز بنویس «پیشنهاد ایندکس هم بده» تا جداگانه پیشنهاد شود.",
      },
    ],
    metaTitle: "پرامپت ساخت کوئری SQL | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت آماده تبدیل نیاز فارسی به کوئری SQL تمیز با توضیح منطق و هشدارها. کپی یا اجرا در Araaye AI.",
  }),

  p({
    slug: "code-review",
    title: "پرامپت بررسی و ریویو کد",
    category: "programming",
    shortDescription:
      "ریویو ساختاریافته برای باگ، خوانایی، امنیت و پیشنهادهای عملی.",
    searchIntent: "پرامپت کد ریویو",
    targetUser: "توسعه‌دهنده و لید فنی",
    basePrompt: `تو یک reviewer سخت‌گیر اما سازنده هستی. کد را ریویو کن.

خروجی:
1) جمع‌بندی کلی (۱–۲ جمله)
2) مشکلات Critical
3) مشکلات Major
4) پیشنهادهای Minor / Style
5) نکات مثبت
6) چک‌لیست قبل از merge

قوانین:
- برای هر مشکل: محل + چرا مهم است + پیشنهاد اصلاح
- حدس نزن؛ اگر context کم است بگو چه چیزی کم است
- روی امنیت، صحت، و maintainability تمرکز کن

زبان/فریمورک:
{{STACK}}

کد:
{{CODE}}

هدف تغییر:
{{GOAL}}`,
    claudeVersion: `Perform a rigorous code review.
Prioritize correctness and security over style nitpicks.
For each issue: severity, location, rationale, concrete fix.
Also list what is already good.
Stack: {{STACK}}
Goal: {{GOAL}}
Code:
{{CODE}}`,
    exampleInput: `هدف: افزودن endpoint ثبت‌نام
کد (ساده):
@app.post("/signup")
def signup(email, password):
    db.execute(f"INSERT INTO users(email,password) VALUES('{email}','{password}')")
    return {"ok": True}`,
    exampleOutput: `جمع‌بندی: endpoint کار می‌کند اما از نظر امنیت و اعتبارسنجی آماده production نیست.

Critical:
- SQL injection با f-string — از query parameterized استفاده کن
- ذخیره password به‌صورت plain text — hash با bcrypt/argon2

Major:
- اعتبارسنجی فرمت ایمیل و قدرت پسورد وجود ندارد
- پاسخ خطا و وضعیت duplicate email مشخص نیست

Minor:
- نام‌گذاری و typing را بهبود بده

نکات مثبت: مسیر ساده و خوانا است.

چک‌لیست merge: parameterized SQL، hashing، validation، تست duplicate.`,
    useCases: [
      "ریویو PR قبل از merge",
      "آماده‌سازی کد برای production",
      "یادگیری بهترین‌روش‌ها با مثال خودت",
      "بررسی امنیتی سریع endpointها",
    ],
    commonMistakes: [
      "هدف تغییر را نگفتن",
      "فقط تکه کد بدون context فراخوانی",
      "درخواست «همه‌چیز را بازنویسی کن» به‌جای ریویو",
      "مشخص نکردن سطح حساسیت (MVP در برابر production)",
    ],
    relatedPrompts: ["python-debug", "javascript-function", "sql-query"],
    faq: [
      {
        question: "این پرامپت جایگزین reviewer انسانی است؟",
        answer:
          "خیر؛ کمک سریع برای پیدا کردن باگ و ریسک است. تصمیم نهایی با تیم می‌ماند.",
      },
      {
        question: "برای چه زبان‌هایی مناسب است؟",
        answer:
          "عمومی است؛ stack را مشخص کن (مثلاً Python/FastAPI یا JS/React).",
      },
      {
        question: "چطور خروجی را کوتاه‌تر کنم؟",
        answer: "بنویس فقط Critical و Major را بده و Minor را حذف کن.",
      },
      {
        question: "آیا روی امنیت تمرکز دارد؟",
        answer:
          "بله؛ injection، auth، و داده‌های حساس را اولویت می‌دهد اگر در کد دیده شوند.",
      },
      {
        question: "چطور در Araaye AI چند مدل را مقایسه کنم؟",
        answer:
          "همان پرامپت را در Araaye AI با حالت مقایسه مدل‌ها اجرا کن و تفاوت ریویوها را ببین.",
      },
    ],
    metaTitle: "پرامپت بررسی و ریویو کد | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت کد ریویو با دسته‌بندی Critical/Major/Minor، نکات امنیتی و چک‌لیست merge. اجرا در Araaye AI.",
  }),

  p({
    slug: "javascript-function",
    title: "پرامپت نوشتن تابع JavaScript",
    category: "programming",
    shortDescription:
      "تابع JS تمیز با ورودی/خروجی مشخص، edge case و مثال استفاده.",
    searchIntent: "پرامپت نوشتن تابع جاوااسکریپت",
    targetUser: "فرانت‌اند و فول‌استک",
    basePrompt: `یک تابع JavaScript تمیز و قابل نگهداری بنویس.

خروجی:
1) امضای تابع و توضیح کوتاه
2) کد کامل (ES modern)
3) مدیریت edge caseها
4) ۲–۳ مثال استفاده
5) نسخه TypeScript اختیاری اگر مفید باشد

قوانین:
- نام‌گذاری واضح
- بدون وابستگی غیرضروری
- اگر نیاز مبهم است قبل از کدنویسی سؤال بپرس

نیاز:
{{NEED}}

محدودیت‌ها:
{{CONSTRAINTS}}`,
    geminiVersion: `Write a focused JavaScript utility function.
Include: implementation, edge cases, usage examples.
Keep it dependency-free unless asked.
Need: {{NEED}}
Constraints: {{CONSTRAINTS}}`,
    exampleInput: `نیاز: تابعی که آرایه اعداد را می‌گیرد و میانه را برمی‌گرداند.
محدودیت: آرایه اصلی mutate نشود.`,
    exampleOutput: `function median(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error("numbers must be a non-empty array");
  }
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

مثال:
median([3, 1, 2]) // 2
median([4, 1, 3, 2]) // 2.5`,
    useCases: [
      "ساخت utility برای پروژه فرانت",
      "تبدیل نیاز محصول به تابع قابل تست",
      "آماده‌سازی برای مصاحبه فنی",
      "نوشتن helperهای تاریخ/آرایه/رشته",
    ],
    commonMistakes: [
      "مشخص نکردن ورودی و خروجی",
      "نگفتن اینکه mutate مجاز است یا نه",
      "درخواست چند مسئولیت در یک تابع",
      "فراموش کردن مثال عددی یا رشته‌ای",
    ],
    relatedPrompts: ["python-debug", "code-review", "regex-generator"],
    faq: [
      {
        question: "خروجی TypeScript هم می‌دهد؟",
        answer:
          "اگر بخواهی در محدودیت‌ها بنویس «نسخه TypeScript هم بده».",
      },
      {
        question: "برای Node و مرورگر فرق دارد؟",
        answer:
          "برای utility خالص معمولاً یکی است؛ اگر API مرورگر/Node لازم است محیط را بنویس.",
      },
      {
        question: "آیا تست هم می‌نویسد؟",
        answer: "با افزودن «۳ تست vitest/jest هم بنویس» می‌توانی گسترشش دهی.",
      },
      {
        question: "چطور از کپی مستقیم در پروژه استفاده کنم؟",
        answer:
          "کد را کپی کن، edge caseها را با داده واقعی چک کن، بعد در Araaye AI ریویو بگیر.",
      },
      {
        question: "برای React hook هم مناسب است؟",
        answer:
          "برای تابع خالص بله؛ برای hook بگو «یک custom hook بنویس» تا ساختار عوض شود.",
      },
    ],
    metaTitle: "پرامپت نوشتن تابع JavaScript | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت آماده ساخت تابع JS با edge case و مثال استفاده. کپی کن یا در Araaye AI اجرا کن.",
  }),

  p({
    slug: "regex-generator",
    title: "پرامپت ساخت Regex",
    category: "programming",
    shortDescription:
      "عبارت منظم دقیق با توضیح گروه‌ها، مثال match و ضدمثال.",
    searchIntent: "پرامپت ساخت regex",
    targetUser: "توسعه‌دهنده و تحلیل‌گر داده",
    basePrompt: `یک Regex دقیق برای نیاز زیر بساز.

خروجی:
1) Regex نهایی
2) توضیح بخش‌به‌بخش
3) ۳ مثال match
4) ۳ ضدمثال (نباید match شود)
5) نکات dialect (JS / Python / PCRE)

قوانین:
- بیش‌ازحد کلی یا بیش‌ازحد سخت‌گیر نباش مگر خواسته شود
- اگر ابهام هست سؤال بپرس
- flagها را مشخص کن

نیاز:
{{NEED}}
زبان هدف:
{{LANG}}`,
    exampleInput: `نیاز: اعتبارسنجی کد پستی ایران (۵ رقم یا ۱۰ رقم با خط تیره اختیاری مثل 12345-67890)
زبان: JavaScript`,
    exampleOutput: `Regex: /^\\d{5}(-\\d{5})?$/

توضیح:
- ^ و $ ابتدا و انتها
- \\d{5} پنج رقم اول
- (-\\d{5})? بخش اختیاری ۵ رقم بعد از خط تیره

Match: 12345 ، 12345-67890
ضدمثال: 1234 ، 123456 ، 12345-6789

نکته JS: با RegExp یا literal؛ نیازی به flag i نیست.`,
    useCases: [
      "اعتبارسنجی فرم",
      "استخراج داده از لاگ",
      "پاکسازی متن",
      "جستجوی پیشرفته در کد",
    ],
    commonMistakes: [
      "مثال‌های درست و غلط را ندادن",
      "dialect را مشخص نکردن",
      "خواستن یک regex برای همه فرمت‌های مبهم دنیا",
      "فراموش کردن ابتدا/انتهای رشته (^$)",
    ],
    relatedPrompts: ["javascript-function", "python-debug", "sql-query"],
    faq: [
      {
        question: "Regex برای ایمیل کامل می‌دهد؟",
        answer:
          "برای فرم‌ها نسخه عملی می‌دهد؛ استاندارد کامل ایمیل بسیار پیچیده است و معمولاً لازم نیست.",
      },
      {
        question: "تفاوت نسخه مدل‌ها چیست؟",
        answer:
          "برای اکثر مدل‌ها نسخه اصلی کافی است؛ اگر dialect خاص داری در پرامپت بنویس.",
      },
      {
        question: "چطور تستش کنم؟",
        answer:
          "مثال‌ها و ضدمثال‌ها را در regex101 یا کنسول JS/Python چک کن.",
      },
      {
        question: "آیا Unicode فارسی را پوشش می‌دهد؟",
        answer:
          "اگر نیاز به حروف فارسی داری صریحاً بگو تا کلاس کاراکتر مناسب پیشنهاد شود.",
      },
      {
        question: "می‌توانم در Araaye AI اصلاح تکراری بگیرم؟",
        answer:
          "بله؛ خروجی را با مثال شکست‌خورده برگردان تا regex را تنگ‌تر یا شل‌تر کند.",
      },
    ],
    metaTitle: "پرامپت ساخت Regex | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت ساخت عبارت منظم با توضیح، مثال match و ضدمثال. مناسب JS و Python — اجرا در Araaye AI.",
  }),

  // ── Career ───────────────────────────────────────────────────
  p({
    slug: "resume",
    title: "پرامپت ساخت رزومه حرفه‌ای",
    category: "career",
    shortDescription:
      "رزومه نتیجه‌محور و متناسب با آگهی شغل، بدون اغراق غیرواقعی.",
    searchIntent: "پرامپت ساخت رزومه",
    targetUser: "کارجو و متخصص در حال تغییر مسیر",
    basePrompt: `تو یک مشاور شغلی هستی. بر اساس اطلاعات من یک رزومه حرفه‌ای و صادقانه بنویس.

خروجی:
1) خلاصه حرفه‌ای (۳–۴ خط)
2) مهارت‌های کلیدی (دسته‌بندی‌شده)
3) تجربه‌های کاری با بولت‌های نتیجه‌محور
4) تحصیلات / گواهی‌ها
5) نسخه کوتاه برای فرم‌های آنلاین

قوانین:
- عدد و دستاورد را فقط اگر در ورودی آمده استفاده کن
- متناسب با آگهی شغل اولویت‌بندی کن
- زبان خروجی: {{LANGUAGE}}

اطلاعات من:
{{PROFILE}}

آگهی شغل هدف:
{{JOB}}`,
    gptVersion: `Create an honest, ATS-friendly resume tailored to the job.
Use only facts from the profile. Prefer quantified bullets when numbers exist.
Sections: summary, skills, experience, education, short version.
Language: {{LANGUAGE}}
Profile:
{{PROFILE}}
Job:
{{JOB}}`,
    exampleInput: `زبان: فارسی
پروفایل: ۳ سال فرانت‌اند React، بهبود LCP صفحه اصلی از ۴.۲s به ۲.۱s، همکاری با تیم ۳ نفره
آگهی: Frontend Developer — React، TypeScript، توجه به performance`,
    exampleOutput: `خلاصه حرفه‌ای:
توسعه‌دهنده فرانت‌اند با ۳ سال تجربه React. تمرکز روی رابط کاربری سریع و قابل نگهداری. در آخرین پروژه LCP صفحه اصلی را از ۴.۲ به ۲.۱ ثانیه بهبود دادم.

مهارت‌ها: React، TypeScript، Performance، Git، کار تیمی

تجربه:
- بهبود LCP صفحه اصلی از ۴.۲s به ۲.۱s با بهینه‌سازی بارگذاری
- توسعه فیچرهای UI در تیم ۳ نفره با مرور کد منظم

نسخه کوتاه: Frontend Developer | React/TS | Performance-focused | ۳ سال تجربه`,
    useCases: [
      "بازنویسی رزومه برای آگهی خاص",
      "ساخت خلاصه LinkedIn از رزومه",
      "آماده‌سازی نسخه انگلیسی/فارسی",
      "قوی‌کردن بولت‌های تجربه کاری",
    ],
    commonMistakes: [
      "آگهی شغل هدف را ندادن",
      "خواستن آمار جعلی",
      "ریختن همه شغل‌های نامرتبط بدون اولویت",
      "مشخص نکردن زبان خروجی",
    ],
    relatedPrompts: ["cover-letter", "linkedin-bio", "interview-prep", "job-description"],
    faq: [
      {
        question: "آیا رزومه ATS-friendly می‌سازد؟",
        answer:
          "ساختار متنی و کلیدواژه‌های مرتبط با آگهی را رعایت می‌کند؛ از جدول و تصویر پیچیده پرهیز کن.",
      },
      {
        question: "اگر سابقه کم داشته باشم؟",
        answer:
          "پروژه‌ها، کارآموزی و مهارت‌های قابل اثبات را در ورودی بنویس تا روی همان تمرکز کند.",
      },
      {
        question: "می‌توانم نسخه انگلیسی بگیرم؟",
        answer: "بله؛ LANGUAGE را English بگذار.",
      },
      {
        question: "تضمین استخدام می‌دهد؟",
        answer:
          "خیر. کمک می‌کند رزومه واضح‌تر و مرتبط‌تر شود؛ نتیجه به بازار و مهارت بستگی دارد.",
      },
      {
        question: "چطور در Araaye AI چند نسخه بسازم؟",
        answer:
          "برای هر آگهی یک بار با JOB متفاوت اجرا کن و نسخه‌ها را مقایسه کن.",
      },
    ],
    metaTitle: "پرامپت ساخت رزومه حرفه‌ای | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت رزومه نتیجه‌محور متناسب با آگهی شغل. بدون اغراق — کپی یا اجرا در Araaye AI.",
  }),

  p({
    slug: "cover-letter",
    title: "پرامپت نوشتن Cover Letter",
    category: "career",
    shortDescription: "کاور لتر کوتاه، مشخص و متناسب با شرکت و نقش.",
    searchIntent: "پرامپت cover letter",
    targetUser: "کارجو",
    basePrompt: `یک Cover Letter حرفه‌ای و انسانی بنویس.

ساختار:
1) افتتاحیه مرتبط با نقش/شرکت
2) ۲ دلیل مشخص که چرا مناسبم
3) یک دستاورد مرتبط
4) جمع‌بندی و دعوت به گفتگو

قوانین:
- حداکثر ۲۵۰ کلمه
- کلیشه‌های خالی مثل «hard worker» ممنوع مگر با شاهد
- لحن: {{TONE}}
- زبان: {{LANGUAGE}}

پروفایل:
{{PROFILE}}
شرکت و نقش:
{{JOB}}`,
    exampleInput: `زبان: انگلیسی
لحن: حرفه‌ای و گرم
نقش: Product Designer در یک فین‌تک
دستاورد: کاهش ریزش onboarding از ۱۸٪ به ۱۱٪`,
    exampleOutput: `Dear Hiring Team,

I'm writing to apply for the Product Designer role. I've spent the last years designing onboarding flows where clarity directly affects activation.

At my previous product, I redesigned the first-run experience and helped reduce onboarding drop-off from 18% to 11% by simplifying steps and improving empty states. I'm especially interested in fintech problems where trust and usability must work together.

I'd welcome a conversation about how I can contribute to your design team.

Best regards,
[Your Name]`,
    useCases: [
      "ارسال رزومه برای شرکت خارجی",
      "نسخه کوتاه ایمیل همراه رزومه",
      "شخصی‌سازی برای هر آگهی",
      "بازنویسی کاور لتر عمومی به نسخه هدفمند",
    ],
    commonMistakes: [
      "کپی یک نامه برای همه شرکت‌ها",
      "تکرار کامل رزومه به‌جای زاویه مکمل",
      "طولانی نوشتن بیش از یک صفحه",
      "ندادن نام نقش یا محصول شرکت",
    ],
    relatedPrompts: ["resume", "linkedin-bio", "interview-prep", "email"],
    faq: [
      {
        question: "فارسی هم می‌نویسد؟",
        answer: "بله؛ LANGUAGE را فارسی بگذار.",
      },
      {
        question: "چقدر باید شخصی باشد؟",
        answer:
          "حداقل یک اشاره واقعی به محصول/نقش شرکت کافی است؛ چاپلوسی کلی لازم نیست.",
      },
      {
        question: "اگر دستاورد عددی ندارم؟",
        answer:
          "یک نتیجه کیفی مشخص بنویس (مثلاً کاهش سردرگمی کاربران در فلوی X).",
      },
      {
        question: "برای ایمیل هم مناسب است؟",
        answer:
          "بله؛ می‌توانی بخواهی نسخه ۱۲۰ کلمه‌ای برای بدنه ایمیل بدهد.",
      },
      {
        question: "آیا باید آدرس و تاریخ سنتی بگذارد؟",
        answer:
          "برای ارسال آنلاین معمولاً لازم نیست؛ روی پیام و تناسب تمرکز کن.",
      },
    ],
    metaTitle: "پرامپت نوشتن Cover Letter | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت کاور لتر کوتاه و متناسب با نقش. بدون کلیشه خالی — اجرا در Araaye AI.",
  }),

  p({
    slug: "linkedin-bio",
    title: "پرامپت نوشتن بیو لینکدین",
    category: "career",
    shortDescription: "بیو و About لینکدین واضح، قابل اسکن و جذب‌کننده.",
    searchIntent: "پرامپت بیو لینکدین",
    targetUser: "حرفه‌ای‌ها و فریلنسرها",
    basePrompt: `برای لینکدین متن‌های زیر را بنویس:

1) Headline (حداکثر ۲۲۰ کاراکتر)
2) About (۱۲۰–۱۸۰ کلمه)
3) نسخه کوتاه برای بخش Featured/Intro
4) ۳ ایده برای پین کردن در Featured

قوانین:
- واضح بگو برای چه کسی چه ارزشی می‌سازم
- از ادعاهای مبهم («بهترین»، «شماره یک») پرهیز کن
- زبان: {{LANGUAGE}}

اطلاعات:
{{PROFILE}}
مخاطب هدف:
{{AUDIENCE}}`,
    exampleInput: `زبان: فارسی
پروفایل: مشاور سئوی محلی برای کلینیک‌ها
مخاطب: مدیران کلینیک`,
    exampleOutput: `Headline:
مشاور سئوی محلی کلینیک‌ها | دیده‌شدن در نقشه و جستجوی محله

About:
به کلینیک‌ها کمک می‌کنم در جستجوی محلی پیدا شوند؛ از بهینه‌سازی پروفایل نقشه تا صفحات خدمات.
اگر بیمار در محله شما جستجو می‌کند، هدفم این است که مسیر تماس و نوبت روشن باشد.
با تمرکز روی صفحات خدمت، نظرات واقعی و پیگیری لید کار می‌کنم — نه وعده رتبه یک overnight.

نسخه کوتاه: سئوی محلی برای کلینیک‌ها؛ تمرکز روی نقشه، صفحات خدمت و جذب نوبت.`,
    useCases: [
      "به‌روزرسانی پروفایل شغلی",
      "جذب مشتری برای فریلنسری",
      "آماده‌سازی برای networking",
      "هماهنگ کردن Headline و About",
    ],
    commonMistakes: [
      "فقط لیست عنوان شغلی بدون ارزش",
      "پر کردن از buzzword",
      "مخاطب هدف را نگفتن",
      "کپی شعار تبلیغاتی به‌جای معرفی واقعی",
    ],
    relatedPrompts: ["resume", "cover-letter", "interview-prep"],
    faq: [
      {
        question: "طول About چقدر باشد؟",
        answer:
          "این پرامپت حدود ۱۲۰–۱۸۰ کلمه می‌دهد تا در موبایل قابل خواندن بماند.",
      },
      {
        question: "ایموجی بگذارد؟",
        answer:
          "به‌صورت پیش‌فرض کم‌حجم و حرفه‌ای می‌نویسد؛ اگر بخواهی بگو sparingly emoji ok.",
      },
      {
        question: "برای جاب‌سیکر بهتر است یا فروش؟",
        answer: "مخاطب هدف را مشخص کن تا زاویه متن عوض شود.",
      },
      {
        question: "انگلیسی هم می‌سازد؟",
        answer: "بله.",
      },
      {
        question: "چطور تست کنم کدام نسخه بهتر است؟",
        answer:
          "دو نسخه بساز و در Araaye AI از مدل بخواه نقاط قوت هر کدام را مقایسه کند.",
      },
    ],
    metaTitle: "پرامپت نوشتن بیو لینکدین | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت Headline و About لینکدین واضح و بدون ادعاهای توخالی. کپی یا اجرا در Araaye AI.",
  }),

  p({
    slug: "interview-prep",
    title: "پرامپت آماده‌سازی مصاحبه شغلی",
    category: "career",
    shortDescription:
      "سؤالات محتمل، پاسخ‌های ساختاریافته و نکات نقش‌محور برای مصاحبه.",
    searchIntent: "پرامپت آمادگی مصاحبه",
    targetUser: "کارجو قبل از مصاحبه",
    basePrompt: `مرا برای مصاحبه این نقش آماده کن.

خروجی:
1) ۱۰ سؤال محتمل (فنی + رفتاری)
2) پاسخ نمونه برای ۵ سؤال مهم با ساختار STAR
3) ۳ سؤال هوشمند که من از مصاحبه‌گر بپرسم
4) نقاط ضعفی که ممکن است پرسیده شود و پاسخ صادقانه
5) چک‌لیست ۳۰ دقیقه قبل از مصاحبه

نقش و شرکت:
{{JOB}}
سابقه من:
{{PROFILE}}`,
    exampleInput: `نقش: Customer Success Manager در SaaS B2B
سابقه: ۲ سال پشتیبانی و ۱ سال CSM`,
    exampleOutput: `سؤال نمونه: از کاهش churn یک مشتری بگو.
پاسخ STAR کوتاه:
Situation: یک حساب mid-market استفاده را کم کرده بود.
Task: باید ریسک churn را در یک ماه کاهش می‌دادم.
Action: usage review، آموزش ادمین، و تعریف success metric مشترک.
Result: استفاده هفتگی پایدار شد و تمدید انجام شد.

سؤال از مصاحبه‌گر: موفقیت ۹۰ روز اول این نقش را چطور می‌سنجید؟`,
    useCases: [
      "شب قبل از مصاحبه",
      "تمرین پاسخ‌های رفتاری",
      "آمادگی برای مصاحبه فنی سطح متوسط",
      "ساخت سؤال برای پرسیدن از شرکت",
    ],
    commonMistakes: [
      "نقش و سطح seniority را نگفتن",
      "حفظ طوطی‌وار جواب بدون مثال واقعی",
      "نادیده گرفتن سؤالات رفتاری",
      "ندادن زمینه محصول/صنعت",
    ],
    relatedPrompts: ["resume", "cover-letter", "job-description"],
    faq: [
      {
        question: "برای مصاحبه فنی برنامه‌نویسی هم هست؟",
        answer:
          "بله؛ نقش را دقیق بنویس تا سؤالات فنی‌تر شود. برای کد، پرامپت‌های programming را هم ببین.",
      },
      {
        question: "STAR چیست؟",
        answer:
          "Situation, Task, Action, Result — چارچوب پاسخ به سؤالات رفتاری.",
      },
      {
        question: "اگر تجربه مرتبط کم باشد؟",
        answer:
          "پروژه‌های نزدیک و یادگیری‌های قابل اثبات را در PROFILE بنویس.",
      },
      {
        question: "می‌توانم mock interview بگیرم؟",
        answer:
          "در Araaye AI بنویس «مثل مصاحبه‌گر سخت‌گیر سؤال بپرس و بعد بازخورد بده».",
      },
      {
        question: "زبان مصاحبه انگلیسی است؟",
        answer: "در ورودی بگو پاسخ‌ها English باشند.",
      },
    ],
    metaTitle: "پرامپت آماده‌سازی مصاحبه شغلی | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت آمادگی مصاحبه با سؤالات محتمل، پاسخ STAR و چک‌لیست. اجرا در Araaye AI.",
  }),

  p({
    slug: "job-description",
    title: "پرامپت نوشتن شرح شغل",
    category: "career",
    shortDescription:
      "آگهی شغل واضح با مسئولیت‌ها، نیازمندی‌ها و بدون jargon بی‌مورد.",
    searchIntent: "پرامپت نوشتن شرح شغل",
    targetUser: "منابع انسانی و بنیان‌گذاران",
    basePrompt: `یک Job Description شفاف و جذاب بنویس.

بخش‌ها:
1) عنوان نقش
2) درباره تیم/شرکت (۳–۵ خط)
3) مسئولیت‌ها
4) نیازمندی‌های ضروری و مطلوب
5) مزایا و نحوه همکاری
6) نسخه کوتاه برای انتشار در شبکه‌های اجتماعی

قوانین:
- تبعیض‌آمیز ننویس
- بین must-have و nice-to-have تفکیک کن
- زبان: {{LANGUAGE}}

اطلاعات نقش:
{{ROLE_INFO}}`,
    exampleInput: `نقش: بازاریاب محتوا پاره‌وقت برای برند B2B نرم‌افزاری
زبان: فارسی`,
    exampleOutput: `عنوان: کارشناس بازاریابی محتوا (پاره‌وقت)

مسئولیت‌ها:
- برنامه‌ریزی تقویم محتوا
- نوشتن مقاله و پست لینکدین
- همکاری با فروش برای کیس‌استادی

ضروری: نوشتن فارسی روان، آشنایی با B2B، نظم تحویل
مطلوب: تجربه SaaS، پایه SEO

نسخه اجتماعی: دنبال نویسنده محتوا برای SaaS B2B هستیم — پاره‌وقت، تمرکز روی مقاله و لینکدین.`,
    useCases: [
      "انتشار آگهی در جاب‌سایت‌ها",
      "هماهنگ کردن انتظار مدیر و HR",
      "نسخه کوتاه برای لینکدین",
      "بازنویسی آگهی مبهم قبلی",
    ],
    commonMistakes: [
      "مخلوط کردن ۵ نقش در یک آگهی",
      "لیست بی‌نهایت مهارت must-have",
      "نگفتن نوع همکاری و سطح",
      "استفاده از عنوان گمراه‌کننده",
    ],
    relatedPrompts: ["resume", "interview-prep", "proposal"],
    faq: [
      {
        question: "برای دورکاری هم مناسب است؟",
        answer: "بله؛ مدل همکاری را در ROLE_INFO بنویس.",
      },
      {
        question: "چطور آگهی را کوتاه‌تر کنم؟",
        answer: "بخواه فقط مسئولیت‌ها و must-have را در ۴۰۰ کلمه بدهد.",
      },
      {
        question: "آیا لحن استارتاپی می‌دهد؟",
        answer: "لحن را مشخص کن: رسمی شرکتی یا استارتاپی شفاف.",
      },
      {
        question: "برای intern هم کار می‌کند؟",
        answer: "بله؛ سطح و Mentorship را ذکر کن.",
      },
      {
        question: "چطور با رزومه هماهنگش کنم؟",
        answer:
          "بعد از نوشتن JD، با پرامپت resume کاندیدا را برای همان آگهی ارزیابی کن.",
      },
    ],
    metaTitle: "پرامپت نوشتن شرح شغل | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت Job Description شفاف با تفکیک must-have و nice-to-have. کپی یا اجرا در Araaye AI.",
  }),

  // ── Marketing ────────────────────────────────────────────────
  p({
    slug: "instagram-caption",
    title: "پرامپت نوشتن کپشن اینستاگرام",
    category: "marketing",
    shortDescription: "کپشن‌های متنوع با هوک، بدنه و CTA مناسب فارسی.",
    searchIntent: "پرامپت کپشن اینستاگرام",
    targetUser: "ادمین شبکه اجتماعی و صاحب کسب‌وکار",
    basePrompt: `برای پست اینستاگرام کپشن بنویس.

خروجی:
1) ۳ نسخه کپشن (کوتاه / متوسط / داستانی)
2) پیشنهاد هوک خط اول
3) CTA
4) ۸–۱۲ هشتگ مرتبط (بدون هشتگ بی‌ربط پربازدید)
5) متن جایگزین برای استوری مرتبط

قوانین:
- لحن: {{TONE}}
- مخاطب: {{AUDIENCE}}
- از اغراق غیرواقعی پرهیز کن

موضوع پست:
{{TOPIC}}
جزئیات محصول/خدمت:
{{DETAILS}}`,
    exampleInput: `موضوع: معرفی چک‌لیست رایگان سئوی محلی برای کلینیک
لحن: مفید و خودمانی
مخاطب: مدیر کلینیک`,
    exampleOutput: `نسخه کوتاه:
اگر بیمار محله‌ات در نقشه پیدات نمی‌کند، این چک‌لیست را ببین.
دانلود رایگان در لینک بایو.

هوک: «بیمار نزدیکت هست؛ سایتت آماده‌ست؟»
CTA: لینک بایو را باز کن و چک‌لیست را بگیر
هشتگ‌ها: #سئومحلی #کلینیک #نوبت‌دهی ...`,
    useCases: [
      "پست معرفی محصول",
      "اعلام تخفیف واقعی",
      "آموزش کوتاه تخصصی",
      "پشت صحنه تیم",
    ],
    commonMistakes: [
      "مخاطب و لحن را نگفتن",
      "پر کردن هشتگ‌های نامرتبط",
      "CTA مبهم",
      "کپی ادعاهای آماری جعلی",
    ],
    relatedPrompts: ["telegram-post", "ad-copy", "instagram-poster", "product-description"],
    faq: [
      {
        question: "چند نسخه می‌دهد؟",
        answer: "سه نسخه با طول متفاوت تا بتوانی A/B کنی.",
      },
      {
        question: "برای ریلز هم مناسب است؟",
        answer: "بله؛ بگو اسکریپت ۱۵ ثانیه‌ای هم اضافه کند.",
      },
      {
        question: "ایموجی زیاد می‌گذارد؟",
        answer: "به‌اندازه؛ اگر صفر می‌خواهی در لحن بنویس.",
      },
      {
        question: "هشتگ فارسی بهتر است یا انگلیسی؟",
        answer: "ترکیب مرتبط با موضوع؛ پرامپت از هشتگ بی‌ربط جلوگیری می‌کند.",
      },
      {
        question: "چطور مستقیم در Araaye AI تست کنم؟",
        answer: "با دکمه اجرا، کپشن را در چت بساز و نسخه بهتر را انتخاب کن.",
      },
    ],
    metaTitle: "پرامپت نوشتن کپشن اینستاگرام | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت کپشن اینستاگرام با ۳ نسخه، هوک، CTA و هشتگ مرتبط. اجرا در Araaye AI.",
  }),

  p({
    slug: "telegram-post",
    title: "پرامپت نوشتن پست تلگرام",
    category: "marketing",
    shortDescription: "پست کانال تلگرام خوانا، با ساختار اسکن‌پذیر و CTA.",
    searchIntent: "پرامپت پست تلگرام",
    targetUser: "ادمین کانال و برندها",
    basePrompt: `یک پست تلگرام برای کانال بنویس.

خروجی:
1) عنوان/خط اول قوی
2) بدنه پست (کوتاه و اسکن‌پذیر)
3) نسخه خیلی کوتاه برای فوروارد
4) CTA نهایی
5) پیشنهاد برای دکمه/لینک

قوانین:
- پاراگراف‌های کوتاه
- لحن: {{TONE}}
- بدون کلیک‌بیت فریبنده

موضوع:
{{TOPIC}}
لینک یا اقدام:
{{CTA}}`,
    exampleInput: `موضوع: انتشار قابلیت مقایسه مدل‌ها در Araaye AI
CTA: شروع از /ai
لحن: شفاف و محصولی`,
    exampleOutput: `خط اول: یک سؤال را با چند مدل جواب بگیر — در یک صفحه.

بدنه:
در Araaye AI می‌توانی پاسخ GPT، Claude و Gemini را کنار هم ببینی و نسخه بهتر را انتخاب کنی.
پرداخت تومان است و برای شروع نیازی به VPN نیست.

CTA: از araaye.com/ai شروع کن.`,
    useCases: [
      "اعلام فیچر جدید",
      "خلاصه مقاله وبلاگ",
      "دعوت به وبینار یا آفر واقعی",
      "آموزش نکته‌ای کوتاه",
    ],
    commonMistakes: [
      "دیوار متن بدون شکست خط",
      "لینک را دیر گذاشتن",
      "وعده گمراه‌کننده در خط اول",
      "کپی عین کپشن اینستاگرام بدون تطبیق",
    ],
    relatedPrompts: ["instagram-caption", "ad-copy", "seo-article"],
    faq: [
      {
        question: "طول مناسب پست چقدر است؟",
        answer:
          "معمولاً ۸۰–۱۸۰ کلمه؛ این پرامپت نسخه کوتاه فوروارد هم می‌دهد.",
      },
      {
        question: "فرمت Markdown تلگرام؟",
        answer: "اگر بخواهی بگو bold/italic تلگرامی اضافه کند.",
      },
      {
        question: "برای گروه هم کار می‌کند؟",
        answer: "بله؛ مخاطب گروه را مشخص کن.",
      },
      {
        question: "چند CTA بگذارد؟",
        answer: "یکی کافی است تا تصمیم ساده بماند.",
      },
      {
        question: "می‌توانم سری پست آموزشی بسازم؟",
        answer: "بخواه «۵ پست سریالی» تا اسکلت هفته را بدهد.",
      },
    ],
    metaTitle: "پرامپت نوشتن پست تلگرام | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت پست کانال تلگرام با خط اول قوی، بدنه اسکن‌پذیر و CTA. کپی یا اجرا در Araaye AI.",
  }),

  p({
    slug: "seo-article",
    title: "پرامپت نوشتن مقاله سئو",
    category: "marketing",
    shortDescription:
      "آوتلاین و مقاله سئو مفید با نیت جستجو، بدون keyword stuffing.",
    searchIntent: "پرامپت مقاله سئو",
    targetUser: "تولیدکننده محتوا و سئوکار",
    basePrompt: `یک مقاله سئو مفید و خوانا طراحی/بنویس.

خروجی:
1) نیت جستجو و زاویه مقاله
2) عنوان‌های پیشنهادی (۳ مورد)
3) آوتلاین H2/H3
4) مقدمه
5) بدنه کامل یا بخش‌به‌بخش طبق درخواست
6) FAQ کوتاه (۴ سؤال)
7) پیشنهاد لینک داخلی

قوانین:
- keyword stuffing ممنوع
- ادعاهای آماری بدون منبع ننویس
- زبان: {{LANGUAGE}}
- کلمه کلیدی اصلی: {{KEYWORD}}

مخاطب:
{{AUDIENCE}}
نکات اختصاصی برند/خدمت:
{{NOTES}}`,
    claudeVersion: `Plan and write a helpful SEO article for {{KEYWORD}}.
Prioritize search intent and practical value over keyword density.
Provide: intent, 3 titles, outline, intro, body, 4 FAQs, internal link ideas.
No fake statistics.
Audience: {{AUDIENCE}}
Notes: {{NOTES}}
Language: {{LANGUAGE}}`,
    exampleInput: `کلمه کلیدی: سئوی محلی کلینیک
مخاطب: مدیر کلینیک
زبان: فارسی
درخواست: آوتلاین + مقدمه + یک H2 نمونه`,
    exampleOutput: `نیت: اطلاعاتی/تجاری سبک — چگونه کلینیک در جستجوی محله دیده شود.
عنوان پیشنهادی: سئوی محلی کلینیک؛ از نقشه تا صفحه خدمات

آوتلاین:
- سئوی محلی یعنی چه
- پروفایل نقشه و اطلاعات NAP
- صفحات خدمت
- نظرات و اعتماد
- اشتباهات رایج

مقدمه نمونه: اگر بیمار نزدیک شماست ولی مسیر تماس روشن نیست، مشکل معمولاً از دیده‌شدن محلی است نه فقط تبلیغ بیشتر.`,
    useCases: [
      "برنامه‌ریزی تقویم محتوا",
      "پیش‌نویس مقاله بلاگ",
      "بازنویسی محتوای ضعیف",
      "ساخت FAQ برای صفحه خدمت",
    ],
    commonMistakes: [
      "فقط تکرار کلمه کلیدی",
      "خواستن مقاله بدون مخاطب",
      "درخواست آمار جعلی",
      "ندادن تمایز خدمت خودت",
    ],
    relatedPrompts: ["rewrite", "summarize", "product-description", "ad-copy"],
    faq: [
      {
        question: "مقاله را کامل می‌نویسد یا فقط آوتلاین؟",
        answer:
          "هر دو؛ در درخواست مشخص کن «کامل» یا «فقط آوتلاین».",
      },
      {
        question: "برای فروش هم مناسب است؟",
        answer:
          "بله؛ اما لحن فروش را متعادل نگه می‌دارد تا اسپم نشود.",
      },
      {
        question: "لینک داخلی چه پیشنهادی می‌دهد؟",
        answer:
          "صفحات مرتبط مثل خدمات، قیمت یا ابزار مرتبط را پیشنهاد می‌کند اگر در NOTES بگویی.",
      },
      {
        question: "آیا جایگزین استراتژی سئو است؟",
        answer:
          "خیر؛ کمک تولید محتواست. تحقیق کلمه کلیدی و فنی جداست.",
      },
      {
        question: "چطور با Araaye AI کیفیت را بالا ببرم؟",
        answer:
          "پیش‌نویس را بگیر، بعد با پرامپت rewrite یا code-review محتوایی بازنویسی کن.",
      },
    ],
    metaTitle: "پرامپت نوشتن مقاله سئو | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت مقاله سئو با نیت جستجو، آوتلاین، FAQ و بدون keyword stuffing. اجرا در Araaye AI.",
  }),

  p({
    slug: "ad-copy",
    title: "پرامپت نوشتن متن تبلیغاتی",
    category: "marketing",
    shortDescription: "متن آگهی کوتاه برای تبلیغات و لندینگ با زاویه ارزش.",
    searchIntent: "پرامپت متن تبلیغاتی",
    targetUser: "مارکتر و صاحب کسب‌وکار",
    basePrompt: `متن تبلیغاتی بنویس.

خروجی:
1) ۵ عنوان کوتاه
2) ۳ متن اصلی (Primary text)
3) ۳ CTA
4) نسخه خیلی کوتاه برای بنر
5) زاویه ارزش هر نسخه در یک جمله

قوانین:
- بدون تضمین غیرواقعی
- روی درد مخاطب و نتیجه ملموس تمرکز کن
- کانال: {{CHANNEL}}
- لحن: {{TONE}}

محصول:
{{PRODUCT}}
مخاطب:
{{AUDIENCE}}
محدودیت ادعا:
{{CLAIMS_LIMIT}}`,
    exampleInput: `محصول: Araaye AI — چند مدل AI با پرداخت تومان
کانال: اینستاگرام ads
مخاطب: فریلنسر و تولیدکننده محتوا
محدودیت: بدون تضمین درآمد`,
    exampleOutput: `عنوان: یک چت؛ چند مدل AI
Primary: وقتی بین GPT و Claude مرددی، هر دو را در Araaye AI تست کن — پرداخت تومان، شروع ساده.
CTA: همین حالا شروع کن
زاویه: کاهش تردید انتخاب مدل`,
    useCases: [
      "کمپین اینستاگرام/گوگل",
      "بنر سایت",
      "آزمایش زاویه‌های پیام",
      "بازنویسی اد ضعیف",
    ],
    commonMistakes: [
      "تضمین نتیجه قطعی",
      "مخاطب را کلی گذاشتن",
      "ندادن محدودیت ادعا",
      "یک نسخه طولانی برای همه جا",
    ],
    relatedPrompts: ["instagram-caption", "product-description", "sales-follow-up"],
    faq: [
      {
        question: "برای گوگل ادز هم هست؟",
        answer: "CHANNEL را Google Ads بگذار تا طول‌ها کوتاه‌تر شود.",
      },
      {
        question: "چند زاویه می‌دهد؟",
        answer: "چند نسخه با زاویه ارزش جدا تا تست کنی.",
      },
      {
        question: "می‌تواند فارسی عامیانه بنویسد؟",
        answer: "لحن را خودمانی مشخص کن.",
      },
      {
        question: "از رقبا نام می‌برد؟",
        answer: "به‌صورت پیش‌فرض نه؛ مگر خودت بخواهی مقایسه منصفانه.",
      },
      {
        question: "چطور با لندینگ هماهنگ شود؟",
        answer: "همان وعده اد را در صفحه فرود تکرار کن؛ پرامپت proposal/landing جدا کمک می‌کند.",
      },
    ],
    metaTitle: "پرامپت نوشتن متن تبلیغاتی | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت متن تبلیغاتی با عنوان، primary text و CTA — بدون تضمین غیرواقعی. اجرا در Araaye AI.",
  }),

  p({
    slug: "product-description",
    title: "پرامپت نوشتن توضیح محصول",
    category: "marketing",
    shortDescription: "توضیح محصول فروشگاهی/SaaS با مزایا، ویژگی و اعتراض‌ها.",
    searchIntent: "پرامپت توضیح محصول",
    targetUser: "فروشگاه‌دار و محصول‌مارکتر",
    basePrompt: `توضیح محصول بنویس.

خروجی:
1) نام و یک‌خطی ارزش
2) توضیح کوتاه (۴۰–۶۰ کلمه)
3) توضیح بلند (۱۲۰–۱۸۰ کلمه)
4) بولت ویژگی → مزیت
5) پاسخ به ۳ اعتراض رایج خریدار
6) مشخصات کوتاه برای کارت محصول

قوانین:
- صادقانه؛ ویژگی‌ای که نداری نساز
- زبان: {{LANGUAGE}}
- مخاطب: {{AUDIENCE}}

اطلاعات محصول:
{{PRODUCT}}`,
    exampleInput: `محصول: پکیج سئوی محلی کلینیک (بهینه‌سازی نقشه + صفحات خدمت)
مخاطب: مدیر کلینیک
زبان: فارسی`,
    exampleOutput: `یک‌خطی: دیده‌شدن کلینیک در جستجوی محله و مسیر واضح تا نوبت.

کوتاه: پکیج روی پروفایل نقشه، اطلاعات تماس یکسان و صفحات خدمت تمرکز می‌کند تا بیمار محلی راحت‌تر پیدایتان کند.

بولت:
- بهینه‌سازی نقشه → اعتماد و مسیر تماس روشن‌تر
- صفحات خدمت → تطبیق با جستجوی نیاز بیمار`,
    useCases: [
      "صفحه محصول فروشگاه",
      "کارت محصول مارکت‌پلیس",
      "توضیح پکیج خدماتی",
      "کپی برای کاتالوگ",
    ],
    commonMistakes: [
      "لیست ویژگی بدون مزیت",
      "کپی مشخصات فنی خشک برای مخاطب غیرتخصصی",
      "ساخت قابلیت خیالی",
      "ندادن مخاطب هدف",
    ],
    relatedPrompts: ["ad-copy", "instagram-caption", "proposal"],
    faq: [
      {
        question: "برای محصول فیزیکی و دیجیتال فرق دارد؟",
        answer:
          "ساختار یکی است؛ در PRODUCT نوع، ارسال/تحویل و محدودیت‌ها را بنویس.",
      },
      {
        question: "سئو هم رعایت می‌شود؟",
        answer:
          "خوانایی اول است؛ اگر کلمه کلیدی داری در PRODUCT بگذار بدون stuffing.",
      },
      {
        question: "چند اعتراض پوشش می‌دهد؟",
        answer: "سه اعتراض رایج؛ می‌توانی اعتراض‌های خودت را لیست کنی.",
      },
      {
        question: "نسخه انگلیسی؟",
        answer: "LANGUAGE=English.",
      },
      {
        question: "چطور با عکس محصول هماهنگ کنم؟",
        answer: "از پرامپت product-photo برای تصویر و از این پرامپت برای متن استفاده کن.",
      },
    ],
    metaTitle: "پرامپت نوشتن توضیح محصول | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت توضیح محصول کوتاه و بلند با بولت مزیت و پاسخ اعتراض‌ها. اجرا در Araaye AI.",
  }),

  // ── Business ─────────────────────────────────────────────────
  p({
    slug: "contract-draft",
    title: "پرامپت نوشتن پیش‌نویس قرارداد",
    category: "business",
    shortDescription:
      "پیش‌نویس بندهای قرارداد کاری — برای شروع گفتگو، نه جایگزین وکیل.",
    searchIntent: "پرامپت پیش‌نویس قرارداد",
    targetUser: "فریلنسر و کسب‌وکار کوچک",
    basePrompt: `یک پیش‌نویس قرارداد ساده و شفاف بنویس.

خروجی:
1) عنوان قرارداد
2) طرفین و موضوع
3) محدوده کار (Scope)
4) مبلغ، زمان‌بندی پرداخت
5) زمان‌بندی تحویل
6) مالکیت خروجی / محرمانگی
7) فسخ و اختلاف
8) فهرست بندهایی که باید با مشاور حقوقی چک شود

هشدار مهم در ابتدای خروجی:
این متن پیش‌نویس عمومی است و مشاوره حقوقی نیست.

جزئیات پروژه:
{{PROJECT}}
کشور/حوزه:
{{JURISDICTION}}`,
    exampleInput: `پروژه: طراحی لندینگ ۳ بخش برای کلینیک
پرداخت: ۵۰٪ شروع، ۵۰٪ تحویل
حوزه: ایران`,
    exampleOutput: `هشدار: پیش‌نویس عمومی؛ قبل از امضا با مشاور حقوقی بررسی شود.

موضوع: طراحی لندینگ سه‌بخشی
Scope: طراحی UI صفحات توافق‌شده؛ شامل ۲ دور بازبینی
پرداخت: ۵۰٪ شروع / ۵۰٪ پس از تحویل فایل‌ها
مالکیت: پس از تسویه کامل به کارفرما منتقل می‌شود
باید چک شود: مالیات، تأخیر طرفین، میزبانی و محتواهای پزشکی.`,
    useCases: [
      "شروع همکاری فریلنسری",
      "شفاف کردن scope پروژه",
      "آماده‌سازی قبل از جلسه وکیل",
      "کاهش سوءتفاهم پرداخت و تحویل",
    ],
    commonMistakes: [
      "فرض کردن خروجی = قرارداد نهایی حقوقی",
      "مبهم گذاشتن scope",
      "ندادن شرایط پرداخت",
      "کپی قرارداد خارجی بدون تطبیق محلی",
    ],
    relatedPrompts: ["proposal", "business-plan", "customer-message"],
    faq: [
      {
        question: "آیا این قرارداد رسمی و کافی است؟",
        answer:
          "خیر. پیش‌نویس برای شفاف‌سازی است؛ برای اسناد لازم‌الاجرا به مشاور حقوقی مراجعه کن.",
      },
      {
        question: "برای NDA جدا هم می‌نویسد؟",
        answer: "بله؛ بخواه بخش محرمانگی را به‌صورت NDA کوتاه جدا کند.",
      },
      {
        question: "انگلیسی هم هست؟",
        answer: "بله؛ زبان را در PROJECT مشخص کن.",
      },
      {
        question: "برای استخدام تمام‌وقت مناسب است؟",
        answer:
          "بیشتر برای پروژه/فریلنس است؛ قرارداد استخدام پیچیده‌تر است و نیاز به بررسی حقوقی دارد.",
      },
      {
        question: "چطور ریسک را کم کنم؟",
        answer: "scope، پرداخت، تحویل و فسخ را دقیق پر کن و بندهای پرچم‌دار را با وکیل چک کن.",
      },
    ],
    metaTitle: "پرامپت نوشتن پیش‌نویس قرارداد | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت پیش‌نویس قرارداد پروژه با scope، پرداخت و فسخ. مشاوره حقوقی نیست — اجرا در Araaye AI.",
  }),

  p({
    slug: "business-plan",
    title: "پرامپت ساخت بیزینس پلن",
    category: "business",
    shortDescription: "اسکلت بیزینس پلن واقع‌بینانه برای ایده یا کسب‌وکار کوچک.",
    searchIntent: "پرامپت بیزینس پلن",
    targetUser: "بنیان‌گذار و صاحب کسب‌وکار",
    basePrompt: `یک بیزینس پلن مختصر و عملی بنویس.

بخش‌ها:
1) خلاصه اجرایی
2) مشکل و راه‌حل
3) مشتری هدف
4) ارزش پیشنهادی
5) مدل درآمد
6) کانال جذب
7) هزینه و منابع کلیدی
8) ریسک‌ها و فرضیات
9) برنامه ۹۰ روزه

قوانین:
- عدد جعلی نساز؛ اگر عدد نیست بازه یا «نیاز به تحقیق» بگذار
- زبان: {{LANGUAGE}}

ایده:
{{IDEA}}
وضعیت فعلی:
{{STATUS}}`,
    exampleInput: `ایده: سرویس تولید محتوای شبکه‌های اجتماعی برای کلینیک‌ها
وضعیت: ایده + ۲ مشتری آزمایشی`,
    exampleOutput: `خلاصه: کمک به کلینیک‌ها برای انتشار منظم محتوای آموزشی و نوبت‌گیری.
مشتری: کلینیک‌های متوسط با حضور ضعیف در اینستاگرام.
مدل درآمد: اشتراک ماهانه + راه‌اندازی اولیه.
ریسک: وابستگی به پلتفرم و نیاز به تأیید محتوای پزشکی.
۹۰ روز: مصاحبه ۱۰ کلینیک، پکیج استاندارد، ۲ کیس‌استادی.`,
    useCases: [
      "مرتب کردن ایده قبل از جذب شریک",
      "آماده‌سازی برای وام/سرمایه‌گذار کوچک",
      "بازنویسی پلن پراکنده",
      "تعریف برنامه ۹۰ روزه",
    ],
    commonMistakes: [
      "درخواست پیش‌بینی درآمد قطعی بدون داده",
      "بازار هدف بیش از حد وسیع",
      "نادیده گرفتن هزینه جذب مشتری",
      "کپی پلن عمومی بدون وضعیت فعلی",
    ],
    relatedPrompts: ["proposal", "ad-copy", "customer-message"],
    faq: [
      {
        question: "برای ارائه سرمایه‌گذار کافی است؟",
        answer:
          "اسکلت خوب است؛ برای pitch باید داده بازار و مالی واقعی اضافه کنی.",
      },
      {
        question: "چقدر باید طولانی باشد؟",
        answer: "این نسخه مختصر است؛ بخواه نسخه تفصیلی اگر لازم داری.",
      },
      {
        question: "مدل مالی هم می‌نویسد؟",
        answer:
          "ساختار فرضیات را می‌دهد؛ عددها را خودت با هزینه واقعی پر کن.",
      },
      {
        question: "برای کسب‌وکار محلی هم هست؟",
        answer: "بله؛ منطقه و کانال محلی را در IDEA بنویس.",
      },
      {
        question: "چطور با Araaye AI تکرار کنم؟",
        answer: "بعد از خروجی، بخواه فقط بخش ریسک یا کانال جذب را عمیق‌تر کند.",
      },
    ],
    metaTitle: "پرامپت ساخت بیزینس پلن | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت بیزینس پلن مختصر با مدل درآمد، ریسک و برنامه ۹۰ روزه. بدون عدد جعلی — Araaye AI.",
  }),

  p({
    slug: "customer-message",
    title: "پرامپت نوشتن پیام به مشتری",
    category: "business",
    shortDescription: "پیام‌های حرفه‌ای واتساپ/ایمیل برای پشتیبانی و فروش.",
    searchIntent: "پرامپت پیام به مشتری",
    targetUser: "فروش، پشتیبانی و فریلنسر",
    basePrompt: `یک پیام مشتری‌محور بنویس.

خروجی:
1) نسخه اصلی
2) نسخه کوتاه‌تر
3) نسخه رسمی‌تر
4) اگر نیاز به پیگیری است: پیام follow-up بعد از ۲ روز

قوانین:
- شفاف، مودب، بدون فشار زیاد
- کانال: {{CHANNEL}}
- هدف پیام: {{GOAL}}

زمینه:
{{CONTEXT}}
نام مشتری (اختیاری):
{{NAME}}`,
    exampleInput: `هدف: یادآوری جلسه دمو فردا
کانال: واتساپ
زمینه: مشتری به دمو Araaye AI علاقه‌مند شده`,
    exampleOutput: `نسخه اصلی: سلام، برای یادآوری جلسه دمو فردا همین‌جا پیام می‌دهم. اگر ساعت برایتان سخت شد بگویید تا جابه‌جا کنیم.
نسخه کوتاه: یادآوری دموی فردا — اگر نیاز به تغییر ساعت بود بگویید.`,
    useCases: [
      "یادآوری جلسه",
      "پاسخ به اعتراض قیمت",
      "اطلاع تأخیر تحویل",
      "درخواست بازخورد بعد از خرید",
    ],
    commonMistakes: [
      "پیام طولانی و مبهم",
      "لحن طلبکارانه",
      "ندادن اقدام بعدی واضح",
      "کپی قالب بدون زمینه",
    ],
    relatedPrompts: ["sales-follow-up", "email", "proposal", "google-review-reply"],
    faq: [
      {
        question: "برای شکایت مشتری چه؟",
        answer:
          "GOAL را «آرام‌سازی و حل مشکل» بگذار و جزئیات مشکل را در CONTEXT بنویس.",
      },
      {
        question: "ایموجی؟",
        answer: "برای واتساپ کم؛ برای ایمیل رسمی معمولاً بدون ایموجی.",
      },
      {
        question: "چند بار پیگیری کنم؟",
        answer:
          "پرامپت یک follow-up می‌دهد؛ تعداد را با قضاوت کسب‌وکارت تنظیم کن.",
      },
      {
        question: "انگلیسی؟",
        answer: "در CONTEXT زبان را مشخص کن.",
      },
      {
        question: "با پرامپت sales-follow-up چه فرقی دارد؟",
        answer:
          "این عمومی‌تر است؛ sales-follow-up مخصوص پیگیری فروش بعد از پیشنهاد است.",
      },
    ],
    metaTitle: "پرامپت نوشتن پیام به مشتری | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت پیام مشتری برای واتساپ و ایمیل با چند لحن و follow-up. اجرا در Araaye AI.",
  }),

  p({
    slug: "sales-follow-up",
    title: "پرامپت نوشتن پیام پیگیری فروش",
    category: "business",
    shortDescription: "دنباله‌های پیگیری فروش مودب، کوتاه و بدون اسپم.",
    searchIntent: "پرامپت پیگیری فروش",
    targetUser: "فروشنده و بنیان‌گذار",
    basePrompt: `دنباله پیام پیگیری فروش بنویس.

خروجی:
1) پیام روز ۰ (بعد از پیشنهاد)
2) پیگیری روز ۳
3) پیگیری روز ۷
4) پیام پایانی محترمانه (breakup email)
5) نسخه کوتاه واتساپ برای هر مرحله

قوانین:
- ارزش جدید در هر پیام (نه فقط «پیگیری کردم»)
- بدون فشار و تهدید ساختگی
- محصول: {{PRODUCT}}
- زمینه گفتگو: {{CONTEXT}}`,
    exampleInput: `محصول: پکیج سئوی محلی
زمینه: پیشنهاد ارسال شده، مشتری گفته هفته بعد جواب می‌دهد`,
    exampleOutput: `روز ۳: یک چک‌لیست کوتاه ۲ دقیقه‌ای برای پروفایل نقشه فرستادم؛ اگر خواستید روی حساب خودتان مرور می‌کنیم.
روز ۷: اگر اولویت این ماه چیز دیگری است بگویید تا زمان بهتری هماهنگ کنیم.
Breakup: همین‌جا فایل پیشنهاد را می‌بندم؛ هر وقت آماده بودید خوشحال می‌شوم ادامه دهیم.`,
    useCases: [
      "بعد از ارسال پروپوزال",
      "بعد از دمو",
      "بازیابی سرنخ سرد",
      "پیگیری در واتساپ و ایمیل",
    ],
    commonMistakes: [
      "هر روز پیام تکراری",
      "احساس گناه انداختن به مشتری",
      "ندادن ارزش جدید",
      "فراموش کردن پیام پایانی محترمانه",
    ],
    relatedPrompts: ["customer-message", "proposal", "ad-copy", "email"],
    faq: [
      {
        question: "چند پیگیری کافی است؟",
        answer:
          "این قالب ۴ نقطه تماس دارد؛ برای فروش پیچیده‌تر می‌توانی مرحله اضافه بخواهی.",
      },
      {
        question: "برای B2B طولانی‌تر است؟",
        answer: "بله؛ چرخه فروش را در CONTEXT بنویس.",
      },
      {
        question: "می‌تواند روی تخفیف تمرکز کند؟",
        answer:
          "فقط اگر تخفیف واقعی داری؛ در غیر این صورت روی ارزش و تصمیم‌گیری تمرکز می‌کند.",
      },
      {
        question: "لحن رسمی؟",
        answer: "در CONTEXT لحن را مشخص کن.",
      },
      {
        question: "با CRM چطور استفاده کنم؟",
        answer: "متن‌ها را به‌عنوان قالب مرحله‌ای در پیگیری‌ها ذخیره کن.",
      },
    ],
    metaTitle: "پرامپت نوشتن پیام پیگیری فروش | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت دنباله پیگیری فروش با ارزش در هر پیام و breakup محترمانه. اجرا در Araaye AI.",
  }),

  p({
    slug: "google-review-reply",
    title: "پرامپت آماده برای پاسخ به نظر گوگل",
    category: "business",
    shortDescription:
      "پاسخ حرفه‌ای به نظرات گوگل مپ — متناسب با ستاره، لحن برند و نوع کسب‌وکار.",
    whatItDoes: [
      "هر روز مشتریان در گوگل مپ درباره تجربه‌شان می‌نویسند. یک پاسخ کلی «ممنون از نظر شما» فرصت اعتمادسازی را از دست می‌دهد؛ یک پاسخ تدافعی یا دیرهنگام می‌تواند اعتبار کسب‌وکار را زیر سؤال ببرد.",
      "این پرامپت بر اساس متن نظر، امتیاز ستاره و نوع کسب‌وکار شما، پاسخی می‌نویسد که هم حرفه‌ای باشد هم قابل کپی مستقیم در گوگل. برای نظرات مثبت قدردانی واقعی می‌سازد؛ برای نظرات منفی عذرخواهی صادقانه و مسیر حل مشکل پیشنهاد می‌دهد — بدون وعده‌های غیرواقعی.",
      "مناسب رستوران، کلینیک، فروشگاه، سالن زیبایی و هر کسب‌وکار محلی که روی گوگل مپ دیده می‌شود. اگر چند مدل AI را با هم مقایسه کنی، می‌توانی بهترین لحن را برای برند خود انتخاب کنی.",
    ],
    searchIntent: "پرامپت پاسخ به نظر گوگل / google review reply prompt",
    targetUser: "صاحب کسب‌وکار، مدیر شعبه و تیم پشتیبانی",
    basePrompt: `تو متخصص مدیریت اعتبار آنلاین برای کسب‌وکارهای ایرانی هستی. بر اساس اطلاعات زیر، پاسخ حرفه‌ای به نظر گوگل مپ بنویس.

خروجی:
1) پاسخ نهایی (آماده کپی در گوگل)
2) نسخه کوتاه‌تر (حداکثر ۲ جمله)
3) یادداشت داخلی برای تیم: آیا نیاز به پیگیری آفلاین است؟

قوانین:
- لحن: {{TONE}}
- با امتیاز ستاره هماهنگ باش:
  • ۵ ستاره: قدردانی مشخص + اشاره به چیزی که مشتری گفت + دعوت به بازگشت
  • ۴ ستاره: تشکر + پذیرش نکته جزئی (اگر بود)
  • ۳ ستاره: عذرخواهی + پرسش یا دعوت به تماس برای بهبود
  • ۱–۲ ستاره: عذرخواهی واقعی بدون defensive بودن + مسیر حل مشکل + دعوت به تماس خصوصی
- ادعای پزشکی، قانونی یا تضمین غیرواقعی نساز
- نام مشتری را اگر در نظر آمده استفاده کن
- پاسخ ۲–۴ جمله؛ پاراگراف بلند ننویس
- اگر نظر توهین‌آمیز یا نامرتبط است: پاسخ محترمانه + پیشنهاد تماس آفلاین

نوع کسب‌وکار:
{{BUSINESS_TYPE}}

نام کسب‌وکار:
{{BUSINESS_NAME}}

متن نظر:
{{REVIEW_TEXT}}

امتیاز (۱–۵):
{{STARS}}

راه تماس برای پیگیری (اختیاری):
{{CONTACT}}`,
    gptVersion: `You manage online reputation for local businesses in Iran. Write a Google Maps review reply.

Output:
1) Final reply (ready to paste)
2) Shorter version (max 2 sentences)
3) Internal note: needs offline follow-up? yes/no + why

Rules:
- Tone: {{TONE}}
- Match star rating (5=warm thanks; 1-2=empathy + offline resolution path)
- No fake promises or medical/legal claims
- Use reviewer name if present
- 2-4 sentences max

Business type: {{BUSINESS_TYPE}}
Business name: {{BUSINESS_NAME}}
Review: {{REVIEW_TEXT}}
Stars: {{STARS}}
Contact: {{CONTACT}}`,
    claudeVersion: `Write a thoughtful Google review response for a local business.
Prioritize authenticity over marketing speak. For negative reviews, acknowledge specifics mentioned in the review before offering resolution.
Return: final reply, short version, internal follow-up note.
Tone: {{TONE}}
Business: {{BUSINESS_NAME}} ({{BUSINESS_TYPE}})
Review ({{STARS}} stars): {{REVIEW_TEXT}}
Contact: {{CONTACT}}`,
    geminiVersion: `پاسخ نظر گوگل مپ بنویس — لحن {{TONE}}.
برای ۵ ستاره: تشکر + جزئیات نظر.
برای ۱–۲ ستاره: پذیرش + راه حل + تماس.
خروجی: پاسخ نهایی، نسخه کوتاه، یادداشت پیگیری داخلی.
کسب‌وکار: {{BUSINESS_NAME}} — {{BUSINESS_TYPE}}
نظر ({{STARS}} ستاره): {{REVIEW_TEXT}}
تماس: {{CONTACT}}`,
    exampleInput: `نوع کسب‌وکار: کلینیک دندانپزشکی
نام: کلینیک دندان مهر
لحن: گرم و حرفه‌ای
امتیاز: ۲ ستاره
نظر: دو ساعت منتظر ماندم و در نهایت گفتند دکتر نیامده. برخورد پذیرش هم سرد بود.
تماس: ۰۲۱-۱۲۳۴۵۶۷۸`,
    exampleOutput: `پاسخ نهایی:
سلام و وقت بخیر. بابت انتظار طولانی و اطلاع‌رسانی دیرهنگام عذرخواهی می‌کنیم — این تجربه مطابق استاندارد کلینیک مهر نیست. لطفاً با شماره ۰۲۱-۱۲۳۴۵۶۷۸ تماس بگیرید تا هم زمان جایگزین هماهنگ کنیم و موضوع را پیگیری کنیم.

نسخه کوتاه:
بابت انتظار و اطلاع‌رسانی ناکافی عذرخواهیم. لطفاً با ۰۲۱-۱۲۳۴۵۶۷۸ تماس بگیرید تا هماهنگ کنیم.

یادداشت داخلی: بله — پیگیری توسط مدیر پذیرش؛ بررسی علت غیبت پزشک و زمان انتظار.`,
    useCases: [
      "پاسخ سریع به نظر منفی قبل از اسکرین‌شات شدن",
      "پاسخ یکدست برای تیم پذیرش چند شعبه",
      "قدردانی از نظرات ۵ ستاره با اشاره به جزئیات",
      "پاسخ به نظرات قدیمی که بی‌پاسخ مانده‌اند",
      "آماده‌سازی قالب پاسخ برای انواع سناریو (تأخیر، کیفیت، قیمت)",
    ],
    commonMistakes: [
      "کپی یک پاسخ برای همه نظرات بدون توجه به ستاره و متن",
      "دفاع تهاجمی یا blame کردن مشتری در پاسخ عمومی",
      "وعده جبران یا تخفیف که تیم عملیاتی نمی‌تواند اجرا کند",
      "پاسخ دادن دیروقت — گوگل و مشتریان هر دو پاسخ سریع را می‌بینند",
      "فراموش کردن دعوت به تماس خصوصی برای نظرات ۱–۲ ستاره",
    ],
    relatedPrompts: ["customer-message", "product-description", "proposal", "instagram-caption"],
    faq: [
      {
        question: "آیا باید به همه نظرات پاسخ بدهم؟",
        answer:
          "بله — به‌خصوص نظرات منفی. پاسخ نشان می‌دهد به بازخورد اهمیت می‌دهید و برای خوانندگان آینده هم اعتماد می‌سازد.",
      },
      {
        question: "پاسخ را چه کسی باید بنویسد؟",
        answer:
          "مدیر شعبه یا مسئول پشتیبانی که اختیار پیگیری دارد. پرامپت پیش‌نویس می‌دهد؛ قبل از انتشار سریع بازبینی کنید.",
      },
      {
        question: "برای نظر ۱ ستاره چه لحنی مناسب است؟",
        answer:
          "عذرخواهی واقعی، بدون توجیه. مشکل را بپذیرید، راه تماس بدهید و در پاسخ عمومی جزئیات خصوصی را باز نکنید.",
      },
      {
        question: "آیا می‌توانم چند مدل را مقایسه کنم؟",
        answer:
          "بله. در Araaye AI با Compare Mode همان پرامپت را با GPT، Claude و Gemini اجرا کنید و بهترین لحن را انتخاب کنید.",
      },
      {
        question: "برای کسب‌وکار انگلیسی‌زبان هم کار می‌کند؟",
        answer:
          "بله؛ TONE را English professional بگذارید یا از نسخه GPT استفاده کنید.",
      },
    ],
    metaTitle: "پرامپت پاسخ به نظر گوگل | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت آماده پاسخ به نظرات گوگل مپ — متناسب با ستاره، لحن برند و نوع کسب‌وکار. کپی کن یا با Compare Mode در Araaye AI اجرا کن.",
  }),

  p({
    slug: "proposal",
    title: "پرامپت نوشتن پروپوزال کاری",
    category: "business",
    shortDescription: "پروپوزال پروژه با مشکل، راه‌حل، محدوده و قیمت شفاف.",
    searchIntent: "پرامپت پروپوزال",
    targetUser: "فریلنسر، آژانس و مشاور",
    basePrompt: `یک پروپوزال کاری شفاف بنویس.

بخش‌ها:
1) درک مشکل مشتری
2) هدف پروژه
3) راه‌حل پیشنهادی
4) محدوده کار و خارج از محدوده
5) زمان‌بندی فازها
6) سرمایه‌گذاری / قیمت
7) مراحل بعدی
8) نسخه یک‌صفحه‌ای خلاصه

قوانین:
- وعده نتیجه غیرقابل کنترل نده
- زبان: {{LANGUAGE}}

بریف مشتری:
{{BRIEF}}
پکیج/قیمت:
{{PRICING}}`,
    exampleInput: `بریف: کلینیک می‌خواهد در گوگل مپ بهتر دیده شود و فرم نوبت داشته باشد
قیمت: پکیج ثابت + زمان‌بندی ۴ هفته`,
    exampleOutput: `مشکل: دیده‌شدن محلی و مسیر نوبت نامشخص است.
راه‌حل: بهینه‌سازی پروفایل نقشه + صفحه خدمات + فرم نوبت.
خارج از محدوده: تبلیغات پولی و تولید محتوای روزانه.
مراحل بعدی: تأیید scope، پیش‌پرداخت، kickoff.`,
    useCases: [
      "پاسخ به درخواست پروژه",
      "ارسال بعد از جلسه کشف نیاز",
      "استانداردسازی پیشنهاد آژانس",
      "شفاف کردن out of scope",
    ],
    commonMistakes: [
      "نوشتن درباره خودت بیشتر از مشکل مشتری",
      "قیمت بدون محدوده",
      "زمان‌بندی مبهم",
      "تضمین رتبه یا فروش",
    ],
    relatedPrompts: ["contract-draft", "business-plan", "sales-follow-up"],
    faq: [
      {
        question: "قالب PDF هم می‌دهد؟",
        answer:
          "متن ساخت‌یافته می‌دهد؛ می‌توانی در داکس/Notion به PDF تبدیل کنی.",
      },
      {
        question: "چند گزینه قیمت؟",
        answer: "بخواه ۳ پکیج Good/Better/Best بسازد.",
      },
      {
        question: "انگلیسی برای کلاینت خارجی؟",
        answer: "LANGUAGE=English.",
      },
      {
        question: "اگر بریف ناقص باشد؟",
        answer: "ابتدا سؤال‌های کشف نیاز را می‌پرسد یا فرضیات را لیست می‌کند.",
      },
      {
        question: "بعد از ارسال چه کنم؟",
        answer: "از پرامپت sales-follow-up برای پیگیری استفاده کن.",
      },
    ],
    metaTitle: "پرامپت نوشتن پروپوزال کاری | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت پروپوزال با مشکل، راه‌حل، scope و قیمت شفاف. بدون وعده غیرواقعی — Araaye AI.",
  }),

  // ── Writing ──────────────────────────────────────────────────
  p({
    slug: "email",
    title: "پرامپت نوشتن ایمیل حرفه‌ای",
    category: "writing",
    shortDescription: "ایمیل‌های واضح با موضوع، بدنه و CTA مناسب.",
    searchIntent: "پرامپت نوشتن ایمیل حرفه‌ای",
    targetUser: "حرفه‌ای‌ها، فروش و پشتیبانی",
    basePrompt: `یک ایمیل حرفه‌ای بنویس.

خروجی:
1) ۳ موضوع (Subject)
2) بدنه ایمیل
3) نسخه کوتاه‌تر
4) PS اختیاری اگر مفید باشد

قوانین:
- یک هدف در هر ایمیل
- لحن: {{TONE}}
- زبان: {{LANGUAGE}}

هدف:
{{GOAL}}
نکات کلیدی:
{{POINTS}}
گیرنده:
{{RECIPIENT}}`,
    exampleInput: `هدف: درخواست بازخورد بعد از تحویل لندینگ
لحن: حرفه‌ای و گرم
زبان: فارسی`,
    exampleOutput: `موضوع: بازخورد کوتاه درباره لندینگ تحویل‌شده
بدنه: لندینگ طبق موارد توافق‌شده تحویل شد. اگر ۱۰ دقیقه فرصت دارید، بگویید کدام بخش نیاز به تنظیم دارد تا در دور بازبینی اعمال کنیم.`,
    useCases: [
      "پیگیری کاری",
      "درخواست جلسه",
      "پاسخ به شکایت",
      "معرفی کوتاه خدمت",
    ],
    commonMistakes: [
      "چند درخواست در یک ایمیل",
      "موضوع مبهم",
      "بدنه خیلی طولانی",
      "ندادن اقدام بعدی",
    ],
    relatedPrompts: ["customer-message", "sales-follow-up", "cover-letter"],
    faq: [
      {
        question: "برای ایمیل سرد (cold) هم هست؟",
        answer: "بله؛ GOAL را cold outreach بگذار و ارزش را در POINTS بنویس.",
      },
      {
        question: "رسمی اداری؟",
        answer: "TONE را رسمی اداری انتخاب کن.",
      },
      {
        question: "پیوست را چطور ذکر کنم؟",
        answer: "در POINTS بنویس چه فایلی پیوست است.",
      },
      {
        question: "نسخه انگلیسی؟",
        answer: "LANGUAGE=English.",
      },
      {
        question: "با Araaye AI چند مدل را مقایسه کنم؟",
        answer: "همان پرامپت را در حالت مقایسه اجرا کن و موضوع‌های بهتر را بردار.",
      },
    ],
    metaTitle: "پرامپت نوشتن ایمیل حرفه‌ای | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت ایمیل حرفه‌ای با چند موضوع، بدنه و نسخه کوتاه. کپی یا اجرا در Araaye AI.",
  }),

  p({
    slug: "translation",
    title: "پرامپت ترجمه دقیق متن",
    category: "writing",
    shortDescription: "ترجمه طبیعی با حفظ معنا، لحن و اصطلاحات.",
    searchIntent: "پرامپت ترجمه دقیق",
    targetUser: "تولیدکننده محتوا، دانشجو و کسب‌وکار",
    basePrompt: `متن را دقیق و طبیعی ترجمه کن.

خروجی:
1) ترجمه نهایی
2) نکات اصطلاحات یا ابهام‌ها
3) اگر جمله دوپهلو بود: ۲ گزینه

قوانین:
- ترجمه تحت‌اللفظی خشک ممنوع مگر درخواست شود
- نام محصول را بی‌جهت ترجمه نکن
- از: {{SOURCE_LANG}} به: {{TARGET_LANG}}
- لحن: {{TONE}}

متن:
{{TEXT}}`,
    geminiVersion: `Translate naturally from {{SOURCE_LANG}} to {{TARGET_LANG}}.
Preserve meaning and tone ({{TONE}}).
Provide final translation + notes on ambiguities.
Text:
{{TEXT}}`,
    exampleInput: `از انگلیسی به فارسی، لحن حرفه‌ای:
We help clinics get found in local search without overpromising rankings.`,
    exampleOutput: `ترجمه: به کلینیک‌ها کمک می‌کنیم در جستجوی محلی دیده شوند؛ بدون وعده رتبه‌های قطعی.
نکته: overpromising rankings به «وعده رتبه‌های قطعی» برگردانده شد تا طبیعی باشد.`,
    useCases: [
      "ترجمه لندینگ",
      "ترجمه ایمیل کاری",
      "ترجمه کپشن و بیو",
      "بازبینی ترجمه ماشینی",
    ],
    commonMistakes: [
      "لحن را مشخص نکردن",
      "ترجمه نام برند",
      "خواستن ترجمه حقوقی بدون بازبینی متخصص",
      "ندادن زمینه مخاطب",
    ],
    relatedPrompts: ["rewrite", "summarize", "email"],
    faq: [
      {
        question: "برای متن حقوقی کافی است؟",
        answer:
          "برای پیش‌نویس کمک می‌کند؛ متون حقوقی حساس را متخصص بازبینی کند.",
      },
      {
        question: "فارسی به انگلیسی هم هست؟",
        answer: "بله؛ زبان مبدأ و مقصد را مشخص کن.",
      },
      {
        question: "اصطلاحات تخصصی؟",
        answer: "واژه‌نامه کوتاه در ابتدای TEXT بگذار.",
      },
      {
        question: "چند گزینه می‌دهد؟",
        answer: "وقتی ابهام باشد گزینه‌های جایگزین می‌آورد.",
      },
      {
        question: "تفاوت با rewrite چیست؟",
        answer: "translation معنا را بین زبان‌ها جابه‌جا می‌کند؛ rewrite در همان زبان بهبود می‌دهد.",
      },
    ],
    metaTitle: "پرامپت ترجمه دقیق متن | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت ترجمه طبیعی با حفظ لحن و یادداشت ابهام‌ها. مناسب وب و کسب‌وکار — Araaye AI.",
  }),

  p({
    slug: "summarize",
    title: "پرامپت خلاصه‌سازی متن",
    category: "writing",
    shortDescription: "خلاصه لایه‌ای: یک‌خطی، گلوله‌ای و جمع‌بندی اجرایی.",
    searchIntent: "پرامپت خلاصه متن",
    targetUser: "مدیر، دانشجو و پژوهشگر",
    basePrompt: `متن را خلاصه کن.

خروجی:
1) خلاصه یک‌جمله‌ای
2) ۵–۸ بولت کلیدی
3) تصمیم‌ها / اقدام‌های پیشنهادی (اگر متن اجرائی است)
4) موارد نامشخص که در متن نیست

قوانین:
- چیزی از خودت اضافه نکن
- طول خلاصه: {{LENGTH}}
- زبان خروجی: {{LANGUAGE}}

متن:
{{TEXT}}`,
    exampleInput: `طول: متوسط
متن: گزارش جلسه درباره تأخیر تحویل لندینگ و نیاز به محتوای پزشک`,
    exampleOutput: `یک‌جمله: تحویل لندینگ به دلیل کمبود محتوای تأییدشده پزشک جابه‌جا شد.
بولت‌ها: علت تأخیر، مسئول محتوا، تاریخ جدید، وابستگی تأیید پزشکی.
اقدام: ارسال پیش‌نویس محتوا تا چهارشنبه؛ تأیید نهایی پزشک.`,
    useCases: [
      "خلاصه جلسه",
      "خلاصه مقاله بلند",
      "آماده‌سازی brief برای مدیر",
      "استخراج action item",
    ],
    commonMistakes: [
      "خواستن خلاصه و همزمان تحلیل بدون تفکیک",
      "متن خیلی بلند بدون بخش‌بندی",
      "مشخص نکردن طول",
      "انتظار جزئیات غایب در متن اصلی",
    ],
    relatedPrompts: ["rewrite", "translation", "seo-article"],
    faq: [
      {
        question: "برای PDF طولانی؟",
        answer: "متن را بخش‌بخش بده یا بخواه خلاصه فصل‌به‌فصل.",
      },
      {
        question: "فقط action item می‌خواهم",
        answer: "بنویس فقط تصمیم‌ها و اقدام‌ها را بده.",
      },
      {
        question: "زبان خلاصه با متن فرق کند؟",
        answer: "LANGUAGE را جدا مشخص کن.",
      },
      {
        question: "دقت چطور بالا می‌رود؟",
        answer: "بخواه نقل‌قول‌های کلیدی را جدا علامت بزند.",
      },
      {
        question: "با Araaye AI چطور؟",
        answer: "متن را در چت بگذار؛ اگر طولانی است بخش کن تا کیفیت حفظ شود.",
      },
    ],
    metaTitle: "پرامپت خلاصه‌سازی متن | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت خلاصه یک‌جمله‌ای، بولت کلیدی و اقدام‌ها — بدون افزودن اطلاعات جعلی. Araaye AI.",
  }),

  p({
    slug: "rewrite",
    title: "پرامپت بازنویسی حرفه‌ای متن",
    category: "writing",
    shortDescription: "بازنویسی برای وضوح، لحن و خوانایی بدون تغییر واقعیت.",
    searchIntent: "پرامپت بازنویسی متن",
    targetUser: "نویسنده، مارکتر و مدیر",
    basePrompt: `متن را حرفه‌ای بازنویسی کن.

خروجی:
1) نسخه بازنویسی‌شده
2) نسخه کوتاه‌تر
3) فهرست تغییرات اصلی (۳–۵ مورد)

قوانین:
- معنی را عوض نکن
- لحن هدف: {{TONE}}
- مخاطب: {{AUDIENCE}}
- اگر جمله مبهم است، شفافش کن یا علامت بزن

متن:
{{TEXT}}`,
    exampleInput: `لحن: واضح و مطمئن
متن: ما سعی می‌کنیم با استفاده از ابزارهای مختلف هوش مصنوعی به کاربران کمک کنیم تا بهتر تصمیم بگیرند ولی گاهی ممکن است گیج شوند.`,
    exampleOutput: `نسخه اصلی: به کاربران کمک می‌کنیم پاسخ چند مدل هوش مصنوعی را مقایسه کنند تا انتخاب روشن‌تری داشته باشند.
تغییرات: حذف تردید اضافی، تمرکز روی مقایسه مدل‌ها، جمله کوتاه‌تر.`,
    useCases: [
      "بهبود لندینگ",
      "بازنویسی ایمیل ضعیف",
      "ساده‌سازی متن تخصصی",
      "آماده‌سازی پست شبکه اجتماعی از متن بلند",
    ],
    commonMistakes: [
      "نگفتن لحن هدف",
      "خواستن «فروش بیشتر» با ادعاهای جدید",
      "مخلوط کردن ترجمه و بازنویسی",
      "متن بدون مخاطب",
    ],
    relatedPrompts: ["summarize", "seo-article", "ad-copy", "translation"],
    faq: [
      {
        question: "می‌تواند رسمی‌تر کند؟",
        answer: "TONE را رسمی بگذار.",
      },
      {
        question: "طول را نصف کند؟",
        answer: "در دستور بگو حداکثر N کلمه.",
      },
      {
        question: "سبک برند؟",
        answer: "۳ نمونه جمله برند را کنار TEXT بگذار.",
      },
      {
        question: "غلط املایی هم درست می‌کند؟",
        answer: "بله؛ به‌عنوان بخشی از بازنویسی.",
      },
      {
        question: "تفاوت با seo-article؟",
        answer: "rewrite متن موجود را بهتر می‌کند؛ seo-article از صفر ساختار می‌سازد.",
      },
    ],
    metaTitle: "پرامپت بازنویسی حرفه‌ای متن | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت بازنویسی برای وضوح و لحن، با نسخه کوتاه و فهرست تغییرات. اجرا در Araaye AI.",
  }),

  p({
    slug: "idea-generation",
    title: "پرامپت ایده‌پردازی",
    category: "writing",
    shortDescription: "ایده‌های متنوع و قابل اجرا با معیار اولویت‌بندی.",
    searchIntent: "پرامپت ایده‌پردازی",
    targetUser: "محصول، محتوا و بنیان‌گذار",
    basePrompt: `برای موضوع زیر ایده تولید کن.

خروجی:
1) ۱۲ ایده متنوع
2) دسته‌بندی ideها (مثلاً سریع / بلندمدت)
3) ۳ ایده برتر با دلیل
4) برای ایده برتر: اولین قدم اجرایی

قوانین:
- ایده تکراری نده
- اگر محدودیت بودجه/زمان هست رعایت کن
- موضوع: {{TOPIC}}
- محدودیت‌ها: {{CONSTRAINTS}}
- مخاطب: {{AUDIENCE}}`,
    exampleInput: `موضوع: محتوای آموزشی برای معرفی Araaye AI
مخاطب: فریلنسر فارسی‌زبان
محدودیت: بدون بودجه تبلیغات زیاد`,
    exampleOutput: `ایده‌ها: مقایسه پاسخ ۳ مدل برای یک brief، چالش دیباگ ۱۵ دقیقه‌ای، سری «پرامپت هفته»...
برتر: سری پرامپت هفته — ساختش آسان است و به /prompts لینک می‌شود.
قدم اول: انتخاب ۴ پرامپت اول و انتشار یک پست تلگرام.`,
    useCases: [
      "ایده محتوا",
      "ایده فیچر محصول",
      "ایده کمپین کم‌هزینه",
      "طوفان فکری قبل از جلسه",
    ],
    commonMistakes: [
      "موضوع خیلی کلی",
      "ندادن محدودیت واقعی",
      "خواستن ۱۰۰ ایده بی‌کیفیت",
      "ندادن مخاطب",
    ],
    relatedPrompts: ["instagram-caption", "business-plan", "seo-article"],
    faq: [
      {
        question: "چطور ایده‌ها عملی‌تر شوند؟",
        answer: "محدودیت زمان، بودجه و کانال را دقیق بنویس.",
      },
      {
        question: "برای استارتاپ هم هست؟",
        answer: "بله؛ TOPIC را مسئله محصول بگذار.",
      },
      {
        question: "می‌تواند ایده‌ها را امتیازدهی کند؟",
        answer: "بخواه جدول امتیاز اثر/سختی بدهد.",
      },
      {
        question: "تکرار ایده‌های رایج؟",
        answer: "بخواه حداقل نیمی غیربدیهی باشند و از ایده‌های کلیشه‌ای علامت بزند.",
      },
      {
        question: "قدم بعد از ایده؟",
        answer: "با پرامپت proposal یا content مربوطه ایده برتر را تبدیل به اجرا کن.",
      },
    ],
    metaTitle: "پرامپت ایده‌پردازی | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت تولید ایده متنوع با اولویت‌بندی و اولین قدم اجرایی. کپی یا اجرا در Araaye AI.",
  }),

  // ── AI Image ─────────────────────────────────────────────────
  p({
    slug: "logo-image",
    title: "پرامپت ساخت لوگو با هوش مصنوعی؛ آماده کپی و استفاده",
    category: "image",
    shortDescription:
      "پرامپت ساخت لوگو با هوش مصنوعی — انگلیسی، آماده کپی برای مدل تصویر. سه واریانت عملی: مینیمال، wordmark و badge.",
    whatItDoes: [
      "این صفحه برای کسانی است که می‌خواهند با پرامپت ساخت لوگو یا پرامپت طراحی لوگو، ایده اولیه برند بسازند — نه جایگزین طراح حرفه‌ای.",
      "پرامپت اصلی و سه واریانت پایین را مستقیم کپی کنید و در استودیو تصویر Araaye AI یا هر مدل تصویر دیگر بچسبانید. نام برند، صنعت و رنگ را قبل از اجرا جایگزین کنید.",
      "خروجی برای moodboard، تست نام و ورودی طراح انسانی مناسب است. برای لوگوی نهایی حقوقی، بررسی شباهت و بازبینی طراح لازم است.",
    ],
    searchIntent: "پرامپت ساخت لوگو",
    targetUser: "بنیان‌گذار، طراح و صاحب کسب‌وکار",
    basePrompt: `Minimal flat vector logo mark for "[BRAND NAME]", [INDUSTRY] business. Abstract geometric symbol (no long text), 2-3 brand colors, large negative space, centered on pure white background, professional and scalable at 32px favicon size. Clean edges, flat design, no mockup frame, no 3D gloss, no photorealistic texture.

Negative prompt: cluttered details, busy background, gradient overload, drop shadows, 3D render, multiple unrelated icons, paragraph text, watermark`,
    promptVariations: [
      {
        label: "واریانت ۱ — علامت هندسی مینیمال",
        text: `Minimal geometric logo icon for "[BRAND NAME]". Single abstract mark built from 2-3 simple shapes, flat vector style, navy and teal palette, huge whitespace, centered on white, no text except optional single letter monogram, no mockup, no 3D.

Negative: photorealistic, ornate, gradient mesh, cluttered, tiny illegible details`,
      },
      {
        label: "واریانت ۲ — wordmark + آیکون",
        text: `Professional wordmark logo for "[BRAND NAME]" with small geometric icon to the left. Sans-serif modern typography, flat vector, [INDUSTRY] tech feel, 2-color palette, horizontal layout, white background, balanced spacing, no mockup, no 3D.

Negative: script font overload, 3D chrome, busy patterns, extra taglines, mockup presentation`,
      },
      {
        label: "واریانت ۳ — badge / emblem",
        text: `Circular badge-style logo emblem for "[BRAND NAME]", [INDUSTRY]. Simple icon inside round seal, flat vector, limited palette, clean lines, centered on white, vintage-modern balance, no photorealistic texture, no mockup.

Negative: overly complex heraldry, gradients everywhere, realistic metal, cluttered ring text`,
      },
    ],
    exampleInput: `برند: Araaye
صنعت: AI / نرم‌افزار
رنگ: navy #0a1929 + teal #2e7d6b
سبک: مینیمال هندسی`,
    exampleOutput: `پرامپت پیشنهادی (کپی کن):
Minimal flat vector logo mark for "Araaye", AI software company. Abstract letter A from overlapping planes, navy and teal, white background, no mockup.

Negative: 3D glossy, clutter, many colors, long text inside logo

نتیجه: ایده اولیه علامت — برای SVG نهایی به طراح ارجاع دهید.`,
    useCases: [
      "ایده اولیه لوگو قبل از سفارش طراحی",
      "Moodboard بصری برای تیم",
      "تست نام برند و علامت",
      "ورودی برای طراح انسانی یا طراحی سایت",
    ],
    commonMistakes: [
      "جزئیات زیاد در لوگوی کوچک — favicon ناخوانا می‌شود",
      "فراموش کردن negative prompt — خروجی شلوغ یا mockup می‌شود",
      "انتظار لوگوی حقوقی نهایی بدون بررسی شباهت",
      "متن طولانی داخل لوگو — مدل تصویر متن را خراب می‌کند",
    ],
    relatedPrompts: ["avatar", "instagram-poster", "product-photo"],
    faq: [
      {
        question: "تفاوت پرامپت ساخت لوگو و پرامپت طراحی لوگو چیست؟",
        answer:
          "در عمل همان نیت جستجو را پوشش می‌دهند. این صفحه یک پرامپت آماده کپی برای مدل تصویر می‌دهد — نه آموزش تئوری.",
      },
      {
        question: "آیا این پرامپت لوگو هوش مصنوعی جایگزین طراح است؟",
        answer:
          "خیر؛ برای ایده‌پردازی و پیش‌نمایش است. برای برند نهایی، بررسی حرفه‌ای و فایل وکتور لازم است.",
      },
      {
        question: "چطور در Araaye AI اجرا کنم؟",
        answer:
          "پرامپت را کپی کنید، روی «اجرا در Araaye AI» بزنید یا در استودیو تصویر /ai بچسبانید.",
      },
      {
        question: "چرا پرامپت انگلیسی است؟",
        answer:
          "مدل‌های تصویر (DALL·E، Midjourney، Stable Diffusion) با انگلیسی دقیق‌تر عمل می‌کنند.",
      },
      {
        question: "خروجی وکتور SVG می‌دهد؟",
        answer:
          "معمولاً raster است. برای SVG از طراح یا ابزار تبدیل استفاده کنید.",
      },
    ],
    metaTitle: "پرامپت ساخت و طراحی لوگو با هوش مصنوعی + نمونه آماده | آرایه",
    metaDescription:
      "پرامپت ساخت لوگو با هوش مصنوعی — آماده کپی + ۳ واریانت طراحی لوگو. پرامپت لوگو هوش مصنوعی برای Araaye AI و مدل‌های تصویر.",
  }),

  p({
    slug: "product-photo",
    title: "پرامپت ساخت عکس محصول",
    category: "image",
    shortDescription: "پرامپت عکس محصول فروشگاهی با نور، زاویه و پس‌زمینه مشخص.",
    searchIntent: "پرامپت عکس محصول هوش مصنوعی",
    targetUser: "فروشگاه‌دار و مارکتر",
    basePrompt: `پرامپت عکس محصول برای مدل تصویر بساز.

خروجی:
1) پرامپت انگلیسی کامل
2) نسخه فارسی
3) پیشنهاد زاویه دوربین و نور
4) negative prompt
5) نسخه برای پس‌زمینه سفید فروشگاهی + نسخه lifestyle

محصول:
{{PRODUCT}}
جزئیات ظاهری:
{{DETAILS}}
سبک:
{{STYLE}}`,
    exampleInput: `محصول: بطری سرم پوست ۳۰ml شیشه‌ای کهربایی
سبک: تمیز، نور نرم، حس کلینیکال`,
    exampleOutput: `Prompt: Amber glass 30ml serum bottle, clean studio softbox lighting, subtle reflection on white seamless background, centered product photography, high detail label area left blank, commercial catalog style
Negative: extra bottles, deformed glass, harsh shadows, cluttered props`,
    useCases: [
      "کاتالوگ فروشگاهی",
      "تست زاویه قبل از عکاسی واقعی",
      "ساخت lifestyle shot",
      "یکدست کردن تصاویر محصولات",
    ],
    commonMistakes: [
      "ندادن جنس و رنگ دقیق",
      "خواستن متن برچسب خوانا بدون فایل مرجع",
      "شلوغ کردن صحنه",
      "فراموش کردن نسخه پس‌زمینه سفید",
    ],
    relatedPrompts: ["product-description", "instagram-poster", "realistic-photo"],
    faq: [
      {
        question: "جای عکاسی واقعی می‌گیرد؟",
        answer:
          "برای ایده‌ و mockup مفید است؛ برای برخی دسته‌ها عکس واقعی اعتماد بیشتری می‌سازد.",
      },
      {
        question: "برچسب فارسی؟",
        answer: "مدل‌ها در متن روی تصویر ضعیف‌اند؛ بهتر است برچسب را جدا ترکیب کنی.",
      },
      {
        question: "نسبت تصویر؟",
        answer: "در STYLE بنویس 1:1 یا 4:5.",
      },
      {
        question: "چند زاویه؟",
        answer: "بخواه ۳ زاویه: روبه‌رو، ۴۵ درجه، جزئیات درب.",
      },
      {
        question: "لینک به Araaye؟",
        answer: "پرامپت را در استودیو تصویر Araaye AI اجرا کن.",
      },
    ],
    metaTitle: "پرامپت ساخت عکس محصول | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت عکس محصول فروشگاهی با نور، زاویه، negative و نسخه lifestyle. Araaye AI.",
  }),

  p({
    slug: "instagram-poster",
    title: "پرامپت طراحی پوستر اینستاگرام",
    category: "image",
    shortDescription: "پرامپت پوستر مربعی/استوری با ترکیب‌بندی و فضای متن.",
    searchIntent: "پرامپت پوستر اینستاگرام",
    targetUser: "ادمین محتوا و برند",
    basePrompt: `پرامپت طراحی پوستر اینستاگرام بساز.

خروجی:
1) پرامپت انگلیسی تصویر
2) راهنمای جای متن (عنوان/زیرعنوان)
3) پالت رنگ پیشنهادی
4) نسخه Feed (1:1) و Story (9:16)
5) negative prompt

موضوع:
{{TOPIC}}
متن روی پوستر:
{{COPY}}
سبک:
{{STYLE}}`,
    exampleInput: `موضوع: دانلود چک‌لیست سئوی محلی
متن: چک‌لیست رایگان سئوی کلینیک
سبک: تمیز، مدرن، فضای زیاد برای متن`,
    exampleOutput: `Prompt: Clean modern Instagram poster layout, soft navy and blue gradient background, large empty center area for Persian headline, subtle geometric shapes, professional healthcare-tech feel, high resolution, not cluttered
Space for text: center headline, small CTA at bottom
Feed 1:1 / Story 9:16 variants included.`,
    useCases: [
      "اعلام آفر",
      "پوستر آموزشی",
      "کاور لایو",
      "قالب سری محتوا",
    ],
    commonMistakes: [
      "متن زیاد روی تصویر",
      "ندادن نسبت تصویر",
      "سبک شلوغ برای موضوع جدی",
      "اتکا به املای فارسی داخل مدل تصویر",
    ],
    relatedPrompts: ["instagram-caption", "ad-copy", "logo-image"],
    faq: [
      {
        question: "متن فارسی داخل تصویر؟",
        answer:
          "بهتر است فضا خالی بماند و متن را در Canva/Figma اضافه کنی.",
      },
      {
        question: "استوری و پست با هم؟",
        answer: "این پرامپت هر دو نسبت را می‌دهد.",
      },
      {
        question: "برند کالری؟",
        answer: "رنگ‌ها را در STYLE بده.",
      },
      {
        question: "چند واریانت؟",
        answer: "بخواه ۳ ترکیب‌بندی متفاوت.",
      },
      {
        question: "با کپشن هماهنگ؟",
        answer: "بعد از پوستر از پرامپت instagram-caption استفاده کن.",
      },
    ],
    metaTitle: "پرامپت طراحی پوستر اینستاگرام | رایگان برای Araaye AI",
    metaDescription:
      "پرامپت پوستر اینستاگرام با فضای متن، پالت رنگ و نسخه Feed/Story. اجرا در Araaye AI.",
  }),

  p({
    slug: "avatar",
    title: "پرامپت ساخت آواتار",
    category: "image",
    shortDescription: "پرامپت آواتار پروفایل با سبک ثابت و مناسب سایز کوچک.",
    searchIntent: "پرامپت ساخت آواتار هوش مصنوعی",
    targetUser: "سازندگان محتوا و تیم‌ها",
    basePrompt: `پرامپت ساخت آواتار پروفایل بنویس.

خروجی:
1) پرامپت انگلیسی
2) نسخه فارسی
3) راهنمای سبک ثابت برای سری آواتار
4) negative prompt
5) ۲ واریانت (رسمی / دوستانه)

توضیح شخصیت/فرد:
{{SUBJECT}}
سبک:
{{STYLE}}`,
    exampleInput: `موضوع: آواتار برای دستیار AI فارسی، حس حرفه‌ای و دوستانه
سبک: تصویرسازی تخت، شانه و سر`,
    exampleOutput: `Prompt: Friendly professional AI assistant avatar, flat vector illustration, shoulders-up portrait, soft smile, clean navy jacket, simple circular composition, solid light background, high clarity for small profile size
Negative: photoreal uncanny face, busy background, tiny unreadable details
Variants: formal glasses / warmer colors`,
    useCases: [
      "پروفایل شبکه‌های اجتماعی",
      "آواتار تیم در سایت",
      "شخصیت بات",
      "یکدست کردن پروفایل‌ها",
    ],
    commonMistakes: [
      "جزئیات ریز که در سایز کوچک دیده نمی‌شود",
      "پس‌زمینه شلوغ",
      "تغییر سبک بین اعضای یک تیم",
      "درخواست شباهت دقیق به فرد واقعی بدون رضایت/مجوز",
    ],
    relatedPrompts: ["logo-image", "realistic-photo", "instagram-poster"],
    faq: [
      {
        question: "برای چت‌بات مناسب است؟",
        answer: "بله؛ شخصیت و لحن بصری را در SUBJECT بنویس.",
      },
      {
        question: "واقع‌گرایانه یا تصویرسازی؟",
        answer: "در STYLE مشخص کن؛ برای پروفایل کوچک flat معمولاً بهتر خوانده می‌شود.",
      },
      {
        question: "سری یکدست؟",
        answer: "از بخش «سبک ثابت» خروجی برای همه اعضا استفاده کن.",
      },
      {
        question: "حقوق تصویر فرد واقعی؟",
        answer: "برای افراد واقعی رضایت و ملاحظات حقوقی را رعایت کن.",
      },
      {
        question: "در Araaye AI؟",
        answer: "پرامپت را در استودیو تصویر اجرا کن و واریانت بگیر.",
      },
    ],
    metaTitle: "پرامپت ساخت آواتار | رایگان برای ChatGPT و Araaye AI",
    metaDescription:
      "پرامپت آواتار پروفایل با سبک ثابت، negative و واریانت رسمی/دوستانه. Araaye AI.",
  }),

  p({
    slug: "realistic-photo",
    title: "پرامپت ساخت تصویر واقع‌گرایانه",
    category: "image",
    shortDescription: "پرامپت عکس واقع‌گرایانه با نور، لنز و جزئیات کنترل‌شده.",
    searchIntent: "پرامپت تصویر واقع‌گرایانه",
    targetUser: "سازنده محتوا و طراح",
    basePrompt: `یک پرامپت تصویر واقع‌گرایانه دقیق بنویس.

خروجی:
1) پرامپت انگلیسی کامل (موضوع، نور، دوربین، محیط)
2) negative prompt برای جلوگیری از نقص‌های رایج
3) پیشنهاد نسبت تصویر
4) ۲ واریانت نور/زاویه
5) یادداشت اخلاقی: اگر افراد واقعی یا موقعیت حساس است هشدار بده

صحنه:
{{SCENE}}
جزئیات:
{{DETAILS}}
محدودیت‌ها:
{{LIMITS}}`,
    exampleInput: `صحنه: میز کار مینیمال با لپ‌تاپ باز و دفترچه یادداشت، نور صبح از پنجره
محدودیت: بدون چهره قابل شناسایی، بدون برند خوانا`,
    exampleOutput: `Prompt: Realistic photo of a minimal desk by a window, morning soft daylight, open laptop with blank screen, notebook and pen, shallow depth of field, 35mm look, natural colors, no people faces, no readable logos
Negative: deformed hands, extra objects, harsh HDR, watermark
Aspect: 3:2
Variant: cloudy diffused light / top-down flat lay`,
    useCases: [
      "تصویر هیرو وبسایت",
      "صحنه محصول در محیط",
      "استوک اختصاصی برند",
      "موکاپ محیطی",
    ],
    commonMistakes: [
      "دستور بیش از حد متناقض",
      "فراموش کردن negative برای دست/چهره معیوب",
      "درخواست چهره افراد مشهور بدون مجوز",
      "جزئیات متن خوانا روی تصویر",
    ],
    relatedPrompts: ["product-photo", "avatar", "instagram-poster"],
    faq: [
      {
        question: "چرا گاهی دست‌ها خراب می‌شوند؟",
        answer:
          "محدودیت مدل‌هاست؛ negative و ساده‌سازی صحنه کمک می‌کند، گاهی باید دوباره تولید کنی.",
      },
      {
        question: "برای تبلیغات واقعی کافی است؟",
        answer:
          "بسته به صنعت؛ شفاف باش اگر تصویر تولیدشده با AI است و قوانین پلتفرم را چک کن.",
      },
      {
        question: "لنز و ISO لازم است؟",
        answer: "اشاره کوتاه به لنز/نور معمولاً کافی است؛ اغراق نکن.",
      },
      {
        question: "نسخه سینمایی؟",
        answer: "در DETAILS بخواه cinematic lighting ولی واقع‌گرایی را حفظ کند.",
      },
      {
        question: "اجرا در Araaye AI؟",
        answer: "بله؛ پرامپت انگلیسی را در استودیو تصویر بگذار و واریانت بگیر.",
      },
    ],
    metaTitle: "پرامپت ساخت تصویر واقع‌گرایانه | رایگان برای Araaye AI",
    metaDescription:
      "پرامپت عکس واقع‌گرایانه با نور، لنز، negative و واریانت‌ها. مناسب هیرو و استوک — Araaye AI.",
  }),
];

export function getPromptBySlug(slug: string): AraayePrompt | undefined {
  return ALL_PROMPTS.find((item) => item.slug === slug);
}

export function getPromptsByCategory(category: PromptCategoryId): AraayePrompt[] {
  return ALL_PROMPTS.filter((item) => item.category === category);
}

export function getRelatedPrompts(prompt: AraayePrompt): AraayePrompt[] {
  return prompt.relatedPrompts
    .map((slug) => getPromptBySlug(slug))
    .filter((item): item is AraayePrompt => Boolean(item));
}

export function getAllPromptSlugs(): string[] {
  return ALL_PROMPTS.map((item) => item.slug);
}
