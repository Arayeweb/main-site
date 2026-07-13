import type { KordianLocale, LocalizedString } from "../types";

export type KordianMessages = {
  nav: {
    home: string;
    about: string;
    treatments: string;
    articles: string;
    contact: string;
    requestConsultation: string;
    cmsPreview: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustNote: string;
  };
  sections: {
    introTitle: string;
    introCta: string;
    servicesTitle: string;
    servicesSubtitle: string;
    journeyTitle: string;
    journeySubtitle: string;
    whyTitle: string;
    whySubtitle: string;
    articlesTitle: string;
    articlesSubtitle: string;
    viewAllArticles: string;
    readArticle: string;
    contactTitle: string;
    contactSubtitle: string;
    contactCta: string;
  };
  about: {
    pageTitle: string;
    pageDescription: string;
    credentialsTitle: string;
    membershipsTitle: string;
    approachTitle: string;
  };
  treatments: {
    pageTitle: string;
    pageDescription: string;
    learnMore: string;
    bookConsultation: string;
  };
  articles: {
    pageTitle: string;
    pageDescription: string;
    empty: string;
    published: string;
    by: string;
    backToArticles: string;
    draftNotice: string;
  };
  contact: {
    pageTitle: string;
    pageDescription: string;
    formTitle: string;
    name: string;
    email: string;
    phone: string;
    preferredLanguage: string;
    message: string;
    travelDates: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    infoTitle: string;
    emailLabel: string;
    phoneLabel: string;
    addressLabel: string;
    hoursLabel: string;
  };
  footer: {
    tagline: string;
    navigation: string;
    contact: string;
    legal: string;
    disclaimer: string;
    demoBy: string;
  };
  admin: {
    previewBanner: string;
    title: string;
    subtitle: string;
    backToSite: string;
    articles: string;
    newArticle: string;
    editArticle: string;
    deleteConfirm: string;
    saveDraft: string;
    publish: string;
    preview: string;
    status: string;
    draft: string;
    published: string;
    titleEn: string;
    titleRu: string;
    excerptEn: string;
    excerptRu: string;
    contentEn: string;
    contentRu: string;
    coverUrl: string;
    author: string;
    category: string;
    publishDate: string;
    slug: string;
    actions: string;
    noArticles: string;
    languageCoverage: string;
    bothLanguages: string;
    enOnly: string;
    ruOnly: string;
    saved: string;
    deleted: string;
  };
  meta: {
    homeTitle: string;
    homeDescription: string;
    aboutTitle: string;
    aboutDescription: string;
    treatmentsTitle: string;
    treatmentsDescription: string;
    articlesTitle: string;
    articlesDescription: string;
    contactTitle: string;
    contactDescription: string;
  };
};

