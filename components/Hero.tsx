import HeroActions from "./home/HeroActions";
import HeroProductFlow from "./home/HeroProductFlow";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#faf8f5] pt-28 pb-0 sm:pt-32 lg:pt-36">
      <div className="relative mx-auto max-w-[1280px] px-5 pb-10 text-center sm:px-8 lg:px-12 lg:pb-14">
        <h1 className="mx-auto max-w-3xl text-[2rem] font-extrabold leading-[1.25] tracking-tight text-navy-900 sm:text-5xl lg:text-[3.35rem]">
          <span className="block">در گوگل دیده شوید؛</span>
          <span className="mt-1 block">بازدیدکننده‌ها را به مشتری تبدیل کنید.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-navy-500 sm:text-lg">
          آرایه کمک می‌کند کسب‌وکارتان در گوگل پیدا شود و کسانی که وارد صفحه‌تان می‌شوند،
          برای خرید، مشاوره یا رزرو با شما تماس بگیرند.
        </p>

        <div className="mt-8">
          <HeroActions />
        </div>
      </div>

      <div className="relative animate-fade-up pb-16 sm:pb-20 lg:pb-24">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
        <HeroProductFlow />
      </div>
    </section>
  );
}
