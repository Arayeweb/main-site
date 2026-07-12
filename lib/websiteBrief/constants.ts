import type {
  AcquisitionChannel,
  AdvertisingStatus,
  BookingType,
  ConfirmationBranch,
  ContentReadiness,
  CurrentAsset,
  CustomerGuidanceNeed,
  CustomerScope,
  EstimatedProductCount,
  GoogleLeadStatus,
  GoogleMapsStatus,
  LeadFollowupStatus,
  PrimaryBusinessProblem,
  PrimaryConversionGoal,
  RecommendedService,
  RequiredSection,
} from "./types";

export type SelectOption<T extends string = string> = { value: T; label: string; hint?: string };

export const customerScopeOptions: SelectOption<CustomerScope>[] = [
  { value: "local_city", label: "یک شهر یا محدوده مشخص" },
  { value: "multiple_cities", label: "چند شهر مختلف" },
  { value: "nationwide", label: "سراسر ایران" },
  { value: "business_to_business", label: "مشتریان ما بیشتر شرکت‌ها و کسب‌وکارها هستند" },
  { value: "fully_online", label: "کسب‌وکار ما کاملاً آنلاین و بدون محدوده جغرافیایی است" },
  { value: "unsure", label: "مطمئن نیستم" },
];

export const primaryConversionGoalOptions: SelectOption<PrimaryConversionGoal>[] = [
  { value: "phone_call", label: "تماس تلفنی بگیرد" },
  { value: "whatsapp_message", label: "در واتساپ پیام بدهد" },
  { value: "appointment_booking", label: "نوبت رزرو کند" },
  { value: "consultation_request", label: "درخواست مشاوره ثبت کند" },
  { value: "quote_request", label: "قیمت یا پیش‌فاکتور بگیرد" },
  { value: "online_purchase", label: "محصول خریداری کند" },
  { value: "portfolio_project_request", label: "نمونه‌کارها را ببیند و درخواست همکاری بدهد" },
  { value: "business_introduction", label: "فقط با کسب‌وکار و خدمات ما آشنا شود" },
  { value: "needs_araaye_advice", label: "مطمئن نیستم و پیشنهاد آرایه را می‌خواهم" },
];

export const requiredSectionOptions: SelectOption<RequiredSection>[] = [
  { value: "company_and_services", label: "معرفی مجموعه و خدمات" },
  { value: "separate_service_pages", label: "صفحه جداگانه برای خدمات یا محصولات اصلی" },
  { value: "contact_consultation_form", label: "فرم تماس یا درخواست مشاوره" },
  { value: "quick_call_whatsapp", label: "تماس و واتساپ سریع" },
  { value: "appointment_booking", label: "رزرو نوبت" },
  { value: "quote_request", label: "استعلام قیمت" },
  { value: "ecommerce_payment", label: "فروشگاه و پرداخت آنلاین" },
  { value: "portfolio", label: "نمایش نمونه‌کارها" },
  { value: "blog", label: "مقالات و محتوای آموزشی" },
  { value: "team", label: "معرفی اعضای تیم" },
  { value: "multilingual", label: "سایت چندزبانه" },
  { value: "needs_araaye_advice", label: "مطمئن نیستم و پیشنهاد آرایه را می‌خواهم" },
];

export const bookingTypeOptions: SelectOption<BookingType>[] = [
  { value: "request_only", label: "فقط ثبت درخواست تماس" },
  { value: "day_selection", label: "انتخاب روز" },
  { value: "day_and_time", label: "انتخاب روز و ساعت" },
  { value: "time_and_deposit", label: "انتخاب زمان همراه با پرداخت بیعانه" },
  { value: "unknown", label: "هنوز مشخص نیست" },
];

export const estimatedProductCountOptions: SelectOption<EstimatedProductCount>[] = [
  { value: "under_20", label: "کمتر از ۲۰ محصول" },
  { value: "20_to_100", label: "بین ۲۰ تا ۱۰۰ محصول" },
  { value: "over_100", label: "بیشتر از ۱۰۰ محصول" },
  { value: "unknown", label: "هنوز مشخص نیست" },
];

