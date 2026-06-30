// =========================================================
// موتور AI — پوشش OpenRouter + سه حالت پاسخ
// quick: یک مدل — brainstorm: ۴ agent موازی + جمع‌بندی
// critique: جواب اولیه → ۳ منتقد موازی → نسخه بهتر
// =========================================================

import { DEFAULT_COUNCIL, modelName } from "./aiModels";

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

  const model = opts?.model || DEFAULT_MODEL;

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

/** نسخه‌ی streaming از callAI — متن را تکه‌تکه برمی‌گرداند. */
export async function callAIStream(
  messages: AIMessage[],
  opts?: { model?: string; max_tokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY تنظیم نشده.");

  const model = opts?.model || DEFAULT_MODEL;

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
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  if (!res.body) throw new Error("No response body from OpenRouter.");
  return res.body;
}

// ---------- Mode: quick ----------

export interface QuickResult {
  content: string;
}

export async function runQuick(
  question: string,
  model?: string
): Promise<QuickResult> {
  const usedModel = model || DEFAULT_MODEL;
  const content = await callAI(
    [
      {
        role: "system",
        content:
          "تو یک دستیار هوشمند فارسی‌زبان هستی. جواب‌های دقیق، مستقیم و کاربردی بده. از ساختار خوانا با بولت یا نکات کوتاه استفاده کن.",
      },
      { role: "user", content: question },
    ],
    { model: usedModel, max_tokens: 1200 }
  );
  return { content };
}

/** نسخه‌ی streaming از runQuick — فقط برای حالت quick. */
export async function runQuickStream(
  question: string,
  model?: string
): Promise<ReadableStream<Uint8Array>> {
  const usedModel = model || DEFAULT_MODEL;
  return callAIStream(
    [
      {
        role: "system",
        content:
          "تو یک دستیار هوشمند فارسی‌زبان هستی. جواب‌های دقیق، مستقیم و کاربردی بده. از ساختار خوانا با بولت یا نکات کوتاه استفاده کن.",
      },
      { role: "user", content: question },
    ],
    { model: usedModel, max_tokens: 1200 }
  );
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

// سؤال یکسان به چند مدل هوش مصنوعی داده می‌شود؛ تفاوتِ دیدگاه از خودِ مدل می‌آید نه نقش ساختگی.
const COUNCIL_SYSTEM =
  "تو یک دستیار هوشمند فارسی‌زبان هستی. به این سؤال جوابی دقیق، کاربردی و نسبتاً کوتاه بده. صادق باش و اگر مطمئن نیستی بگو.";

export async function runBrainstorm(
  question: string,
  modelIds: string[]
): Promise<BrainstormResult> {
  const ids = (modelIds.length >= 2 ? modelIds : DEFAULT_COUNCIL).slice(0, 4);

  // هر مدل به‌صورت موازی جواب می‌دهد؛ اگر یکی خطا داد بقیه ادامه می‌دهند.
  const results = await Promise.all(
    ids.map((id) =>
      callAI(
        [
          { role: "system", content: COUNCIL_SYSTEM },
          { role: "user", content: question },
        ],
        { model: id, max_tokens: 700 }
      ).catch(() => "")
    )
  );

  const agents: AgentResponse[] = ids
    .map((id, i) => ({
      role: id, // اسلاگ مدل به‌عنوان شناسه
      label: modelName(id),
      content: results[i],
    }))
    .filter((a) => a.content.trim().length > 0);

  if (agents.length === 0) {
    throw new Error("هیچ‌کدام از مدل‌ها پاسخ ندادند.");
  }

  // هماهنگ‌کننده‌ی شورا: جواب‌های مدل‌ها را جمع‌بندی می‌کند.
  const combined = agents
    .map((a) => `${a.label}:\n${a.content}`)
    .join("\n\n———\n\n");

  const synthesis = await callAI(
    [
      {
        role: "system",
        content:
          "چند هوش مصنوعی به یک سؤال جواب داده‌اند. نقاط مشترک و تفاوت‌هایشان را کوتاه مشخص کن، بهترین نکات را کنار هم بگذار و یک جمع‌بندی نهاییِ کاربردی با قدم بعدی بده. ساده و خوانا بنویس.",
      },
      {
        role: "user",
        content: `سؤال: ${question}\n\nجواب مدل‌ها:\n\n${combined}`,
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