const en: KordianMessages = {
  nav: {
    home: "Home",
    about: "About Dr. Kordian",
    treatments: "Treatments & Services",
    articles: "Articles",
    contact: "Contact",
    requestConsultation: "Request a Consultation",
    cmsPreview: "CMS Preview",
  },
  hero: {
    eyebrow: "International Eye Care",
    title: "Clear vision starts with attentive, specialist care",
    subtitle:
      "Dr. Kordian welcomes international patients for comprehensive ophthalmology consultations — in English or Russian.",
    ctaPrimary: "Request a Consultation",
    ctaSecondary: "Meet Dr. Kordian",
    trustNote: "Placeholder clinic details — verified information will be added before launch.",
  },
  sections: {
    introTitle: "A specialist focused on your eye health",
    introCta: "About Dr. Kordian",
    servicesTitle: "Eye-care services",
    servicesSubtitle: "Core consultation areas for international patients visiting the clinic.",
    journeyTitle: "International patient journey",
    journeySubtitle: "A clear path from first message to follow-up after your visit.",
    whyTitle: "Why patients choose this clinic",
    whySubtitle: "Designed for clarity, comfort, and coordinated care abroad.",
    articlesTitle: "Latest articles",
    articlesSubtitle: "Educational content managed directly by the clinic team.",
    viewAllArticles: "View all articles",
    readArticle: "Read article",
    contactTitle: "Ready to schedule a consultation?",
    contactSubtitle: "Send a request and the clinic team will respond with available appointment options.",
    contactCta: "Contact & appointment request",
  },
  about: {
    pageTitle: "About Dr. Kordian",
    pageDescription:
      "Learn about Dr. Kordian’s approach to ophthalmology and care for international patients.",
    credentialsTitle: "Education & training",
    membershipsTitle: "Professional affiliations",
    approachTitle: "Consultation approach",
  },
  treatments: {
    pageTitle: "Treatments & Services",
    pageDescription:
      "Consultation services for comprehensive eye examinations and specialist assessments.",
    learnMore: "Request consultation",
    bookConsultation: "Book a consultation",
  },
  articles: {
    pageTitle: "Articles",
    pageDescription: "Eye-health articles published and managed by the clinic.",
    empty: "No published articles yet. Use the CMS preview to publish your first article.",
    published: "Published",
    by: "By",
    backToArticles: "Back to articles",
    draftNotice: "Draft preview — not visible on the public site until published.",
  },
  contact: {
    pageTitle: "Contact & Appointment Request",
    pageDescription: "Reach the clinic team to request a consultation or ask a question.",
    formTitle: "Send a consultation request",
    name: "Full name",
    email: "Email address",
    phone: "Phone (optional)",
    preferredLanguage: "Preferred language",
    message: "How can we help?",
    travelDates: "Planned travel dates (optional)",
    submit: "Send request",
    submitting: "Sending…",
    success: "Thank you — your request has been recorded for this demo. The clinic team will contact you.",
    error: "Something went wrong. Please try again.",
    infoTitle: "Clinic contact",
    emailLabel: "Email",
    phoneLabel: "Phone",
    addressLabel: "Address",
    hoursLabel: "Hours",
  },
  footer: {
    tagline: "Specialist ophthalmology for international patients.",
    navigation: "Navigation",
    contact: "Contact",
    legal: "Legal",
    disclaimer:
      "This website is a design preview. Medical content uses placeholders and does not constitute medical advice.",
    demoBy: "Design preview by Araaye",
  },
  admin: {
    previewBanner:
      "CMS Preview — for demonstration only. Not a secure production admin panel. Content is stored in your browser (localStorage).",
    title: "Article management",
    subtitle: "Create, edit, and publish articles in English and Russian.",
    backToSite: "View public site",
    articles: "All articles",
    newArticle: "New article",
    editArticle: "Edit article",
    deleteConfirm: "Delete this article? This cannot be undone.",
    saveDraft: "Save as draft",
    publish: "Publish",
    preview: "Preview",
    status: "Status",
    draft: "Draft",
    published: "Published",
    titleEn: "Title (English)",
    titleRu: "Title (Russian)",
    excerptEn: "Excerpt (English)",
    excerptRu: "Excerpt (Russian)",
    contentEn: "Content (English)",
    contentRu: "Content (Russian)",
    coverUrl: "Cover image URL",
    author: "Author",
    category: "Category",
    publishDate: "Publish date",
    slug: "URL slug",
    actions: "Actions",
    noArticles: "No articles yet. Create your first article to get started.",
    languageCoverage: "Languages",
    bothLanguages: "EN + RU",
    enOnly: "EN only",
    ruOnly: "RU only",
    saved: "Article saved.",
    deleted: "Article deleted.",
  },
  meta: {
    homeTitle: "Dr. Kordian — Ophthalmologist for International Patients",
    homeDescription:
      "Premium ophthalmology consultations for international patients. English and Russian support.",
    aboutTitle: "About Dr. Kordian — Ophthalmologist",
    aboutDescription: "Meet Dr. Kordian and learn about the clinic’s approach to international eye care.",
    treatmentsTitle: "Treatments & Services — Dr. Kordian",
    treatmentsDescription:
      "Comprehensive eye examinations, cataract consultations, retinal assessments, and vision correction consultations.",
    articlesTitle: "Articles — Dr. Kordian",
    articlesDescription: "Eye-health articles and patient guidance from Dr. Kordian’s clinic.",
    contactTitle: "Contact — Dr. Kordian",
    contactDescription: "Request a consultation or contact the clinic team.",
  },
};

