import ModaresLeadForm from "@/components/modares/ModaresLeadForm";
import type { ModaresVariant } from "@/lib/modaresData";

type ModaresFinalFormProps = {
  variant: ModaresVariant;
};

export default function ModaresFinalForm({ variant }: ModaresFinalFormProps) {
  return (
    <section className="border-t border-navy-100 bg-navy-50/40 py-10 sm:py-12">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-lg font-extrabold text-navy-900 sm:text-xl">
            نمونه مناسب حوزه تدریس‌تان را دریافت کنید
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-navy-500 sm:text-sm">
            حوزه تدریس و شماره‌تان را ثبت کنید؛ نمونه مرتبط و پیشنهاد اجرایی از طریق واتساپ
            ارسال می‌شود.
          </p>
        </div>

        <div className="mx-auto mt-5 max-w-lg sm:mt-6">
          <ModaresLeadForm
            variant={variant}
            anchorId="modares-lead-form-final"
            fieldId="modares-field-final"
            phoneId="modares-phone-final"
            source="modares_final"
          />
        </div>
      </div>
    </section>
  );
}
