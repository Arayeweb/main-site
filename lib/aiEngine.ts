// =========================================================
// موتور AI — پوشش OpenRouter + سه حالت پاسخ
// quick: یک مدل — brainstorm: ۴ agent موازی + جمع‌بندی
// critique: جواب اولیه → ۳ منتقد موازی → نسخه بهتر
// =========================================================

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

export async function callAI(
  messages: AIMessage[],
  opts?: { model?: string; max_tokens?: number }
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY تنظیم نشده.");

  const model = opts?.model || process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  const res = await fetch(OPENROUTER_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com",
      "X-Title": "Araaye AI",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: opts?.max_tokens ?? 1000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "";
}

// ---------- Mode: quick ----------

export interface QuickResult {
  content: string;
}

export async function runQuick(question: string): Promise<QuickResult> {
  const content = await callAI(
    [
      {
        role: "system",
        content:
          "تو یک دستیار هوشمند فارسی‌زبان هستی. جواب‌های دقیق، مستقیم و کاربردی بده. از ساختار خوانا با بولت یا نکات کوتاه استفاده کن.",
      },
      { role: "user", content: question },
    ],
    { max_tokens: 1200 }
  );
  return { content };
}

// ---------- Mode: brainstorm ----------

export interface AgentResponse {
  role: string;
  label: string;
  content: string;
}

export interface BrainstormResult {
  agents: AgentResponse[];
  synthesis: string;
}

const BRAINSTORM_AGENTS = [
  {
    role: "logical_analyst",
    label: "تحلیل‌گر منطقی",
    system:
      "تو یک تحلیل‌گر منطقی هستی. از منظر منطق، داده و شواهد جواب بده. مختصر، ساختارمند و مفید باش.",
  },
  {
    role: "exec_advisor",
    label: "مشاور اجرایی",
    system:
      "تو یک مشاور اجرایی باتجربه هستی. از منظر اجرا و پیاده‌سازی جواب بده. چه کارهای عملی باید انجام شود؟",
  },
  {
    role: "risk_critic",
    label: "منتقد ریسک",
    system:
      "تو متخصص مدیریت ریسک هستی. ریسک‌ها، تهدیدها و اشتباهات احتمالی را بگو. بدبینانه و هوشمندانه فکر کن.",
  },
  {
    role: "creative",
    label: "متفکر خلاق",
    system:
      "تو یک ایده‌پرداز خلاق هستی. رویکردهای نوآورانه، غیرمتعارف یا خلاقانه پیشنهاد بده که بقیه نادیده می‌گیرند.",
  },
];

export async function runBrainstorm(question: string): Promise<BrainstormResult> {
  // ۴ فراخوانی موازی
  const results = await Promise.all(
    BRAINSTORM_AGENTS.map((a) =>
      callAI(
        [
          { role: "system", content: a.system },
          { role: "user", content: question },
        ],
        { max_tokens: 600 }
      )
    )
  );

  const agents: AgentResponse[] = BRAINSTORM_AGENTS.map((a, i) => ({
    role: a.role,
    label: a.label,
    content: results[i],
  }));

  // جمع‌بندی نهایی
  const synthesis = await callAI(
    [
      {
        role: "system",
        content:
          "نظرات چند متخصص به تو داده شده. اختلاف‌نظرها را مشخص کن. یک جمع‌بندی کاربردی بده و قدم بعدی پیشنهاد بده. ساختارمند بنویس.",
      },
      {
        role: "user",
        content: `سؤال: ${question}\n\nتحلیل‌گر منطقی:\n${results[0]}\n\nمشاور اجرایی:\n${results[1]}\n\nمنتقد ریسک:\n${results[2]}\n\nمتفکر خلاق:\n${results[3]}`,
      },
    ],
    { max_tokens: 1200 }
  );

  return { agents, synthesis };
}

// ---------- Mode: critique ----------

export interface CriticResponse {
  role: string;
  label: string;
  content: string;
}

export interface CritiqueResult {
  initial: string;
  critics: CriticResponse[];
  final_improved: string;
}

const CRITIQUE_AGENTS = [
  {
    role: "accuracy_critic",
    label: "نقد دقت اطلاعات",
    system:
      "این جواب را از نظر دقت اطلاعات نقد کن. موارد احتمالاً نادرست، ناقص یا گمراه‌کننده را مشخص کن.",
  },
  {
    role: "logic_critic",
    label: "نقد منطق",
    system:
      "این جواب را از نظر استدلال و منطق نقد کن. ضعف‌های استدلالی، تناقض‌ها یا نتیجه‌گیری‌های عجولانه را بگو.",
  },
  {
    role: "practical_critic",
    label: "نقد اجرایی",
    system:
      "این جواب را از نظر قابل اجرا بودن نقد کن. چه چیزهایی در عمل مشکل دارند یا نادیده گرفته شده؟",
  },
];

export async function runCritique(question: string): Promise<CritiqueResult> {
  // گام ۱: جواب اولیه
  const initial = await callAI(
    [
      {
        role: "system",
        content: "یک جواب کامل و مستقیم به این سؤال بده. مفصل و ساختارمند باش.",
      },
      { role: "user", content: question },
    ],
    { max_tokens: 1500 }
  );

  // گام ۲: ۳ منتقد موازی
  const criticResults = await Promise.all(
    CRITIQUE_AGENTS.map((c) =>
      callAI(
        [
          { role: "system", content: c.system },
          {
            role: "user",
            content: `سؤال: ${question}\n\nجواب: ${initial}`,
          },
        ],
        { max_tokens: 500 }
      )
    )
  );

  const critics: CriticResponse[] = CRITIQUE_AGENTS.map((c, i) => ({
    role: c.role,
    label: c.label,
    content: criticResults[i],
  }));

  // گام ۳: نسخه بهتر
  const final_improved = await callAI(
    [
      {
        role: "system",
        content:
          "با توجه به نقدهای زیر، نسخه بهتر و اصلاح‌شده جواب را بنویس. نقاط ضعف را برطرف کن و یک نتیجه قابل استفاده ارائه بده.",
      },
      {
        role: "user",
        content: `سؤال: ${question}\n\nجواب اولیه:\n${initial}\n\nنقد دقت:\n${criticResults[0]}\n\nنقد منطق:\n${criticResults[1]}\n\nنقد اجرایی:\n${criticResults[2]}`,
      },
    ],
    { max_tokens: 2000 }
  );

  return { initial, critics, final_improved };
}
