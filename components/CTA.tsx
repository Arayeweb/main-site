import ChatOpenButton from "./home/ChatOpenButton";

export default function CTA() {
  return (
    <section
      id="cta"
      className="relative flex min-h-[350px] items-center overflow-hidden bg-navy-900"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src="/assets/logo-icon.svg"
          alt=""
          width={320}
          height={320}
          className="absolute left-1/2 top-1/2 h-[min(55vw,320px)] w-[min(55vw,320px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[900px] px-5 py-14 text-center sm:px-6">
        <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl">
          نقطه شروع مناسب برای کسب‌وکار شما کجاست؟
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
          کسب‌وکارتان را کوتاه معرفی کنید تا بر اساس هدف و شرایط فعلی، مسیر مناسب را مشخص
          کنیم.
        </p>
        <ChatOpenButton
          location="home_final_cta"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-brand-400 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-300 active:scale-[0.98]"
        >
          شروع گفت‌وگو با آرایه
        </ChatOpenButton>
      </div>
    </section>
  );
}
