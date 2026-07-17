import { ORGANIZATION_ID, SITE_NAME } from "@/lib/seo/siteIdentity";
import { canonicalUrl } from "@/lib/siteUrl";

export type IntentSlug =
  | "chatgpt"
  | "claude"
  | "programming"
  | "students"
  | "content"
  | "compare";

export type IntentLandingDef = {
  slug: IntentSlug;
  landingType: string;
  path: string;
  seo: {
    title: string;
    description: string;
    ogTitle?: string;
  };
  breadcrumbLabel: string;
  hero: {
    eyebrow: string;
    h1: string;
    sub: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  problem: { title: string; body: string };
  useCases: { title: string; items: { title: string; desc: string }[] };
  mockup: {
    variant: "single" | "compare" | "council" | "content";
    caption: string;
    cards?: { label: string; text: string }[];
  };
  modes: {
    title: string;
    direct: string;
    compare: string;
    council: string;
  };
  prompts: { title: string; items: string[] };
  vsTable: {
    title: string;
    headers: [string, string, string];
    rows: [string, string, string][];
  };
  steps: { title: string; items: string[] };
  faq: { q: string; a: string }[];
  related: { href: string; label: string }[];
  blogLink?: { href: string; label: string };
  disclaimer?: string;
  beforeAfter?: { title: string; before: string; after: string };
  compareDemo?: {
    prompt: string;
    answers: { model: string; text: string }[];
  };
  pairLinks?: { href: string; label: string }[];
};

const CTA_TRY = { label: "رایگان امتحان کن", href: "/ai" };
const CTA_COMPARE = { label: "مقایسه مدل‌ها", href: "/ai/compare" };
const CTA_COMPARE_APP = { label: "مقایسه مدل‌ها", href: "/ai?mode=compare" };

export const INTENT_LANDINGS: Record<IntentSlug, IntentLandingDef> = {
  chatgpt: {
    slug: "chatgpt",
    landingType: "chatgpt",
    path: "/ai/chatgpt",
    seo: {
      title: "ChatGPT فارسی با پرداخت تومانی | آرایه AI",
      description:
        "ChatGPT و چند مدل دیگر در یک حساب فارسی — پرداخت تومانی، بدون چند اشتراک خارجی. پاسخ‌ها را مقایسه کن و رایگان شروع کن.",
    },
    breadcrumbLabel: "ChatGPT فارسی",
    hero: {
      eyebrow: "دسترسی فارسی به مدل‌های AI",
      h1: "ChatGPT و چند مدل هوش مصنوعی دیگر، در یک حساب",
      sub: "بدون خرید چند اشتراک جدا، از مدل‌های مختلف استفاده کن و جواب‌ها را کنار هم ببین.",
      primaryCta: CTA_TRY,
      secondaryCta: CTA_COMPARE,
    },
    problem: {
      title: "چرا فقط به یک مدل وابسته نشوی؟",
      body: "خرید چند اشتراک خارجی، پرداخت ارزی و جابه‌جایی بین چند سایت وقت‌گیر است. در آرایه AI می‌توانی ChatGPT (GPT) را کنار Claude، Gemini، Grok و DeepSeek در یک پنل فارسی ببینی — با پرداخت تومانی و بدون نیاز به چند اکانت جدا.",
    },
    useCases: {
      title: "چه کارهایی را سریع‌تر پیش می‌بری؟",
      items: [
        {
          title: "گفتگوی روزمره به فارسی",
          desc: "سؤال را بنویس؛ پاسخ GPT را در رابط فارسی بگیر.",
        },
        {
          title: "مقایسه با مدل‌های دیگر",
          desc: "همان پرامپت را به چند مدل بده و تفاوت لحن و جزئیات را ببین.",
        },
        {
          title: "نوشتن و بازنویسی",
          desc: "ایمیل، کپشن و متن رسمی را با چند نسخه امتحان کن.",
        },
        {
          title: "شروع بدون کارت خارجی",
          desc: "با اعتبار اولیه شروع کن و فقط با تومان ادامه بده.",
        },
      ],
    },
    mockup: {
      variant: "compare",
      caption: "یک سؤال؛ پاسخ GPT کنار مدل‌های دیگر",
      cards: [
        {
          label: "GPT",
          text: "سه پیشنهاد کوتاه و عملی با تمرکز روی اقدام فوری.",
        },
        {
          label: "Claude",
          text: "نسخه دقیق‌تر با جزئیات و ساختار مرحله‌ای.",
        },
        {
          label: "Gemini",
          text: "پاسخ سریع با زاویه متفاوت برای تست ایده.",
        },
      ],
    },
    modes: {
      title: "سه حالت کار در آرایه AI",
      direct: "Direct: گفتگو مستقیم با یک مدل مثل GPT برای کارهای سریع.",
      compare: "Compare: پاسخ چند مدل را هم‌زمان کنار هم ببین.",
      council: "Council: چند دیدگاه را جمع کن و یک نسخه نهایی بساز.",
    },
    prompts: {
      title: "پرامپت‌های آماده برای شروع",
      items: [
        "این متن را کوتاه‌تر و متقاعدکننده‌تر به فارسی بازنویسی کن.",
        "سه راه عملی برای افزایش فروش فروشگاه آنلاین پیشنهاد بده.",
        "این ایمیل رسمی را صمیمی‌تر کن بدون از دست دادن احترام.",
        "مزایا و معایب این تصمیم را در جدول کوتاه بنویس.",
      ],
    },
    vsTable: {
      title: "آرایه AI در برابر استفاده جداگانه از مدل‌ها",
      headers: ["قابلیت", "استفاده جداگانه", "آرایه AI"],
      rows: [
        ["چند مدل در یک حساب", "نیازمند چند اشتراک", "دارد"],
        ["مقایسه هم‌زمان", "ندارد", "دارد"],
        ["پرداخت تومانی", "معمولاً ندارد", "دارد"],
        ["رابط فارسی", "محدود", "دارد"],
      ],
    },
    steps: {
      title: "چطور شروع کنی؟",
      items: [
        "وارد آرایه AI شو و با اعتبار رایگان شروع کن.",
        "حالت Direct یا Compare را انتخاب کن.",
        "سؤال را بنویس و پاسخ‌ها را مقایسه کن.",
        "در صورت نیاز، Council را برای جمع‌بندی نهایی بزن.",
      ],
    },
    faq: [
      {
        q: "آیا آرایه نماینده رسمی OpenAI یا ChatGPT است؟",
        a: "خیر. آرایه AI یک پلتفرم مستقل فارسی برای دسترسی به چند مدل هوش مصنوعی است و نماینده رسمی OpenAI نیست.",
      },
      {
        q: "آیا می‌توانم فقط از GPT استفاده کنم؟",
        a: "بله. در حالت Direct می‌توانی با یک مدل گفتگو کنی؛ Compare برای وقتی است که بخواهی چند پاسخ را کنار هم ببینی.",
      },
      {
        q: "پرداخت چطور است؟",
        a: "پرداخت با تومان انجام می‌شود و برای شروع اعتبار اولیه در نظر گرفته شده است.",
      },
    ],
    related: [
      { href: "/ai/compare", label: "مقایسه هم‌زمان مدل‌ها" },
      { href: "/ai/claude", label: "استفاده از Claude در آرایه" },
    ],
    blogLink: {
      href: "/blog/website-chatbot-customer-support",
      label: "چت‌بات و پشتیبانی هوشمند در سایت",
    },
    disclaimer:
      "ChatGPT و GPT علائم تجاری OpenAI هستند. آرایه AI مالک یا نماینده رسمی آن‌ها نیست.",
  },

  claude: {
    slug: "claude",
    landingType: "claude",
    path: "/ai/claude",
    seo: {
      title: "استفاده از Claude در ایران | آرایه AI",
      description:
        "Claude را کنار GPT، Gemini و DeepSeek در پنل فارسی آرایه امتحان کن. برای نوشتن، تحلیل و کدنویسی — با پرداخت تومانی و مقایسه هم‌زمان.",
    },
    breadcrumbLabel: "Claude",
    hero: {
      eyebrow: "Claude در کنار مدل‌های دیگر",
      h1: "Claude را کنار مدل‌های دیگر امتحان کن",
      sub: "برای نوشتن، تحلیل و برنامه‌نویسی، پاسخ Claude را با مدل‌های دیگر مقایسه کن.",
      primaryCta: CTA_TRY,
      secondaryCta: CTA_COMPARE,
    },
    problem: {
      title: "تحلیل دقیق‌تر وقتی چند نگاه داری",
      body: "Claude (ساخت Anthropic) معمولاً در متن‌های بلند، بازنویسی و استدلال دقیق خوب عمل می‌کند؛ اما یک پاسخ همیشه کافی نیست. در آرایه می‌توانی همان سؤال را به Claude و مدل‌های دیگر بدهی و تفاوت‌ها را ببینی — بدون اشتراک جدا و با رابط فارسی.",
    },
    useCases: {
      title: "کاربردهای رایج Claude در آرایه",
      items: [
        {
          title: "تحلیل متن‌های بلند",
          desc: "گزارش، مقاله و سند را خلاصه و ساختاربندی کن.",
        },
        {
          title: "بازنویسی و ویرایش",
          desc: "لحن را رسمی، ساده یا فروش‌محور کن.",
        },
        {
          title: "کمک به برنامه‌نویسی",
          desc: "توضیح کد، ریویو و پیشنهاد اصلاح را کنار مدل‌های دیگر ببین.",
        },
        {
          title: "مقایسه دیدگاه‌ها",
          desc: "قبل از تصمیم نهایی، چند تحلیل را کنار هم قرار بده.",
        },
      ],
    },
    mockup: {
      variant: "compare",
      caption: "پاسخ Claude در کنار GPT برای یک پرامپت نوشتاری",
      cards: [
        {
          label: "Claude",
          text: "ساختار بخش‌به‌بخش با لحن طبیعی و نکات ویرایشی.",
        },
        {
          label: "GPT",
          text: "نسخه کوتاه‌تر با دعوت به اقدام مستقیم.",
        },
      ],
    },
    modes: {
      title: "چه زمانی Direct، Compare یا Council؟",
      direct: "Direct: وقتی فقط به یک گفتگوی متمرکز با Claude نیاز داری.",
      compare: "Compare: وقتی می‌خواهی Claude را با GPT یا Gemini مقایسه کنی.",
      council: "Council: وقتی چند تحلیل را به یک نسخه نهایی تبدیل می‌کنی.",
    },
    prompts: {
      title: "پرامپت‌های مناسب برای Claude",
      items: [
        "این گزارش را در سه نکته و یک اقدام بعدی خلاصه کن.",
        "این متن را دقیق‌تر و روان‌تر به فارسی بازنویسی کن.",
        "نقاط ضعف این استدلال را بدون توهین فهرست کن.",
        "این تابع را توضیح بده و دو راه ساده‌سازی پیشنهاد بده.",
      ],
    },
    vsTable: {
      title: "چرا Claude را در آرایه امتحان کنی؟",
      headers: ["قابلیت", "استفاده جداگانه", "آرایه AI"],
      rows: [
        ["دسترسی کنار مدل‌های دیگر", "جدا", "یک پنل"],
        ["مقایسه هم‌زمان", "ندارد", "دارد"],
        ["پرداخت تومانی", "معمولاً ندارد", "دارد"],
        ["رابط فارسی", "محدود", "دارد"],
      ],
    },
    steps: {
      title: "شروع کار با Claude در آرایه",
      items: [
        "وارد آرایه AI شو.",
        "مدل Claude را در Direct یا جفت Compare انتخاب کن.",
        "پرامپت تحلیلی یا نوشتاری‌ات را بفرست.",
        "در صورت نیاز پاسخ را با مدل دوم مقایسه کن.",
      ],
    },
    faq: [
      {
        q: "آیا آرایه نماینده رسمی Anthropic است؟",
        a: "خیر. آرایه یک پلتفرم مستقل است و نماینده رسمی Anthropic یا Claude نیست.",
      },
      {
        q: "Claude برای چه کارهایی مناسب‌تر حس می‌شود؟",
        a: "اغلب برای نوشتار دقیق، تحلیل متن بلند و ویرایش. برای تصمیم نهایی، مقایسه با مدل‌های دیگر را پیشنهاد می‌کنیم.",
      },
      {
        q: "آیا Claude همیشه بهترین انتخاب است؟",
        a: "خیر. بسته به کار فرق می‌کند؛ به همین دلیل Compare در آرایه طراحی شده است.",
      },
    ],
    related: [
      { href: "/ai/programming", label: "هوش مصنوعی برای برنامه‌نویسی" },
      { href: "/ai/compare/chatgpt-vs-claude", label: "مقایسه ChatGPT و Claude" },
    ],
    blogLink: {
      href: "/blog/conversion-rate-optimization",
      label: "بهینه‌سازی نرخ تبدیل با متن بهتر",
    },
    disclaimer:
      "Claude علامت تجاری Anthropic است. آرایه AI مالک یا نماینده رسمی Anthropic نیست.",
  },

  programming: {
    slug: "programming",
    landingType: "programming",
    path: "/ai/programming",
    seo: {
      title: "هوش مصنوعی برای برنامه‌نویسی و رفع خطا | آرایه AI",
      description:
        "کد، خطا و معماری را به چند مدل AI بده؛ پاسخ‌ها را مقایسه کن و با Council نسخه نهایی بساز. مناسب برنامه‌نویس و دانشجوی کامپیوتر.",
    },
    breadcrumbLabel: "برنامه‌نویسی",
    hero: {
      eyebrow: "برای توسعه‌دهنده و تیم نرم‌افزار",
      h1: "قبل از اجرای کد، نظر چند AI را ببین",
      sub: "کد، خطا و معماری را به چند مدل بده؛ جواب‌ها را مقایسه کن و تصمیم دقیق‌تری بگیر.",
      primaryCta: CTA_TRY,
      secondaryCta: CTA_COMPARE_APP,
    },
    problem: {
      title: "یک پاسخ اشتباه می‌تواند ساعت‌ها وقت بگیرد",
      body: "در دیباگ و ریویو، تکیه به یک مدل یعنی یک زاویه دید. آرایه AI بهت کمک می‌کند همان تکه کد یا خطا را به چند مدل بدهی، تفاوت راه‌حل‌ها را ببینی و در صورت نیاز با Council یک جمع‌بندی عملی بسازی.",
    },
    useCases: {
      title: "کاربردهای واقعی برای کدنویسی",
      items: [
        { title: "Debugging", desc: "علت خطا و راه‌حل مرحله‌ای از چند مدل." },
        { title: "Code Review", desc: "ریسک، خوانایی و پیشنهاد اصلاح کنار هم." },
        { title: "Refactoring", desc: "نسخه‌های ساده‌تر با توضیح trade-off." },
        { title: "Unit Test", desc: "تست‌های واحد و edge caseها." },
        { title: "معماری", desc: "نقد ساختار و نقاط شکست احتمالی." },
        { title: "امنیت و SQL", desc: "بررسی آسیب‌پذیری و کوئری تمیز." },
        { title: "Documentation", desc: "توضیح API و کامنت مفید." },
        { title: "توضیح خطا", desc: "پیام خطا را به زبان ساده بفهم." },
      ],
    },
    mockup: {
      variant: "council",
      caption: "چند تحلیل + جمع‌بندی Council",
      cards: [
        { label: "مدل A", text: "علت: null در map — پیشنهاد optional chaining." },
        { label: "مدل B", text: "گارد نوع + فیلتر قبل از map." },
        { label: "Council", text: "علت + دو پچ + تست حداقلی برای جلوگیری از رجعت." },
      ],
    },
    modes: {
      title: "حالت مناسب برای هر مرحله",
      direct: "Direct: سؤال سریع درباره یک تابع یا خطا.",
      compare: "Compare: دو راه‌حل دیباگ یا ریویو را کنار هم ببین.",
      council: "Council: چند نظر را به یک پلن اصلاح نهایی تبدیل کن.",
    },
    prompts: {
      title: "پرامپت‌های آماده برنامه‌نویسی",
      items: [
        "این کد را از نظر امنیت و Performance بررسی کن.",
        "دلیل این خطا را پیدا کن و راه‌حل مرحله‌ای بده.",
        "برای این API تست واحد بنویس.",
        "این معماری را نقد کن و نقاط شکست آن را بگو.",
      ],
    },
    vsTable: {
      title: "یک مدل در برابر چند تحلیل",
      headers: ["روش", "استفاده جداگانه", "آرایه AI"],
      rows: [
        ["چند مدل روی یک باگ", "دستی و پراکنده", "یک جریان"],
        ["مقایسه راه‌حل‌ها", "ندارد", "Compare"],
        ["جمع‌بندی نهایی", "دستی", "Council"],
        ["پرداخت تومانی", "محدود", "دارد"],
      ],
    },
    steps: {
      title: "از خطا تا اصلاح",
      items: [
        "کد یا پیام خطا را در آرایه بچسبان.",
        "Compare را برای دو مدل روشن کن.",
        "تفاوت پیشنهادها را بخوان.",
        "با Council یک پلن اصلاح نهایی بگیر.",
      ],
    },
    faq: [
      {
        q: "آیا خروجی AI را بدون بررسی اجرا کنم؟",
        a: "خیر. همیشه کد را در محیط خودت تست و ریویو کن؛ مدل‌ها ممکن است اشتباه کنند.",
      },
      {
        q: "کدام مدل برای کدنویسی؟",
        a: "بستگی به پشته و نوع مسئله دارد. در آرایه می‌توانی GPT، Claude و DeepSeek را روی یک باگ واقعی مقایسه کنی.",
      },
      {
        q: "برای تیم هم مناسب است؟",
        a: "بله — برای هم‌ترازی روی ریویو و مستندسازی، مقایسه چند دیدگاه مفید است.",
      },
    ],
    related: [
      { href: "/ai/compare", label: "مقایسه مدل‌های هوش مصنوعی" },
      { href: "/ai/claude", label: "Claude برای تحلیل و کد" },
    ],
    blogLink: {
      href: "/blog/website-speed-core-web-vitals",
      label: "سرعت سایت و Core Web Vitals",
    },
    beforeAfter: {
      title: "قبل و بعد از مقایسه",
      before: "یک جواب از یک مدل",
      after: "چند تحلیل متفاوت + پاسخ نهایی Council",
    },
  },

  students: {
    slug: "students",
    landingType: "students",
    path: "/ai/students",
    seo: {
      title: "هوش مصنوعی برای دانشجو و تحقیق | آرایه AI",
      description:
        "مفاهیم درسی را بهتر بفهم، پاسخ چند مدل را مقایسه کن و فلش‌کارت، خلاصه و ساختار ارائه بساز — با هشدار بررسی منابع.",
    },
    breadcrumbLabel: "دانشجو و درس",
    hero: {
      eyebrow: "برای دانشجو، دانش‌آموز و پژوهشگر",
      h1: "برای تحقیق و درس، به جواب یک AI اکتفا نکن",
      sub: "موضوع را بهتر بفهم، پاسخ‌ها را مقایسه کن و نسخه دقیق‌تری برای مطالعه بساز.",
      primaryCta: CTA_TRY,
      secondaryCta: CTA_COMPARE,
    },
    problem: {
      title: "یادگیری عمیق‌تر با چند توضیح",
      body: "یک توضیح ساده گاهی کافی نیست؛ توضیح دانشگاهی هم ممکن است گنگ باشد. در آرایه می‌توانی همان مفهوم را از چند مدل بپرسی، خلاصه و فلش‌کارت بسازی و نسخه‌ای انتخاب کنی که برای مطالعه خودت مناسب‌تر است.",
    },
    useCases: {
      title: "کمک‌های درسی واقعی",
      items: [
        { title: "توضیح مفاهیم", desc: "ساده و سپس دانشگاهی." },
        { title: "خلاصه‌سازی", desc: "نکات کلیدی متن و جزوه." },
        { title: "فلش‌کارت", desc: "ساخت کارت مرور برای آزمون." },
        { title: "طراحی سؤال", desc: "نمونه سؤال با پاسخ کوتاه." },
        { title: "ترجمه و نگارش", desc: "اصلاح متن انگلیسی با توضیح." },
        { title: "ساختار ارائه", desc: "اسلایدبندی موضوع." },
        { title: "برنامه مطالعه", desc: "تقسیم زمان تا آزمون." },
        { title: "متن علمی", desc: "تحلیل و بازنویسی دقیق‌تر." },
      ],
    },
    mockup: {
      variant: "single",
      caption: "یک مفهوم؛ دو سطح توضیح",
      cards: [
        {
          label: "ساده",
          text: "تعریف کوتاه با مثال روزمره برای فهم اولیه.",
        },
        {
          label: "دانشگاهی",
          text: "تعریف دقیق‌تر + اصطلاحات + یک منبع پیشنهادی برای بررسی.",
        },
      ],
    },
    modes: {
      title: "حالت‌های مفید برای درس",
      direct: "Direct: سؤال سریع درباره یک مفهوم.",
      compare: "Compare: دو توضیح متفاوت را کنار هم بخوان.",
      council: "Council: از چند توضیح، یک خلاصه مطالعه بساز.",
    },
    prompts: {
      title: "پرامپت‌های مطالعه",
      items: [
        "این مفهوم را ابتدا ساده و سپس دانشگاهی توضیح بده.",
        "از این متن ۲۰ فلش‌کارت بساز.",
        "برای این موضوع ساختار ارائه ۱۰ اسلایدی بده.",
        "اشتباه‌های این متن انگلیسی را با توضیح اصلاح کن.",
      ],
    },
    vsTable: {
      title: "مطالعه با آرایه در برابر یک چت تکی",
      headers: ["قابلیت", "یک مدل تنها", "آرایه AI"],
      rows: [
        ["چند توضیح موازی", "ندارد", "دارد"],
        ["جمع‌بندی مطالعه", "دستی", "Council"],
        ["رابط فارسی", "متغیر", "دارد"],
        ["پرداخت تومانی", "محدود", "دارد"],
      ],
    },
    steps: {
      title: "مسیر پیشنهادی مطالعه",
      items: [
        "موضوع یا پاراگراف را وارد کن.",
        "توضیح ساده و دقیق را مقایسه کن.",
        "فلش‌کارت یا ساختار ارائه بساز.",
        "نکات مهم را با منبع درسی خودت چک کن.",
      ],
    },
    faq: [
      {
        q: "آیا می‌توانم تکلیف را کامل به AI بسپارم؟",
        a: "نه به‌عنوان جایگزینی یادگیری. از AI برای فهم و تمرین استفاده کن و قوانین دانشگاه/مدرسه را رعایت کن.",
      },
      {
        q: "خروجی‌ها همیشه درست‌اند؟",
        a: "خیر. مدل‌ها ممکن است اشتباه کنند؛ منابع و اطلاعات مهم را خودت بررسی کن.",
      },
      {
        q: "برای زبان‌آموزی هم مناسب است؟",
        a: "بله — بازنویسی، تصحیح و ساخت مثال‌های تمرینی از کاربردهای رایج است.",
      },
    ],
    related: [
      { href: "/ai/content", label: "هوش مصنوعی برای تولید محتوا" },
      { href: "/ai/chatgpt", label: "ChatGPT فارسی در آرایه" },
    ],
    blogLink: {
      href: "/blog/jozb-shagerd-khososi",
      label: "جذب دانشجو برای تدریس خصوصی",
    },
    disclaimer:
      "خروجی هوش مصنوعی ممکن است اشتباه باشد؛ منابع و اطلاعات مهم را بررسی کن.",
  },

  content: {
    slug: "content",
    landingType: "content",
    path: "/ai/content",
    seo: {
      title: "هوش مصنوعی برای تولید محتوا | آرایه AI",
      description:
        "یک ایده بده و چند نسخه کپشن، ریلز و متن تبلیغ بگیر. پاسخ مدل‌ها را مقایسه کن و بهترین متن را برای انتشار انتخاب کن.",
    },
    breadcrumbLabel: "تولید محتوا",
    hero: {
      eyebrow: "برای ادمین، کپی‌رایتر و مارکتر",
      h1: "یک ایده بده؛ چند نسخه محتوا تحویل بگیر",
      sub: "پاسخ چند مدل را مقایسه کن و بهترین متن را برای انتشار انتخاب کن.",
      primaryCta: CTA_TRY,
      secondaryCta: CTA_COMPARE_APP,
    },
    problem: {
      title: "اولین پیش‌نویس معمولاً بهترین نسخه نیست",
      body: "برای کپشن، ریلز و متن فروش، تنوع لحن مهم است. در آرایه یک بریف می‌دهی و چند نسخه از مدل‌های مختلف می‌گیری تا سریع‌تر به متن قابل انتشار برسی — بدون پریدن بین چند ابزار.",
    },
    useCases: {
      title: "خروجی‌هایی که تیم محتوا می‌خواهد",
      items: [
        { title: "کپشن", desc: "چند لحن برای پست و استوری." },
        { title: "سناریوی ریلز", desc: "هوک، بدنه و CTA." },
        { title: "متن تبلیغ", desc: "کوتاه و فروش‌محور." },
        { title: "ایمیل مارکتینگ", desc: "موضوع + بدنه." },
        { title: "صفحه فروش", desc: "تیتر و بلوک‌های متقاعدکننده." },
        { title: "عنوان مقاله", desc: "گزینه‌های غیرزرد." },
        { title: "تقویم محتوا", desc: "ایده برای هفته/ماه." },
        { title: "بازنویسی", desc: "رسمی یا خودمانی." },
      ],
    },
    mockup: {
      variant: "content",
      caption: "یک بریف؛ سه نسخه کپشن",
      cards: [
        { label: "نسخه ۱", text: "هوک سؤال‌محور + مزیت کوتاه + CTA." },
        { label: "نسخه ۲", text: "داستان مشتری + اثبات اجتماعی." },
        { label: "نسخه ۳", text: "لیست ۳ نکته + دعوت به ذخیره پست." },
      ],
    },
    modes: {
      title: "از ایده تا نسخه نهایی",
      direct: "Direct: ایده‌پردازی سریع با یک مدل.",
      compare: "Compare: چند کپشن/سناریو را کنار هم ببین.",
      council: "Council: بهترین عناصر را در یک نسخه نهایی جمع کن.",
    },
    prompts: {
      title: "پرامپت‌های تولید محتوا",
      items: [
        "برای این محصول سه سناریوی ریلز با هوک متفاوت بنویس.",
        "این متن تبلیغ را کوتاه‌تر و فروش‌محورتر کن.",
        "۲۰ عنوان غیرزرد برای این مقاله پیشنهاد بده.",
        "این کپشن را برای لحن رسمی و خودمانی بازنویسی کن.",
      ],
    },
    vsTable: {
      title: "تولید محتوا با آرایه",
      headers: ["قابلیت", "چند ابزار جدا", "آرایه AI"],
      rows: [
        ["چند نسخه هم‌زمان", "دستی", "Compare"],
        ["جمع‌بندی بهترین نسخه", "دستی", "Council"],
        ["پرداخت تومانی", "محدود", "دارد"],
        ["رابط فارسی", "متغیر", "دارد"],
      ],
    },
    steps: {
      title: "گردش کار پیشنهادی",
      items: [
        "بریف محصول و مخاطب را بنویس.",
        "چند نسخه با Compare بگیر.",
        "بهترین هوک و CTA را انتخاب کن.",
        "با Council یک نسخه نهایی برای انتشار بساز.",
      ],
    },
    faq: [
      {
        q: "متن AI را مستقیم منتشر کنم؟",
        a: "بهتر است ویرایش انسانی داشته باشد تا با لحن برند و واقعیت محصول هم‌خوان شود.",
      },
      {
        q: "برای اینستاگرام مناسب است؟",
        a: "بله — کپشن، هوک ریلز و ایده‌های تقویم از کاربردهای پرتکرارند.",
      },
      {
        q: "تفاوت با صفحه امکانات چیست؟",
        a: "این صفحه روی گردش کار تولید محتوا تمرکز دارد؛ امکانات کلی محصول را در /ai/features ببین.",
      },
    ],
    related: [
      { href: "/ai/compare", label: "مقایسه مدل‌ها برای انتخاب متن" },
      { href: "/ai/chatgpt", label: "ChatGPT فارسی برای نوشتن سریع" },
    ],
    blogLink: {
      href: "/blog/conversion-rate-optimization",
      label: "بهینه‌سازی نرخ تبدیل صفحه",
    },
  },

  compare: {
    slug: "compare",
    landingType: "compare",
    path: "/ai/compare",
    seo: {
      title: "مقایسه هم‌زمان مدل‌های هوش مصنوعی | آرایه AI",
      description:
        "یک سؤال بده و پاسخ GPT، Claude، Gemini و DeepSeek را هم‌زمان ببین. Compare و Council در یک پنل فارسی با پرداخت تومانی.",
    },
    breadcrumbLabel: "مقایسه مدل‌ها",
    hero: {
      eyebrow: "مهم‌ترین قابلیت آرایه AI",
      h1: "یک سؤال؛ چند پاسخ از چند هوش مصنوعی",
      sub: "به‌جای جابه‌جایی بین چند سایت، جواب مدل‌ها را هم‌زمان کنار هم مقایسه کن.",
      primaryCta: CTA_TRY,
      secondaryCta: CTA_COMPARE_APP,
    },
    problem: {
      title: "چرا اختلاف پاسخ مدل‌ها مهم است؟",
      body: "اولین پاسخ همیشه کامل‌ترین نیست. گاهی یک مدل جزئیات را بهتر می‌بیند و دیگری لحن یا ساختار بهتری دارد. مقایسه هم‌زمان کمک می‌کند قبل از تصمیم یا انتشار، زاویه‌های مختلف را ببینی.",
    },
    useCases: {
      title: "چه زمانی مقایسه ارزش دارد؟",
      items: [
        {
          title: "تصمیم‌گیری",
          desc: "چند توصیه عملی را کنار هم وزن کن.",
        },
        {
          title: "نوشتن حساس",
          desc: "لحن و دقت را قبل از ارسال بسنج.",
        },
        {
          title: "کد و معماری",
          desc: "دو راه‌حل فنی را مقایسه کن.",
        },
        {
          title: "یادگیری",
          desc: "دو توضیح متفاوت از یک مفهوم بگیر.",
        },
      ],
    },
    mockup: {
      variant: "compare",
      caption: "نمونه مقایسه سه‌ستونه",
      cards: [
        { label: "GPT", text: "پیشنهادهای اجرایی و کوتاه." },
        { label: "Claude", text: "تحلیل عمیق‌تر با اولویت‌بندی." },
        { label: "Gemini", text: "زاویه سریع و ساختارمند." },
      ],
    },
    modes: {
      title: "Compare چه می‌کند؟ Council چه زمانی؟",
      direct: "Direct: وقتی فقط یک مدل کافی است.",
      compare:
        "Compare: یک پرامپت را به چند مدل می‌فرستد و پاسخ‌ها را کنار هم نشان می‌دهد.",
      council:
        "Council: چند پاسخ را جمع می‌کند تا یک نسخه نهایی هماهنگ بسازی — وقتی اختلاف‌ها زیاد یا تصمیم مهم است.",
    },
    prompts: {
      title: "پرامپت‌های خوب برای مقایسه",
      items: [
        "برای افزایش فروش یک فروشگاه اینترنتی سه پیشنهاد عملی بده.",
        "این متن را برای دو لحن رسمی و خودمانی بازنویسی کن.",
        "دو راه برای رفع این باگ پیشنهاد بده و trade-off بگو.",
        "این مفهوم را ساده و دقیق توضیح بده.",
      ],
    },
    vsTable: {
      title: "روش کار",
      headers: ["روش", "استفاده جداگانه", "آرایه AI"],
      rows: [
        ["چند مدل", "نیازمند چند حساب", "چند مدل در یک حساب"],
        ["مقایسه هم‌زمان", "ندارد", "دارد"],
        ["پرداخت تومانی", "ندارد", "دارد"],
        ["رابط فارسی", "محدود", "دارد"],
      ],
    },
    steps: {
      title: "شروع مقایسه در ۳۰ ثانیه",
      items: [
        "وارد آرایه شو و حالت Compare را باز کن.",
        "دو مدل انتخاب کن.",
        "سؤال را بفرست و پاسخ‌ها را بخوان.",
        "در صورت نیاز Council را برای جمع‌بندی بزن.",
      ],
    },
    faq: [
      {
        q: "چرا نباید همیشه به اولین پاسخ اعتماد کرد؟",
        a: "مدل‌ها ممکن است جزئیات را جا بیندازند یا لحن نامناسبی انتخاب کنند. دیدن چند پاسخ ریسک را کم می‌کند.",
      },
      {
        q: "Compare با Council چه فرقی دارد؟",
        a: "Compare پاسخ‌ها را کنار هم نشان می‌دهد؛ Council کمک می‌کند از آن‌ها یک خروجی نهایی بسازی.",
      },
      {
        q: "کدام مدل‌ها در دسترس‌اند؟",
        a: "بسته به پلن، مدل‌هایی مثل GPT، Claude، Gemini، Grok و DeepSeek در آرایه فعال‌اند.",
      },
    ],
    related: [
      { href: "/ai/programming", label: "مقایسه برای برنامه‌نویسی" },
      { href: "/ai/content", label: "مقایسه برای تولید محتوا" },
    ],
    blogLink: {
      href: "/ai/compare/chatgpt-vs-claude",
      label: "مقایسه جزئی ChatGPT و Claude",
    },
    compareDemo: {
      prompt: "برای افزایش فروش یک فروشگاه اینترنتی سه پیشنهاد عملی بده.",
      answers: [
        {
          model: "GPT",
          text: "۱) ساده‌سازی چک‌اوت ۲) پیشنهاد مکمل در سبد ۳) یادآوری رهاشده با تخفیف محدود.",
        },
        {
          model: "Claude",
          text: "اول گلوگاه تبدیل را پیدا کن؛ بعد اعتماد (نظرات، گارانتی) و در نهایت پیشنهاد شخصی‌سازی‌شده.",
        },
        {
          model: "Gemini",
          text: "باندل محصول، تایمر ارسال رایگان، و CTA واضح بالای صفحه موبایل.",
        },
      ],
    },
    pairLinks: [
      { href: "/ai/compare/chatgpt-vs-gemini", label: "ChatGPT در برابر Gemini" },
      { href: "/ai/compare/chatgpt-vs-claude", label: "ChatGPT در برابر Claude" },
      { href: "/ai/compare/claude-vs-gemini", label: "Claude در برابر Gemini" },
      { href: "/ai/compare/chatgpt-vs-deepseek", label: "ChatGPT در برابر DeepSeek" },
      { href: "/ai/compare/best-ai-for-coding", label: "بهترین AI برای کدنویسی" },
      { href: "/ai/compare/best-ai-for-persian", label: "بهترین AI برای فارسی" },
      { href: "/ai/compare/best-ai-for-content", label: "بهترین AI برای محتوا" },
    ],
  },
};

export const INTENT_CARD_LINKS = [
  { href: "/ai/programming", label: "برنامه‌نویسی", desc: "دیباگ، ریویو، تست" },
  { href: "/ai/students", label: "درس و دانشگاه", desc: "مفهوم، خلاصه، فلش‌کارت" },
  { href: "/ai/content", label: "تولید محتوا", desc: "کپشن، ریلز، تبلیغ" },
  { href: "/ai/compare", label: "مقایسه مدل‌ها", desc: "چند پاسخ هم‌زمان" },
  { href: "/ai/chatgpt", label: "ChatGPT", desc: "فارسی و تومانی" },
  { href: "/ai/claude", label: "Claude", desc: "نوشتن و تحلیل" },
] as const;

export function getIntentLanding(slug: IntentSlug): IntentLandingDef {
  return INTENT_LANDINGS[slug];
}

export function getAllIntentSlugs(): IntentSlug[] {
  return Object.keys(INTENT_LANDINGS) as IntentSlug[];
}

export function buildAiIntentJsonLd(def: IntentLandingDef) {
  const url = canonicalUrl(def.path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "هوش مصنوعی آرایه",
        applicationCategory: "ChatApplication",
        operatingSystem: "Web",
        url,
        inLanguage: "fa",
        provider: { "@id": ORGANIZATION_ID },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IRR",
          description: "شروع با اعتبار اولیه",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
            item: canonicalUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "هوش مصنوعی آرایه",
            item: canonicalUrl("/ai"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: def.breadcrumbLabel,
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: def.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}

export function intentLandingMetadata(def: IntentLandingDef) {
  const url = canonicalUrl(def.path);
  const title = def.seo.title;
  const description = def.seo.description;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: def.seo.ogTitle ?? title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "fa_IR",
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}
