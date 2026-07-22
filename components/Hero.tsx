import HeroActions from "./home/HeroActions";
import HeroProductFlow from "./home/HeroProductFlow";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#faf8f5] pt-28 pb-0 sm:pt-32 lg:pt-36">
      <div className="relative mx-auto max-w-[1280px] px-5 pb-10 text-center sm:px-8 lg:px-12 lg:pb-14">
        <p className="mb-4 text-sm font-bold tracking-wide text-teal-700">
          طراحی و رشد محصولات دیجیتال
        </p>
        <h1 className="mx-auto max-w-4xl text-[1.85rem] font-extrabold leading-[1.3] tracking-tight text-navy-900 sm:text-5xl lg:text-[3.1rem]">
          از ایده تا یک حضور دیجیتال که واقعاً کار می‌کند
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-navy-500 sm:text-lg">
          سایت، سئو، نرم‌افزار و هوش مصنوعی را متناسب با مسیر کسب‌وکارتان کنار هم می‌گذاریم؛
          تا بهتر دیده شوید، مشتری بیشتری جذب کنید و کارها را ساده‌تر پیش ببرید.
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
