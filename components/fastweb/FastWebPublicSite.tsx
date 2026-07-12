"use client";

import { useEffect } from "react";
import FastWebSiteView from "@/components/fastweb/FastWebSiteView";
import { getUtmParams } from "@/lib/utm";
import { recordPageview } from "@/lib/pageviewTracking";
import type { FastWebBrief, FastWebPreviewContent } from "@/lib/fastweb";

export default function FastWebPublicSite({
  slug,
  content,
  brief,
}: {
  slug: string;
  content: FastWebPreviewContent;
  brief: FastWebBrief;
}) {
  useEffect(() => {
    getUtmParams();
    recordPageview(`/s/${slug}`);
  }, [slug]);

  return (
    <FastWebSiteView
      content={content}
      brief={brief}
      mode="live"
      onLeadSubmit={async (payload) => {
        const utm = getUtmParams();
        const res = await fetch(`/api/fastweb/public/${slug}/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, ...utm }),
        });
        if (!res.ok) throw new Error("lead_failed");
      }}
    />
  );
}