export const acquisitionChannelOptions: SelectOption<AcquisitionChannel>[] = [
  { value: "google_search", label: "جست‌وجوی گوگل" },
  { value: "google_maps", label: "Google Maps" },
  { value: "instagram", label: "اینستاگرام" },
  { value: "referrals", label: "معرفی دوستان و مشتریان قبلی" },
  { value: "online_advertising", label: "تبلیغات اینترنتی" },
  { value: "walk_in", label: "مراجعه حضوری" },
  { value: "messengers", label: "واتساپ یا تلگرام" },
  { value: "business_partnerships", label: "همکاری با شرکت‌ها یا همکاران" },
  { value: "no_consistent_channel", label: "فعلاً مسیر ثابت و مشخصی نداریم" },
];

export const currentAssetOptions: SelectOption<CurrentAsset>[] = [
  { value: "active_website", label: "سایت فعال" },
  { value: "domain", label: "دامنه اینترنتی" },
  { value: "active_instagram", label: "صفحه اینستاگرام فعال" },
  { value: "business_whatsapp", label: "واتساپ کاری" },
  { value: "google_maps_listing", label: "کسب‌وکار ثبت‌شده در Google Maps" },
  { value: "local_maps_listing", label: "ثبت کسب‌وکار در نشان یا بلد" },
  { value: "brand_identity", label: "لوگو و هویت بصری" },
  { value: "website_content", label: "متن و تصاویر آماده برای سایت" },
  { value: "lead_management_system", label: "سیستم ثبت و پیگیری مشتریان" },
  { value: "none", label: "هیچ‌کدام" },
  { value: "unsure", label: "از بعضی موارد مطمئن نیستم" },
];

export const primaryBusinessProblemOptions: SelectOption<PrimaryBusinessProblem>[] = [
  { value: "not_visible_in_search_and_maps", label: "مشتریان ما را در گوگل و نقشه‌ها به‌راحتی پیدا نمی‌کنند" },
  { value: "low_lead_volume", label: "تعداد تماس‌ها و درخواست‌های جدید کم است" },
  { value: "dependent_on_instagram_and_referrals", label: "بیشتر به اینستاگرام یا معرفی دیگران وابسته‌ایم" },
  { value: "poor_advertising_conversion", label: "برای تبلیغات هزینه می‌کنیم، اما تماس یا درخواست کافی نمی‌گیریم" },
  { value: "repetitive_questions", label: "پاسخ‌دادن به سؤال‌های تکراری مشتریان زمان زیادی می‌گیرد" },
  { value: "no_after_hours_response", label: "خارج از ساعات کاری نمی‌توانیم سریع پاسخ بدهیم" },
  { value: "scattered_leads", label: "درخواست‌ها بین تماس، واتساپ و اینستاگرام پراکنده می‌شوند" },
  { value: "forgotten_followups", label: "گاهی پیگیری بعضی مشتریان فراموش می‌شود" },
  { value: "only_need_professional_website", label: "مشکل مشخصی نداریم و فقط یک سایت حرفه‌ای می‌خواهیم" },
];

export const googleMapsStatusOptions: SelectOption<GoogleMapsStatus>[] = [
  { value: "complete", label: "کامل و صحیح ثبت شده است" },
  { value: "incomplete_or_outdated", label: "ثبت شده، اما اطلاعات آن ناقص یا قدیمی است" },
  { value: "not_registered", label: "هنوز ثبت نشده است" },
  { value: "unknown", label: "مطمئن نیستم" },
];

export const googleLeadStatusOptions: SelectOption<GoogleLeadStatus>[] = [
  { value: "regular", label: "بله، به‌صورت منظم" },
  { value: "sometimes", label: "گاهی" },
  { value: "very_low", label: "بسیار کم" },
  { value: "none", label: "اصلاً" },
  { value: "unknown", label: "مطمئن نیستم" },
];

