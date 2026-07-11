import ChatOpenButton from "./ChatOpenButton";

export default function HeroActions() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ChatOpenButton
        location="hero"
        className="inline-flex items-center justify-center rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-800 active:scale-[0.98]"
      >
        درخواست مشاوره رایگان
      </ChatOpenButton>
      <a
        href="#real-portfolio"
        className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-3 text-sm font-semibold text-navy-800 transition-colors hover:border-navy-300 hover:bg-navy-50 active:scale-[0.98]"
      >
        مشاهده نمونه‌کارها
      </a>
    </div>
  );
}
