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
  | "google-shoope"
  | "google-pourdast";

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
    key: "google-pourdast",
    name: "دکتر عالیه پوردست",
    goal: "ثبت و بهینه‌سازی پروفایل گوگل",
    isDesignSample: false,
    showcasePath: "https://aliehpourdast.com",
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
    "google-ashrafivand": "google-pourdast",
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
