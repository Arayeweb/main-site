import { CONTACT_ROUTING } from "@/lib/contactPageData";

export default function ContactRoutingVisual() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-3">
        {CONTACT_ROUTING.map((row) => (
          <div
            key={row.need}
            className="flex flex-col gap-2 rounded-[16px] border border-navy-100 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <p className="text-sm font-semibold text-navy-800">{row.need}</p>
            <div className="flex items-center gap-2 text-sm text-navy-500">
              <span aria-hidden="true" className="text-brand-500">
                ←
              </span>
              <span className="font-bold text-navy-700">{row.team}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
