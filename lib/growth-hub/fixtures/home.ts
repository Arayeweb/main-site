export type GrowthHubScenarioKey =
  | "healthy"
  | "action-required"
  | "website-in-progress"
  | "website-completed"
  | "seo-insufficient-data"
  | "new-customer"
  | "overdue-invoice"
  | "growth-opportunity"
  | "loading"
  | "error";

export type StatusTone = "healthy" | "attention" | "progress" | "complete";

export interface MetricFixture {
  label: string;
  value: string;
  context: string;
  interpretation: string;
  source: string;
}

export interface ServiceFixture {
  id: string;
  title: string;
  status: string;
  statusTone: StatusTone;
  progress?: number;
  nextAction: string;
}

export interface ActionFixture {
  id: string;
  title: string;
  detail: string;
  dueLabel?: string;
  primary?: boolean;
}

export interface ActivityFixture {
  id: string;
  title: string;
  detail: string;
  time: string;
}

export interface ReportFixture {
  title: string;
  period: string;
  summary: string;
}

export interface OpportunityFixture {
  title: string;
  evidence: string;
  recommendation: string;
  expectedOutcome: string;
}

export interface BillingFixture {
  status: "clear" | "pending" | "overdue";
  title: string;
  detail: string;
  amount?: string;
}

export interface GrowthHubHomeFixture {
  key: GrowthHubScenarioKey;
  selectorLabel: string;
  workspace: {
    name: string;
    industry: string;
    initials: string;
    userName: string;
  };
  page: {
    eyebrow: string;
    title: string;
    description: string;
    updatedAt: string;
  };
  status: {
    tone: StatusTone;
    label: string;
    title: string;
    description: string;
  };
  primaryAction?: ActionFixture;
  metrics: MetricFixture[];
  metricsEmptyMessage?: string;
  services: ServiceFixture[];
  pendingActions: ActionFixture[];
  activities: ActivityFixture[];
  report?: ReportFixture;
  reportEmptyMessage?: string;
  opportunity?: OpportunityFixture;
  billing?: BillingFixture;
  isLoading?: boolean;
  error?: {
    title: string;
    message: string;
  };
}

const clinicWorkspace = {
  name: "کلینیک دندان‌پزشکی سپید",
  industry: "سلامت و درمان",
  initials: "س",
  userName: "دکتر شریفی",
};

const basePage = {
  eyebrow: "پنج‌شنبه، ۱ مرداد ۱۴۰۵",
  title: "سلام دکتر شریفی",
  description: "وضعیت رشد و کارهای جاری کلینیک را یک‌جا ببینید.",
  updatedAt: "آخرین به‌روزرسانی: امروز، ۱۸:۲۰",
};

const healthyMetrics: MetricFixture[] = [
  {
    label: "بازدید وب‌سایت",
    value: "۲٬۸۴۰",
    context: "۱۸٪ بیشتر از ماه قبل",
    interpretation: "بیشترین رشد مربوط به صفحه ایمپلنت است.",
    source: "آمار سایت · امروز",
  },
  {
    label: "تماس و واتساپ",
    value: "۹۶",
    context: "۱۲ تماس بیشتر از ماه قبل",
    interpretation: "رشد بازدید به تماس بیشتر رسیده است.",
    source: "ردیابی تماس · امروز",
  },
  {
    label: "فرم‌های رزرو",
    value: "۳۱",
    context: "از هر ۱۰۰ بازدید، حدود ۱ فرم",
    interpretation: "فرم رزرو هنوز ظرفیت بهبود دارد.",
    source: "فرم سایت · امروز",
  },
  {
    label: "دیده‌شدن در گوگل",
    value: "۱۸٬۷۰۰",
    context: "۲۴٪ بیشتر از ۳۰ روز قبل",
    interpretation: "ایمپلنت و لمینت بیشتر دیده شده‌اند.",
    source: "گزارش آرایه · ۳۱ تیر",
  },
];

