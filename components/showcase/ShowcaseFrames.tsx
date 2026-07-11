import type { ReactNode } from "react";

export function BrowserChrome({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-[0_16px_48px_rgba(16,42,67,0.10)]">
      <div className="flex items-center gap-1.5 border-b border-navy-100/80 bg-[#f4f6f8] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="mr-auto truncate text-[11px] font-medium text-navy-400">{url}</span>
      </div>
      {children}
    </div>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="rounded-[2rem] border-[6px] border-navy-900 bg-navy-900 p-1.5 shadow-[0_20px_50px_rgba(16,42,67,0.18)]">
        <div className="overflow-hidden rounded-[1.4rem] bg-white">{children}</div>
      </div>
    </div>
  );
}