const ru: KordianMessages = {
  nav: {
    home: "Главная",
    about: "О докторе Кардиане",
    treatments: "Услуги и лечение",
    articles: "Статьи",
    contact: "Контакты",
    requestConsultation: "Запросить консультацию",
    cmsPreview: "Превью CMS",
  },
  hero: {
    eyebrow: "Международная офтальмология",
    title: "Здоровое зрение начинается с внимательной специализированной помощи",
    subtitle:
      "Доктор Кардиан принимает международных пациентов для комплексных офтальмологических консультаций — на английском или русском языке.",
    ctaPrimary: "Запросить консультацию",
    ctaSecondary: "О докторе Кардиане",
    trustNote: "Данные клиники — заглушки. Подтверждённая информация будет добавлена перед запуском.",
  },
  sections: {
    introTitle: "Специалист, сосредоточенный на здоровье ваших глаз",
    introCta: "О докторе Кардиане",
    servicesTitle: "Офтальмологические услуги",
    servicesSubtitle: "Основные направления консультаций для международных пациентов.",
    journeyTitle: "Путь международного пациента",
    journeySubtitle: "Понятный маршрут от первого обращения до сопровождения после визита.",
    whyTitle: "Почему пациенты выбирают эту клинику",
    whySubtitle: "Создано для ясности, комфорта и организованной помощи за рубежом.",
    articlesTitle: "Последние статьи",
    articlesSubtitle: "Образовательные материалы, которыми управляет команда клиники.",
    viewAllArticles: "Все статьи",
    readArticle: "Читать статью",
    contactTitle: "Готовы записаться на консультацию?",
    contactSubtitle: "Отправьте запрос, и команда клиники предложит доступные варианты записи.",
    contactCta: "Контакты и запрос на приём",
  },
  about: {
    pageTitle: "О докторе Кардиане",
    pageDescription:
      "Узнайте о подходе доктора Кардиана к офтальмологии и помощи международным пациентам.",
    credentialsTitle: "Образование и подготовка",
    membershipsTitle: "Профессиональные ассоциации",
    approachTitle: "Подход к консультации",
  },
  treatments: {
    pageTitle: "Услуги и лечение",
    pageDescription:
      "Консультационные услуги для комплексного обследования зрения и специализированных оценок.",
    learnMore: "Запросить консультацию",
    bookConsultation: "Записаться на консультацию",
  },
  articles: {
    pageTitle: "Статьи",
    pageDescription: "Статьи о здоровье глаз, публикуемые и управляемые клиникой.",
    empty: "Опубликованных статей пока нет. Используйте превью CMS, чтобы опубликовать первую статью.",
    published: "Опубликовано",
    by: "Автор",
    backToArticles: "Назад к статьям",
    draftNotice: "Предпросмотр черновика — не отображается на сайте до публикации.",
  },
  contact: {
    pageTitle: "Контакты и запрос на приём",
    pageDescription: "Свяжитесь с командой клиники, чтобы запросить консультацию или задать вопрос.",
    formTitle: "Отправить запрос на консультацию",
    name: "Полное имя",
    email: "Электронная почта",
    phone: "Телефон (необязательно)",
    preferredLanguage: "Предпочитаемый язык",
    message: "Чем мы можем помочь?",
    travelDates: "Планируемые даты поездки (необязательно)",
    submit: "Отправить запрос",
    submitting: "Отправка…",
    success: "Спасибо — ваш запрос сохранён в этом демо. Команда клиники свяжется с вами.",
    error: "Что-то пошло не так. Пожалуйста, попробуйте снова.",
    infoTitle: "Контакты клиники",
    emailLabel: "Email",
    phoneLabel: "Телефон",
    addressLabel: "Адрес",
    hoursLabel: "Часы работы",
  },
  footer: {
    tagline: "Специализированная офтальмология для международных пациентов.",
    navigation: "Навигация",
    contact: "Контакты",
    legal: "Правовая информация",
    disclaimer:
      "Этот сайт — дизайн-превью. Медицинский контент содержит заглушки и не является медицинской консультацией.",
    demoBy: "Дизайн-превью от Araaye",
  },
  admin: {
    previewBanner:
      "Превью CMS — только для демонстрации. Не является защищённой админ-панелью. Контент хранится в браузере (localStorage).",
    title: "Управление статьями",
    subtitle: "Создавайте, редактируйте и публикуйте статьи на английском и русском.",
    backToSite: "Открыть публичный сайт",
    articles: "Все статьи",
    newArticle: "Новая статья",
    editArticle: "Редактировать статью",
    deleteConfirm: "Удалить эту статью? Это действие необратимо.",
    saveDraft: "Сохранить черновик",
    publish: "Опубликовать",
    preview: "Предпросмотр",
    status: "Статус",
    draft: "Черновик",
    published: "Опубликовано",
    titleEn: "Заголовок (английский)",
    titleRu: "Заголовок (русский)",
    excerptEn: "Краткое описание (английский)",
    excerptRu: "Краткое описание (русский)",
    contentEn: "Содержание (английский)",
    contentRu: "Содержание (русский)",
    coverUrl: "URL обложки",
    author: "Автор",
    category: "Категория",
    publishDate: "Дата публикации",
    slug: "URL-slug",
    actions: "Действия",
    noArticles: "Статей пока нет. Создайте первую статью.",
    languageCoverage: "Языки",
    bothLanguages: "EN + RU",
    enOnly: "Только EN",
    ruOnly: "Только RU",
    saved: "Статья сохранена.",
    deleted: "Статья удалена.",
  },
  meta: {
    homeTitle: "Доктор Кардиан — офтальмолог для международных пациентов",
    homeDescription:
      "Премиальные офтальмологические консультации для международных пациентов. Поддержка на английском и русском.",
    aboutTitle: "О докторе Кардиане — офтальмолог",
    aboutDescription: "Познакомьтесь с доктором Кардианом и подходом клиники к международной офтальмологии.",
    treatmentsTitle: "Услуги и лечение — доктор Кардиан",
    treatmentsDescription:
      "Комплексное обследование зрения, консультации по катаракте, обследование сетчатки и коррекция зрения.",
    articlesTitle: "Статьи — доктор Кардиан",
    articlesDescription: "Статьи о здоровье глаз и рекомендации от клиники доктора Кардиана.",
    contactTitle: "Контакты — доктор Кардиан",
    contactDescription: "Запросите консультацию или свяжитесь с командой клиники.",
  },
};

const messages: Record<KordianLocale, KordianMessages> = { en, ru };

export function getKordianMessages(locale: KordianLocale): KordianMessages {
  return messages[locale];
}

export function t(localized: LocalizedString, locale: KordianLocale): string {
  return localized[locale];
}
