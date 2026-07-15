"use client";

import { useState } from "react";
import { MODARES_DEMO_TABS, type ModaresDemoTabId } from "@/lib/modaresData";
import { scrollToModaresForm } from "@/lib/modaresScroll";
import { modaresAnalyticsBase, trackModaresEvent } from "@/lib/modaresAnalytics";
import type { ModaresVariant } from "@/lib/modaresData";
import ModaresDemoPreview from "@/components/modares/ModaresDemoPreview";

type ModaresInteractiveDemoProps = {
  variant: ModaresVariant;
};

export default function ModaresInteractiveDemo({ variant }: ModaresInteractiveDemoProps) {
  const [activeId, setActiveId] = useState<ModaresDemoTabId>("language");
  const activeTab = MODARES_DEMO_TABS.find((tab) => tab.id === activeId) ?? MODARES_DEMO_TABS[0];
  const analyticsBase = modaresAnalyticsBase(variant);

  const handleTabChange = (tabId: ModaresDemoTabId) => {
    setActiveId(tabId);
    trackModaresEvent("teachers_demo_tab_change", {
      ...analyticsBase,
      demo_tab: tabId,
    });
  };

  return (
    <section className="border-t border-navy-100 bg-navy-50/40 py-10 sm:py-12">
      <div className="container-mx container-px">
        <h2 className="text-center text-lg font-extrabold text-navy-900 sm:text-xl">
          نمونه سایت متناسب با نوع تدریس شما
        </h2>

        <div
          className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-6"
          role="tablist"
          aria-label="نوع تدریس"
        >
          {MODARES_DEMO_TABS.map((tab) => {
            const isActive = tab.id === activeId;
            const tabPanelId = `modares-demo-panel-${tab.id}`;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`modares-demo-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={tabPanelId}
                onClick={() => handleTabChange(tab.id)}
                className={`min-h-[44px] rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:text-sm ${
                  isActive
                    ? "border-cyan-600 bg-cyan-600 text-white"
                    : "border-navy-100 bg-white text-navy-600 hover:border-navy-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={`modares-demo-panel-${activeId}`}
          role="tabpanel"
          aria-labelledby={`modares-demo-tab-${activeId}`}
          className="mx-auto mt-5 max-w-lg sm:mt-6"
        >
          <ModaresDemoPreview tab={activeTab} />
        </div>

        <div className="mt-5 text-center sm:mt-6">
          <button
            type="button"
            onClick={scrollToModaresForm}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-cyan-600 bg-white px-5 py-2.5 text-sm font-bold text-cyan-700 transition-colors hover:bg-cyan-50 active:scale-[0.98]"
          >
            نمونه مرتبط با تدریس من را بفرستید
          </button>
        </div>
      </div>
    </section>
  );
}