export const advertisingStatusOptions: SelectOption<AdvertisingStatus>[] = [
  { value: "active", label: "در حال حاضر تبلیغ فعال داریم" },
  { value: "starting_soon", label: "به‌زودی تبلیغات را شروع می‌کنیم" },
  { value: "possible_in_future", label: "احتمالاً در چند ماه آینده تبلیغ می‌کنیم" },
  { value: "no_plan", label: "فعلاً قصد تبلیغ نداریم" },
];

export const customerGuidanceNeedOptions: SelectOption<CustomerGuidanceNeed>[] = [
  { value: "faq", label: "پاسخ به سؤال‌های تکراری" },
  { value: "service_selection", label: "معرفی خدمت مناسب" },
  { value: "price_and_conditions", label: "اطلاع از قیمت و شرایط" },
  { value: "booking_guidance", label: "راهنمایی برای رزرو یا ثبت درخواست" },
  { value: "mixed", label: "ترکیبی از موارد بالا" },
];

export const leadFollowupStatusOptions: SelectOption<LeadFollowupStatus>[] = [
  { value: "centralized_system", label: "در یک سیستم مشخص ثبت می‌شوند" },
  { value: "mostly_calls_and_whatsapp", label: "بیشتر داخل واتساپ و تماس پیگیری می‌شوند" },
  { value: "scattered", label: "بین چند نفر یا چند پیام‌رسان پخش می‌شوند" },
  { value: "no_process", label: "فرایند مشخصی نداریم" },
  { value: "unknown", label: "مطمئن نیستم" },
];

export const contentReadinessOptions: SelectOption<ContentReadiness>[] = [
  { value: "fully_ready", label: "لوگو، متن و تصاویر اصلی آماده‌اند" },
  { value: "partially_ready", label: "بخشی از محتوا آماده است" },
  { value: "basic_info_and_logo", label: "فقط اطلاعات اولیه و لوگو را داریم" },
  { value: "not_ready", label: "هنوز محتوا و تصاویر آماده نیستند" },
  { value: "need_araaye_help", label: "در آماده‌سازی محتوای سایت به کمک آرایه نیاز داریم" },
];

export const recommendedServiceLabels: Record<RecommendedService, string> = {
  lead_management: "سیستم ثبت و پیگیری مشتریان",
  adready: "صفحه تبلیغاتی AdReady",
  maps: "ثبت و بهینه‌سازی نقشه‌ها",
  chatbot: "چت‌بات و پاسخ‌گویی هوشمند",
  seo: "سئوی سایت",
  none: "بدون پیشنهاد مکمل",
};

export const briefStatusLabels: Record<string, string> = {
  new: "جدید",
  contacted: "تماس گرفته شد",
  proposal_preparing: "در حال آماده‌سازی پیشنهاد",
  proposal_sent: "پیشنهاد ارسال شد",
  won: "برنده",
  lost: "از دست رفته",
};

export const confirmationBranchLabels: Record<ConfirmationBranch, string> = {
  maps_presence: "وضعیت Google Maps",
  google_leads: "ورودی از گوگل",
  advertising: "وضعیت تبلیغات",
  customer_guidance: "نیاز راهنمایی مشتری",
  lead_followup: "پیگیری مشتریان",
};

export const CONVERSION_GOALS_FOR_LEAD_CAPTURE: PrimaryConversionGoal[] = [
  "phone_call",
  "whatsapp_message",
  "appointment_booking",
  "consultation_request",
  "quote_request",
  "online_purchase",
  "portfolio_project_request",
];

export const CONVERSION_GOALS_FOR_MAPS: PrimaryConversionGoal[] = [
  "phone_call",
  "whatsapp_message",
  "appointment_booking",
  "consultation_request",
  "quote_request",
];

export const LEAD_CAPTURE_SECTIONS: RequiredSection[] = [
  "contact_consultation_form",
  "appointment_booking",
  "quote_request",
  "ecommerce_payment",
  "quick_call_whatsapp",
];

export const LOCAL_SCOPES: CustomerScope[] = ["local_city", "multiple_cities"];

export const MAX_REQUIRED_SECTIONS = 5;
