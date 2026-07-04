import { clientLogos } from "@/lib/homeData";

export default function ClientLogos() {
  return (
    <section aria-label="مشتریان آرایه" className="border-y border-navy-100 bg-white py-8">
      <div className="container-mx container-px">
        <p className="mb-5 text-center text-xs font-medium text-navy-400">
          مورد اعتماد کسب‌وکارها و محصولات دیجیتال
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
          {clientLogos.map((client) => (
            <li key={client.name}>
              {client.url ? (
                <a
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-navy-300 transition-colors hover:text-navy-700 sm:text-base"
                >
                  {client.name}
                </a>
              ) : (
                <span className="text-sm font-bold text-navy-300 sm:text-base">{client.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
