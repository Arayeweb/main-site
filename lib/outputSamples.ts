export interface OutputSample {
  key: OutputSampleKey;
  name: string;
  goal: string;
  isDesignSample: boolean;
  showcasePath: string;
}

export type OutputSampleKey =
  | "shiva-hearing"
  | "kaveh-iron"
  | "medisa-studio"
  | "emroz"
  | "deepinhq"
  | "pourdast-clinic"
  | "tahereh-pourdast"
  | "google-shoope"
  | "google-emdad-ahan";

export const heroDesignSample: OutputSample = {
  key: "shiva-hearing",
  name: "کلینیک شنوایی شیوا",
  goal: "سایت معرفی خدمات شنوایی، سمعک و درخواست مشاوره",
  isDesignSample: true,
  showcasePath: "/showcase/shiva-hearing",
};

export const secondaryDesignSamples: OutputSample[] = [
  {
    key: "kaveh-iron",
    name: "آهن کاوه",
    goal: "لندینگ فروش برای استعلام قیمت آهن‌آلات",
    isDesignSample: true,
    showcasePath: "/showcase/kaveh-iron",
  },
  {
    key: "medisa-studio",
    name: "استودیو معماری مدیسا",
    goal: "وب‌سایت نمونه‌کارها و ثبت درخواست پروژه",
    isDesignSample: true,
    showcasePath: "/showcase/medisa-studio",
  },
];

export const designOutputSamples: OutputSample[] = [
  heroDesignSample,
  ...secondaryDesignSamples,
];

export const internationalOutputSamples: OutputSample[] = [
  {
    key: "emroz",
    name: "امروز",
    goal: "محصول دیجیتال برای عادت‌سازی، کالری با AI و همراهی روزانه",
    isDesignSample: false,
    showcasePath: "https://emroz.top/landing",
  },
  {
    key: "deepinhq",
    name: "DeepinHQ",
    goal: "پلتفرم SaaS تحلیل مالی با داشبورد و متریک‌های نهادی",
    isDesignSample: false,
    showcasePath: "https://deepinhq.com",
  },
  {
    key: "pourdast-clinic",
    name: "عالیه پوردست",
    goal: "سایت مطب با معرفی تخصص، اعتمادسازی و مسیر تماس بیمار",
    isDesignSample: false,
    showcasePath: "https://aliehpourdast.com",
  },
  {
    key: "tahereh-pourdast",
    name: "طاهره پوردست",
    goal: "سایت مطب زنان با معرفی فلوشیپ لاپاراسکوپی و مسیر نوبت",
    isDesignSample: false,
    showcasePath: "https://dr-pourdast.vercel.app",
  },
];

export const portfolioOutputSamples: OutputSample[] = [
  ...designOutputSamples,
  ...internationalOutputSamples,
];

export const googleOutputSamples: OutputSample[] = [
  {
    key: "google-shoope",
    name: "اسموک لاب شوپه",
    goal: "ثبت گوگل مپ، نمایه کسب‌وکار و کارت دیجیتال",
    isDesignSample: false,
    showcasePath: "/b/shoope_smoke_lab",
  },
  {
    key: "google-emdad-ahan",
    name: "امداد آهن",
    goal: "ثبت گوگل مپ، نمایه کسب‌وکار و کارت دیجیتال",
    isDesignSample: false,
    showcasePath: "/b/emdadahan",
  },
];

export const outputSamples: OutputSample[] = [
  ...portfolioOutputSamples,
  ...googleOutputSamples,
];

export function resolveOutputSampleKey(key: string): OutputSampleKey | undefined {
  const aliases: Record<string, OutputSampleKey> = {
    shiva: "shiva-hearing",
    iron: "kaveh-iron",
    medisa: "medisa-studio",
    "google-ashrafivand": "google-emdad-ahan",
    "google-pourdast": "google-emdad-ahan",
    pourdast: "pourdast-clinic",
    "alieh-pourdast": "pourdast-clinic",
    "tahereh-pourdast": "tahereh-pourdast",
    "dr-pourdast": "tahereh-pourdast",
    "google-dental": "google-shoope",
  };
  const resolved = (aliases[key] ?? key) as OutputSampleKey;
  return outputSamples.some((sample) => sample.key === resolved) ? resolved : undefined;
}

export function getOutputSample(key: string): OutputSample | undefined {
  const resolved = resolveOutputSampleKey(key);
  if (!resolved) return undefined;
  return outputSamples.find((sample) => sample.key === resolved);
}