const healthyServices: ServiceFixture[] = [
  {
    id: "seo",
    title: "سئوی ماهانه کلینیک",
    status: "فعال و طبق برنامه",
    statusTone: "healthy",
    progress: 68,
    nextAction: "بهینه‌سازی صفحه ایمپلنت در حال انجام است.",
  },
  {
    id: "care",
    title: "نگهداری وب‌سایت",
    status: "فعال",
    statusTone: "healthy",
    nextAction: "بررسی امنیت و نسخه پشتیبان در ۴ مرداد.",
  },
];

const healthyActivities: ActivityFixture[] = [
  {
    id: "activity-1",
    title: "صفحه خدمات ایمپلنت به‌روزرسانی شد",
    detail: "عنوان‌ها، پرسش‌های پرتکرار و مسیر تماس اصلاح شدند.",
    time: "امروز، ۱۴:۳۰",
  },
  {
    id: "activity-2",
    title: "مشکل سرعت نسخه موبایل رفع شد",
    detail: "زمان نمایش محتوای اصلی صفحه خانه بهبود پیدا کرد.",
    time: "دیروز",
  },
  {
    id: "activity-3",
    title: "گزارش تیر آماده شد",
    detail: "نتایج، یافته‌ها و برنامه ماه بعد منتشر شده است.",
    time: "۲۹ تیر",
  },
];

const baseHealthy: GrowthHubHomeFixture = {
  key: "healthy",
  selectorLabel: "کسب‌وکار فعال و سالم",
  workspace: clinicWorkspace,
  page: basePage,
  status: {
    tone: "healthy",
    label: "وضعیت کلی",
    title: "همه‌چیز طبق برنامه پیش می‌رود",
    description:
      "ورودی گوگل بهتر شده، خدمات فعال به‌موقع در حال انجام‌اند و مورد فوری برای پیگیری ندارید.",
  },
  primaryAction: {
    id: "read-report",
    title: "گزارش تیرماه را مرور کنید",
    detail: "خلاصه نتایج و سه اقدام پیشنهادی ماه بعد آماده است.",
    dueLabel: "حدود ۴ دقیقه",
    primary: true,
  },
  metrics: healthyMetrics,
  services: healthyServices,
  pendingActions: [],
  activities: healthyActivities,
  report: {
    title: "گزارش عملکرد تیرماه",
    period: "۱ تا ۳۱ تیر ۱۴۰۵",
    summary:
      "ورودی گوگل رشد کرده و صفحه ایمپلنت عملکرد بهتری داشته است؛ تمرکز ماه بعد روی تبدیل بازدید به رزرو خواهد بود.",
  },
  opportunity: {
    title: "فرصت بهبود رزرو در صفحه ایمپلنت",
    evidence:
      "بازدید صفحه ایمپلنت ۲۸٪ رشد کرده، اما نرخ اقدام برای تماس هنوز ۱٫۴٪ است.",
    recommendation:
      "شفاف‌تر کردن پاسخ به دغدغه هزینه و نمایش مسیر کوتاه رزرو در بالای صفحه.",
    expectedOutcome:
      "تبدیل سهم بیشتری از بازدید فعلی به درخواست مشاوره، بدون افزایش هزینه تبلیغ.",
  },
  billing: {
    status: "clear",
    title: "وضعیت مالی مرتب است",
    detail: "همه فاکتورهای صادرشده پرداخت شده‌اند.",
  },
};

function scenario(
  key: GrowthHubScenarioKey,
  selectorLabel: string,
  changes: Partial<GrowthHubHomeFixture>,
): GrowthHubHomeFixture {
  return {
    ...baseHealthy,
    ...changes,
    key,
    selectorLabel,
    workspace: { ...baseHealthy.workspace, ...changes.workspace },
    page: { ...baseHealthy.page, ...changes.page },
    status: { ...baseHealthy.status, ...changes.status },
  };
}

export const growthHubHomeFixtures: Record<
  GrowthHubScenarioKey,
  GrowthHubHomeFixture
