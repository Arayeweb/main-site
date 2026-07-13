import { SITE_URL } from "@/lib/siteUrl";
import type { KordianJourneyStep, KordianService, KordianWhyChooseItem, LocalizedString } from "./types";
import { KORDIAN_BASE_PATH } from "./types";

export const kordianBrand = {
  name: {
    en: "Dr. Kordian",
    ru: "Доктор Кардиан",
  } satisfies LocalizedString,
  title: {
    en: "Ophthalmologist",
    ru: "Офтальмолог",
  } satisfies LocalizedString,
  clinic: {
    en: "[Clinic Name Placeholder]",
    ru: "[Название клиники — заменить]",
  } satisfies LocalizedString,
  tagline: {
    en: "Specialist eye care for international patients — clear communication, structured visits, and attentive follow-up.",
    ru: "Специализированная офтальмологическая помощь для международных пациентов — понятное общение, организованные визиты и внимательное сопровождение.",
  } satisfies LocalizedString,
};

export const kordianImages = {
  hero: "/assets/showdemoto/dr-kordian/hero.png",
  heroFallback:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80",
  about:
    "https://images.unsplash.com/photo-1581594693702-fbdc1b256f70?auto=format&fit=crop&w=1200&q=80",
  clinic:
    "https://images.unsplash.com/photo-1519494026893-4bbd133fd5c8?auto=format&fit=crop&w=1200&q=80",
};

export const kordianContact = {
  email: "[email@clinic.example]",
  phone: "[+00 000 000 0000]",
  address: {
    en: "[Street address, City, Country]",
    ru: "[Адрес, город, страна]",
  } satisfies LocalizedString,
  hours: {
    en: "Monday – Friday, [hours to be confirmed]",
    ru: "Понедельник – пятница, [часы работы уточняются]",
  } satisfies LocalizedString,
};

/** Easily editable demo services — replace descriptions with verified clinic copy. */
export const kordianServices: KordianService[] = [
  {
    id: "comprehensive-exam",
    icon: "exam",
    title: {
      en: "Comprehensive Eye Examination",
      ru: "Комплексное обследование зрения",
    },
    description: {
      en: "A structured assessment of vision, eye health, and medical history — tailored for patients visiting from abroad.",
      ru: "Структурированная оценка зрения, состояния глаз и медицинской истории — для пациентов, приезжающих из других стран.",
    },
  },
  {
    id: "cataract-consultation",
    icon: "cataract",
    title: {
      en: "Cataract Consultation",
      ru: "Консультация по катаракте",
    },
    description: {
      en: "Evaluation of lens changes, visual symptoms, and next-step options discussed in plain language before any decision.",
      ru: "Оценка изменений хрусталика, симптомов и возможных следующих шагов — с понятным объяснением до принятия решения.",
    },
  },
  {
    id: "retinal-assessment",
    icon: "retina",
    title: {
      en: "Retinal Assessment",
      ru: "Обследование сетчатки",
    },
    description: {
      en: "Focused review of retinal health using appropriate diagnostic tools, with findings explained for international follow-up.",
      ru: "Целенаправленная оценка состояния сетчатки с использованием диагностического оборудования и понятным объяснением результатов.",
    },
  },
  {
    id: "vision-correction",
    icon: "vision",
    title: {
      en: "Vision Correction Consultation",
      ru: "Консультация по коррекции зрения",
    },
    description: {
      en: "Discussion of refractive options, suitability factors, and what to expect — without outcome guarantees.",
      ru: "Обсуждение вариантов коррекции зрения, показаний и ожиданий — без обещаний гарантированного результата.",
    },
  },
];

export const kordianJourney: KordianJourneyStep[] = [
  {
    step: 1,
    title: { en: "Initial inquiry", ru: "Первичный запрос" },
    description: {
      en: "Share your concern, travel dates, and prior records. The clinic team responds with available consultation slots.",
      ru: "Опишите проблему, даты поездки и имеющиеся документы. Команда клиники предложит доступные слоты для консультации.",
    },
  },
  {
    step: 2,
    title: { en: "Pre-visit coordination", ru: "Подготовка к визиту" },
    description: {
      en: "Receive guidance on documents to bring, language support options, and what the first appointment includes.",
      ru: "Получите инструкции по документам, языковой поддержке и содержанию первого приёма.",
    },
  },
  {
    step: 3,
    title: { en: "Consultation & plan", ru: "Консультация и план" },
    description: {
      en: "Meet Dr. Kordian for examination and a clear summary of findings and recommended next steps.",
      ru: "Встреча с доктором Кардианом, обследование и понятное резюме результатов с рекомендациями.",
    },
  },
  {
    step: 4,
    title: { en: "Follow-up support", ru: "Сопровождение после визита" },
    description: {
      en: "Written summary and guidance for your home physician or a return visit, as clinically appropriate.",
      ru: "Письменное резюме и рекомендации для вашего лечащего врача или повторного визита при необходимости.",
    },
  },
];

export const kordianWhyChoose: KordianWhyChooseItem[] = [
  {
    title: { en: "International patient focus", ru: "Фокус на международных пациентах" },
    description: {
      en: "Communication and visit flow designed for patients traveling for eye care.",
      ru: "Коммуникация и организация визита адаптированы для пациентов, приезжающих на лечение.",
    },
  },
  {
    title: { en: "Clear medical communication", ru: "Понятное медицинское общение" },
    description: {
      en: "Findings and options explained in English or Russian before you decide on next steps.",
      ru: "Результаты и варианты лечения объясняются на английском или русском до принятия решения.",
    },
  },
  {
    title: { en: "Modern diagnostic setting", ru: "Современная диагностическая среда" },
    description: {
      en: "A professional clinic environment equipped for thorough ophthalmic assessment.",
      ru: "Профессиональная клиническая среда, оборудованная для полноценной офтальмологической диагностики.",
    },
  },
  {
    title: { en: "Structured appointment process", ru: "Структурированный процесс приёма" },
    description: {
      en: "From first contact to follow-up, each step is organized to respect your time abroad.",
      ru: "От первого контакта до сопровождения — каждый этап организован с учётом вашего времени за рубежом.",
    },
  },
];

export const kordianAbout = {
  intro: {
    en: "Dr. Kordian is an ophthalmologist focused on comprehensive eye care for local and international patients. This preview uses placeholder credentials — verified qualifications, affiliations, and biography will replace the text below before launch.",
    ru: "Доктор Кардиан — офтальмолог, специализирующийся на комплексной помощи пациентам из разных стран. В этом демо используются заглушки — подтверждённые квалификации, членства и биография будут добавлены перед запуском.",
  } satisfies LocalizedString,
  credentials: {
    en: "[Medical degree and specialty training — to be verified]",
    ru: "[Медицинское образование и специализация — подлежат подтверждению]",
  } satisfies LocalizedString,
  memberships: {
    en: "[Professional memberships — to be verified]",
    ru: "[Членство в профессиональных ассоциациях — подлежит подтверждению]",
  } satisfies LocalizedString,
  approach: {
    en: "Patient-centered consultations with time to discuss symptoms, examination findings, and practical options — without pressure or guaranteed outcomes.",
    ru: "Консультации, ориентированные на пациента, с временем для обсуждения симптомов, результатов обследования и практических вариантов — без давления и гарантий результата.",
  } satisfies LocalizedString,
};

export const kordianJsonLd = {
  "@context": "https://schema.org",
  "@type": "Physician",
  name: "Dr. Kordian",
  medicalSpecialty: "Ophthalmology",
  url: `${SITE_URL}${KORDIAN_BASE_PATH}/en`,
};
