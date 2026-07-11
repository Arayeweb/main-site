"use client";

import { pushGtmEvent } from "@/lib/gtm";
import { openSiteChat } from "@/lib/openSiteChat";

export default function ChatOpenButton({
  className,
  children,
  location,
}: {
  className?: string;
  children: React.ReactNode;
  location: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        pushGtmEvent("cta_click", { location });
        openSiteChat(location);
      }}
    >
      {children}
    </button>
  );
}
