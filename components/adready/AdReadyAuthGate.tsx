"use client";

import { useEffect } from "react";
import { checkAdReadyAuth } from "@/lib/adreadyAuthClient";
import { resolveAdReadyAuthRedirect, type AdReadyAuthMode } from "@/lib/adreadyAuth";
import AdReadyAuthForm from "./AdReadyAuthForm";

type AdReadyAuthGateProps = {
  initialMode: AdReadyAuthMode;
  nextPath: string | null;
};

export default function AdReadyAuthGate({ initialMode, nextPath }: AdReadyAuthGateProps) {
  useEffect(() => {
    let cancelled = false;

    checkAdReadyAuth()
      .then((session) => {
        if (cancelled || !session.authed) return;
        window.location.replace(resolveAdReadyAuthRedirect(initialMode, nextPath));
      })
      .catch(() => {
        /* show form */
      });

    return () => {
      cancelled = true;
    };
  }, [initialMode, nextPath]);

  return <AdReadyAuthForm initialMode={initialMode} nextPath={nextPath} />;
}
