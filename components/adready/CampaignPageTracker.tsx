"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  formStartDedupKey,
  pageViewDedupKey,
  sendCampaignEvent,
  shouldFireOncePerSession,
  type CampaignTrackingCallbacks,
} from "@/lib/adreadyTracking";

const CampaignTrackingContext = createContext<CampaignTrackingCallbacks | null>(
  null
);

export function useCampaignTracking(): CampaignTrackingCallbacks | null {
  return useContext(CampaignTrackingContext);
}

type CampaignPageTrackerProps = {
  slug: string;
  campaignPageId: string;
  children: ReactNode;
};

export default function CampaignPageTracker({
  slug,
  campaignPageId,
  children,
}: CampaignPageTrackerProps) {
  const onCtaClick = useCallback(
    (location: string) => {
      void sendCampaignEvent(slug, "campaign_cta_click", {
        campaignPageId,
        payload: { location },
      });
    },
    [slug, campaignPageId]
  );

  const onWhatsappClick = useCallback(() => {
    void sendCampaignEvent(slug, "campaign_whatsapp_click", { campaignPageId });
  }, [slug, campaignPageId]);

  const onTelegramClick = useCallback(() => {
    void sendCampaignEvent(slug, "campaign_telegram_click", { campaignPageId });
  }, [slug, campaignPageId]);

  const onCallClick = useCallback(() => {
    void sendCampaignEvent(slug, "campaign_call_click", { campaignPageId });
  }, [slug, campaignPageId]);

  const onFormStart = useCallback(() => {
    if (!shouldFireOncePerSession(formStartDedupKey(slug))) return;
    void sendCampaignEvent(slug, "campaign_form_start", { campaignPageId });
  }, [slug, campaignPageId]);

  useEffect(() => {
    if (!shouldFireOncePerSession(pageViewDedupKey(slug))) return;
    void sendCampaignEvent(slug, "campaign_page_view", { campaignPageId });
  }, [slug, campaignPageId]);

  const value = useMemo(
    () => ({
      onCtaClick,
      onWhatsappClick,
      onTelegramClick,
      onCallClick,
      onFormStart,
    }),
    [onCtaClick, onWhatsappClick, onTelegramClick, onCallClick, onFormStart]
  );

  return (
    <CampaignTrackingContext.Provider value={value}>
      {children}
    </CampaignTrackingContext.Provider>
  );
}
