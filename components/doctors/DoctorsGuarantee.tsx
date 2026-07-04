import { IconShield } from "@/components/icons";

export default function DoctorsGuarantee() {
  return (
    <section className="pb-20 sm:pb-28">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-2xl rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-cyan-50/60 p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-glow">
            <IconShield size={26} />
          </div>
          <h2 className="text-lg font-extrabold text-sky-700 sm:text-xl">
            ضمانت ۱۰۰٪ بازگشت وجه
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-600">
            اگر تا ۷ روز از شروع کار از کیفیت راضی نبودید، کل مبلغ برمی‌گردد — بدون سؤال.
            دامنه هم به نام خودتان ثبت می‌شود و دارایی دیجیتال مطب همیشه متعلق به شماست.
          </p>
        </div>
      </div>
    </section>
  );
}
