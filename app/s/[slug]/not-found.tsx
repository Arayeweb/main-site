export default function FastWebSiteNotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#F4F7F8] px-4"
      dir="rtl"
    >
      <h1 className="text-xl font-bold text-slate-900">سایت یافت نشد</h1>
      <p className="text-sm text-slate-600">این آدرس هنوز منتشر نشده یا وجود ندارد.</p>
      <a href="/fastweb" className="text-sm font-medium text-[#0F4C5C] underline">
        سایت فوری آرایه
      </a>
    </div>
  );
}