> = {
  healthy: baseHealthy,
  "action-required": scenario("action-required", "نیازمند اقدام مشتری", {
    status: {
      tone: "attention",
      label: "منتظر اقدام شما",
      title: "برای ادامه کار، تصاویر پزشکان را ارسال کنید",
      description:
        "طراحی صفحه تیم درمان آماده است، اما بدون تصاویر تأییدشده امکان تکمیل و انتشار صفحه را نداریم.",
    },
    primaryAction: {
      id: "send-photos",
      title: "ارسال تصاویر پزشکان",
      detail: "شش تصویر باکیفیت و نام هر پزشک برای تکمیل صفحه لازم است.",
      dueLabel: "پیشنهاد: تا ۴ مرداد",
      primary: true,
    },
    pendingActions: [
      {
        id: "approve-about",
        title: "تأیید متن معرفی کلینیک",
        detail: "نسخه بازنویسی‌شده آماده بررسی است.",
        dueLabel: "تا ۵ مرداد",
      },
    ],
  }),
  "website-in-progress": scenario("website-in-progress", "پروژه سایت در حال اجرا", {
    workspace: {
      name: "مجموعه آموزشی آریانا",
      industry: "آموزش",
      initials: "آ",
      userName: "خانم احمدی",
    },
    page: {
      ...basePage,
      title: "سلام خانم احمدی",
      description: "وضعیت ساخت وب‌سایت جدید مجموعه را دنبال کنید.",
    },
    status: {
      tone: "progress",
      label: "پروژه در حال اجرا",
      title: "طراحی رابط کاربری به مرحله بازبینی رسیده است",
      description:
        "ساختار صفحات و طراحی موبایل تکمیل شده؛ پس از تأیید شما وارد مرحله توسعه می‌شویم.",
    },
    primaryAction: {
      id: "review-design",
      title: "بازبینی طرح صفحه خانه",
      detail: "لطفاً نسخه موبایل و دسکتاپ را ببینید و نظر نهایی را ثبت کنید.",
      dueLabel: "تا ۳ مرداد",
      primary: true,
    },
    metrics: [],
    metricsEmptyMessage:
      "وب‌سایت هنوز منتشر نشده است؛ شاخص‌های واقعی پس از انتشار نمایش داده می‌شوند.",
    services: [
      {
        id: "web",
        title: "طراحی وب‌سایت اختصاصی",
        status: "در حال اجرا",
        statusTone: "progress",
        progress: 58,
        nextAction: "منتظر تأیید طرح صفحه خانه هستیم.",
      },
    ],
    activities: [
      {
        id: "design-ready",
        title: "نسخه موبایل صفحه خانه آماده شد",
        detail: "چیدمان دوره‌ها و مسیر ثبت‌نام برای موبایل بازطراحی شد.",
        time: "امروز",
      },
      {
        id: "content",
        title: "محتوای سه صفحه وارد طراحی شد",
        detail: "درباره ما، دوره‌ها و تماس با ما.",
        time: "۳۰ تیر",
      },
    ],
    report: undefined,
    reportEmptyMessage: "اولین گزارش پس از انتشار وب‌سایت ارائه می‌شود.",
    opportunity: undefined,
    billing: {
      status: "pending",
      title: "مرحله دوم قرارداد",
      detail: "فاکتور پس از تأیید طراحی صادر می‌شود.",
    },
  }),
  "website-completed": scenario("website-completed", "پروژه سایت تکمیل‌شده", {
    workspace: {
      name: "استودیو زیبایی مهرا",
      industry: "زیبایی",
      initials: "م",
      userName: "خانم مرادی",
    },
    page: {
      ...basePage,
      title: "سلام خانم مرادی",
      description: "وب‌سایت شما منتشر شده و آماده جذب مراجعه‌کننده است.",
    },
    status: {
      tone: "complete",
      label: "پروژه تکمیل شد",
      title: "وب‌سایت با موفقیت منتشر شده است",
      description:
        "تمام صفحات اصلی تحویل شده‌اند و نگهداری سی‌روزه پس از انتشار فعال است.",
    },
    primaryAction: {
      id: "review-handover",
      title: "بررسی فایل‌های تحویل",
      detail: "راهنمای مدیریت سایت و اطلاعات دسترسی در مرکز فایل‌ها آماده است.",
      dueLabel: "حدود ۳ دقیقه",
      primary: true,
    },
    metrics: [
      {
        label: "روزهای فعال",
        value: "۱۲ روز",
        context: "از زمان انتشار رسمی",
        interpretation: "هنوز برای مقایسه روند بازدید به زمان بیشتری نیاز است.",
        source: "وضعیت پروژه · امروز",
      },
    ],
    services: [
      {
        id: "web-done",
        title: "طراحی وب‌سایت",
        status: "تکمیل‌شده",
        statusTone: "complete",
        progress: 100,
        nextAction: "دوره پشتیبانی تحویل تا ۱۸ مرداد فعال است.",
      },
    ],
    activities: [
      {
        id: "beauty-published",
        title: "وب‌سایت استودیو منتشر شد",
        detail: "دامنه اصلی متصل شد و همه صفحات برای موبایل بازبینی شدند.",
        time: "۱۲ روز پیش",
      },
      {
        id: "beauty-handover",
        title: "فایل‌های تحویل آماده شدند",
        detail: "راهنمای مدیریت سایت و اطلاعات دسترسی ثبت شده است.",
        time: "۱۰ روز پیش",
      },
    ],
    pendingActions: [],
    report: undefined,
    reportEmptyMessage: "اولین گزارش عملکرد پس از ۳۰ روز فعالیت منتشر می‌شود.",
    opportunity: undefined,
  }),
  "seo-insufficient-data": scenario(
    "seo-insufficient-data",
    "سئو با داده ناکافی",
    {
      status: {
        tone: "progress",
        label: "داده در حال جمع‌آوری",
        title: "سئوی ماهانه شروع شده؛ برای نتیجه‌گیری هنوز زود است",
        description:
          "تنظیمات فنی و صفحات هدف انجام شده‌اند. پس از کامل شدن دوره ۳۰ روزه، روند قابل اتکا نمایش داده می‌شود.",
      },
      primaryAction: {
        id: "confirm-services",
        title: "فهرست خدمات کلینیک را تأیید کنید",
        detail: "این فهرست برای انتخاب صفحات هدف سئو استفاده می‌شود.",
        dueLabel: "تا ۶ مرداد",
        primary: true,
      },
      metrics: [
        {
          label: "صفحات بررسی‌شده",
          value: "۱۴ صفحه",
          context: "از ۱۸ صفحه وب‌سایت",
          interpretation: "چهار صفحه کم‌اهمیت در مرحله بعد بررسی می‌شوند.",
          source: "بررسی فنی آرایه · ۳۱ تیر",
        },
        {
          label: "روزهای جمع‌آوری داده",
          value: "۹ روز",
          context: "حداقل دوره قابل اتکا: ۳۰ روز",
          interpretation: "تغییرات رتبه فعلی برای نتیجه‌گیری کافی نیست.",
          source: "گزارش آرایه · امروز",
        },
      ],
      services: [
        {
          id: "seo-start",
          title: "سئوی ماهانه",
          status: "در حال شروع",
          statusTone: "progress",
          progress: 22,
          nextAction: "تکمیل تحقیق عبارت‌های هدف.",
        },
      ],
      activities: [
        {
          id: "seo-technical",
          title: "بررسی فنی چهارده صفحه انجام شد",
          detail: "مشکلات ایندکس و عنوان صفحات اصلی ثبت و اولویت‌بندی شدند.",
          time: "امروز",
        },
        {
          id: "seo-keywords",
          title: "فهرست اولیه عبارت‌های هدف آماده شد",
          detail: "نسخه نهایی پس از تأیید خدمات کلینیک تکمیل می‌شود.",
          time: "دیروز",
        },
      ],
      report: undefined,
      reportEmptyMessage:
        "پس از کامل شدن اولین دوره ۳۰ روزه، گزارش معتبر منتشر می‌شود.",
      opportunity: undefined,
    },
  ),
  "new-customer": scenario("new-customer", "مشتری جدید بدون گزارش", {
    workspace: {
      name: "مرکز فیزیوتراپی حرکت",
      industry: "سلامت و درمان",
      initials: "ح",
      userName: "آقای حیدری",
    },
    page: {
      ...basePage,
      title: "به مرکز رشد آرایه خوش آمدید",
      description: "اطلاعات خدمات شما در حال آماده‌سازی است.",
    },
    status: {
      tone: "progress",
      label: "شروع همکاری",
      title: "فضای کاری شما ساخته شده است",
      description:
        "تیم آرایه در حال ثبت خدمات و برنامه شروع همکاری است. نخستین به‌روزرسانی تا فردا نمایش داده می‌شود.",
    },
    primaryAction: {
      id: "complete-intake",
      title: "تکمیل اطلاعات اولیه",
      detail: "ساعت کاری، خدمات اصلی و راه‌های تماس را بررسی کنید.",
      dueLabel: "حدود ۵ دقیقه",
      primary: true,
    },
    metrics: [],
    metricsEmptyMessage:
      "هنوز داده‌ای ثبت نشده است. شاخص‌ها پس از شروع خدمت نمایش داده می‌شوند.",
    services: [],
    pendingActions: [],
    activities: [
      {
        id: "workspace-created",
        title: "فضای کاری شما ایجاد شد",
        detail: "مدیر حساب آرایه تا فردا خدمات را ثبت می‌کند.",
        time: "امروز",
      },
    ],
    report: undefined,
    reportEmptyMessage: "هنوز گزارشی برای این فضای کاری منتشر نشده است.",
    opportunity: undefined,
    billing: undefined,
  }),
  "overdue-invoice": scenario("overdue-invoice", "فاکتور سررسیدگذشته", {
    status: {
      tone: "attention",
      label: "یک مورد نیاز به بررسی دارد",
      title: "فاکتور نگهداری سایت از موعد پرداخت گذشته است",
      description:
        "خدمات جاری متوقف نشده، اما برای ادامه بدون وقفه لطفاً وضعیت پرداخت را بررسی کنید.",
    },
    primaryAction: {
      id: "review-invoice",
      title: "بررسی فاکتور مرداد",
      detail: "مبلغ ۸٬۵۰۰٬۰۰۰ تومان؛ سررسید ۳۰ تیر بوده است.",
      dueLabel: "۳ روز گذشته",
      primary: true,
    },
    billing: {
      status: "overdue",
      title: "فاکتور سررسیدگذشته",
      detail: "فاکتور نگهداری سایت — سررسید ۳۰ تیر",
      amount: "۸٬۵۰۰٬۰۰۰ تومان",
    },
  }),
  "growth-opportunity": scenario(
    "growth-opportunity",
    "فرصت رشد مبتنی بر شواهد",
    {
      opportunity: {
        title: "صفحه خدمات بازدید دارد، اما تماس کمتری می‌گیرد",
        evidence:
          "در ۳۰ روز گذشته ۱٬۲۶۰ نفر صفحه ایمپلنت را دیده‌اند و فقط ۱۸ نفر روی تماس یا واتساپ زده‌اند.",
        recommendation:
          "بازطراحی بخش اعتماد، پاسخ به دغدغه هزینه و ساده‌تر کردن اقدام رزرو.",
        expectedOutcome:
          "افزایش تعداد درخواست‌های قابل پیگیری بدون افزایش هزینه جذب بازدید.",
      },
    },
  ),
  loading: scenario("loading", "حالت بارگذاری کامل", {
    metrics: [],
    services: [],
    pendingActions: [],
    activities: [],
    report: undefined,
    billing: undefined,
    isLoading: true,
  }),
  error: scenario("error", "حالت خطا", {
    metrics: [],
    services: [],
    pendingActions: [],
    activities: [],
    report: undefined,
    billing: undefined,
    error: {
      title: "امکان نمایش وضعیت وجود ندارد",
      message:
        "اطلاعات این صفحه بارگذاری نشد. چند لحظه دیگر دوباره تلاش کنید.",
    },
  }),
};

export const growthHubScenarioOptions = Object.values(growthHubHomeFixtures).map(
  ({ key, selectorLabel }) => ({ key, label: selectorLabel }),
);

export function getGrowthHubFixture(
  value?: string,
): GrowthHubHomeFixture {
  if (value && value in growthHubHomeFixtures) {
    return growthHubHomeFixtures[value as GrowthHubScenarioKey];
  }
  return growthHubHomeFixtures.healthy;
}
