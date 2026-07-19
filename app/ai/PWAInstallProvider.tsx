"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import PWAInstallSheet from "./PWAInstallSheet";
import {
  canAutoShowInstallSheet,
  canShowSidebarInstall,
  getDeferredInstallPrompt,
  isIosSafari,
  isStandalonePwa,
  markSheetAutoShown,
  onPwaMilestone,
  onPwaOpenSheet,
  recordDismiss,
  setDeferredInstallPrompt,
  trackPwaEvent,
  type PwaInstallEntry,
} from "@/lib/ai/pwaInstall";

type PwaInstallContextValue = {
  eligible: boolean;
  isIos: boolean;
  openInstall: (entry?: PwaInstallEntry) => void;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function usePwaInstall(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    return {
      eligible: false,
      isIos: false,
      openInstall: () => {},
    };
  }
  return ctx;
}

export default function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [eligible, setEligible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState<PwaInstallEntry>("sheet");
  const [iosGuide, setIosGuide] = useState(false);

  const refreshEligible = useCallback(() => {
    setEligible(canShowSidebarInstall());
    setIsIos(isIosSafari() && !getDeferredInstallPrompt());
  }, []);

  const openInstall = useCallback(
    (nextEntry: PwaInstallEntry = "sheet") => {
      if (isStandalonePwa()) return;
      if (!canShowSidebarInstall() && nextEntry !== "sidebar") {
        // still allow if bip arrives late — refresh first
        refreshEligible();
      }
      const ios = isIosSafari() && !getDeferredInstallPrompt();
      setEntry(nextEntry);
      setIosGuide(ios);
      setOpen(true);
      trackPwaEvent("pwa_install_entry_viewed", {
        entry: nextEntry,
        mode: ios ? "ios_guide" : "android_prompt",
      });
      if (ios) trackPwaEvent("pwa_ios_guide_viewed", { entry: nextEntry });
    },
    [refreshEligible]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isStandalonePwa()) {
      trackPwaEvent("pwa_standalone_opened");
      setEligible(false);
      return;
    }

    refreshEligible();

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e as Parameters<typeof setDeferredInstallPrompt>[0]);
      refreshEligible();
      trackPwaEvent("pwa_install_eligible", { source: "beforeinstallprompt" });
    };

    const onInstalled = () => {
      trackPwaEvent("pwa_install_accepted", { source: "appinstalled" });
      setDeferredInstallPrompt(null);
      setEligible(false);
      setOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    if (isIosSafari()) {
      trackPwaEvent("pwa_install_eligible", { source: "ios_safari" });
    }

    const offMilestone = onPwaMilestone(() => {
      if (canAutoShowInstallSheet()) {
        markSheetAutoShown();
        openInstall("sheet");
      }
    });

    const offOpen = onPwaOpenSheet((e) => openInstall(e));

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
      offMilestone();
      offOpen();
    };
  }, [openInstall, refreshEligible]);

  function handleClose(reason: "dismiss" | "later" | "installed" | "done") {
    setOpen(false);
    if (reason === "dismiss" || reason === "later") {
      recordDismiss();
      trackPwaEvent("pwa_install_dismissed", {
        source: reason,
        entry,
        mode: iosGuide ? "ios_guide" : "android_prompt",
      });
    }
    if (reason === "done" && iosGuide) {
      trackPwaEvent("pwa_ios_guide_completed", { entry });
    }
    refreshEligible();
  }

  const value = useMemo(
    () => ({ eligible, isIos, openInstall }),
    [eligible, isIos, openInstall]
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
      {open && (
        <PWAInstallSheet
          iosGuide={iosGuide}
          entry={entry}
          onClose={handleClose}
        />
      )}
    </PwaInstallContext.Provider>
  );
}
