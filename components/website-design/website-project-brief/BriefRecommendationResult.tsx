"use client";

import { useMemo } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  MapPin,
  TrendingUp,
  Megaphone,
  MessageCircle,
  Users,
  Check,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { IconCheck } from "@/components/icons";
import { getRecommendationPresentation } from "@/lib/websiteBrief/recommendationPresentation";
import { recommendedServiceLabels } from "@/lib/websiteBrief/constants";
import type { RecommendedService } from "@/lib/websiteBrief/types";
import type { SubmitResult } from "./briefFormUtils";

const SERVICE_ICONS: Record<Exclude<RecommendedService, "none">, React.ElementType> = {
  maps: MapPin,
  seo: TrendingUp,
  adready: Megaphone,
  chatbot: MessageCircle,
  lead_management: Users,
};

const SERVICE_GLOW: Record<Exclude<RecommendedService, "none">, string> = {
  maps: "from-emerald-500/20 via-teal-400/10 to-transparent",
  seo: "from-violet-500/20 via-indigo-400/10 to-transparent",
  adready: "from-orange-500/20 via-amber-400/10 to-transparent",
  chatbot: "from-cyan-500/20 via-sky-400/10 to-transparent",
  lead_management: "from-rose-500/20 via-pink-400/10 to-transparent",
};

type Props = {
  result: SubmitResult;
  interestChoice: boolean | null;
  interestSaving: boolean;
  interestMessage: string | null;
  onAccept: () => void;
  onDecline: () => void;
};

const easePremium = [0.22, 1, 0.36, 1] as const;

const stagger: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.1, duration: 0.45, ease: easePremium },
  }),
};

export default function BriefRecommendationResult({
  result,
  interestChoice,
  interestSaving,
  interestMessage,
  onAccept,
  onDecline,
}: Props) {
  const reduceMotion = useReducedMotion();
  const service = result.recommendedService as RecommendedService;
  const hasRecommendation = service !== "none";
  const serviceLabel =
    result.serviceLabel || recommendedServiceLabels[service] || result.recommendedService;

  const presentation = useMemo(
    () => getRecommendationPresentation(service, result.recommendationMessage, serviceLabel),
    [service, result.recommendationMessage, serviceLabel]
  );

  const ServiceIcon = hasRecommendation ? SERVICE_ICONS[service] : Sparkles;
  const glow = hasRecommendation ? SERVICE_GLOW[service] : "from-teal-500/15 to-transparent";

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:py-10" dir="rtl">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: easePremium }}
        className="relative overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-lg shadow-navy-900/5"
      >
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${glow}`} />

        <div className="relative p-6 sm:p-8">
          {/* Success strip */}
          <motion.div
            custom={0}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            variants={stagger}
            className="mb-6 flex items-start gap-3"
          >
            <motion.div
              initial={reduceMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 ring-4 ring-teal-50/80"
            >
              <IconCheck className="h-5 w-5" />
            </motion.div>
            <div>
              <p className="text-xs font-medium text-teal-700">ثبت موفق</p>
              <h1 className="text-lg font-bold text-navy-900 sm:text-xl">اطلاعات شما با موفقیت ثبت شد</h1>
            </div>
          </motion.div>

          {hasRecommendation ? (
            <>
              <motion.span
                custom={1}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                variants={stagger}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-3 py-1 text-[11px] font-medium text-white"
              >
                <Sparkles className="h-3 w-3" />
                {presentation.badge}
              </motion.span>

              <motion.div
                custom={2}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                variants={stagger}
                className="mt-4 flex items-start gap-3 rounded-xl border border-navy-100 bg-navy-50/40 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
                  <ServiceIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-navy-500">پیشنهاد مکمل</p>
                  <p className="text-base font-bold text-navy-900">{serviceLabel}</p>
                  <p className="mt-2 text-sm font-semibold leading-7 text-navy-800">{presentation.headline}</p>
                </div>
              </motion.div>

              <motion.p
                custom={3}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                variants={stagger}
                className="mt-4 text-sm leading-7 text-navy-600"
              >
                {presentation.reason}
              </motion.p>

              <motion.ul
                custom={4}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                variants={stagger}
                className="mt-5 space-y-2.5"
              >
                {presentation.benefits.map((benefit, i) => (
                  <motion.li
                    key={benefit}
                    initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.08, duration: 0.35 }}
                    className="flex items-start gap-2.5 text-sm text-navy-700"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                custom={5}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                variants={stagger}
                className="mt-5 rounded-xl border border-amber-200/80 bg-gradient-to-l from-amber-50 to-orange-50/50 p-4"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-sm leading-7 text-amber-950/90">{presentation.fomo}</p>
                </div>
              </motion.div>

              <motion.p
                custom={6}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                variants={stagger}
                className="mt-4 text-sm font-medium leading-7 text-teal-800"
              >
                {presentation.gain}
              </motion.p>

              {interestChoice === null ? (
                <motion.div
                  custom={7}
                  initial={reduceMotion ? false : "hidden"}
                  animate="show"
                  variants={stagger}
                  className="mt-6 flex flex-col gap-3"
                >
                  <motion.button
                    type="button"
                    disabled={interestSaving}
                    onClick={onAccept}
                    whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                    animate={
                      reduceMotion || interestSaving
                        ? undefined
                        : {
                            boxShadow: [
                              "0 0 0 0 rgba(20, 184, 166, 0)",
                              "0 0 0 6px rgba(20, 184, 166, 0.12)",
                              "0 0 0 0 rgba(20, 184, 166, 0)",
                            ],
                          }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                    }
                    className="btn-primary relative w-full py-3.5 text-sm font-semibold disabled:opacity-60"
                  >
                    {interestSaving ? "در حال ثبت..." : presentation.ctaPrimary}
                  </motion.button>
                  <button
                    type="button"
                    disabled={interestSaving}
                    onClick={onDecline}
                    className="w-full rounded-xl border border-navy-100 bg-white py-3 text-sm text-navy-500 transition hover:border-navy-200 hover:text-navy-700 disabled:opacity-60"
                  >
                    {presentation.ctaSecondary}
                  </button>
                  <p className="text-center text-[11px] text-navy-400">
                    انتخاب شما فقط جهت‌دهی پیشنهاد است — هنوز هیچ تعهدی ایجاد نمی‌شود.
                  </p>
                </motion.div>
              ) : null}
            </>
          ) : (
            <>
              <motion.p
                custom={2}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                variants={stagger}
                className="text-sm leading-7 text-navy-600"
              >
                {presentation.reason}
              </motion.p>
              <motion.ul
                custom={3}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
                variants={stagger}
                className="mt-4 space-y-2"
              >
                {presentation.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-navy-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    {b}
                  </li>
                ))}
              </motion.ul>
            </>
          )}

          {interestMessage ? (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-lg bg-teal-50 px-4 py-3 text-sm leading-7 text-teal-800"
              role="status"
            >
              {interestMessage}
            </motion.p>
          ) : null}

          {interestChoice !== null && !interestMessage ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-5 text-sm text-teal-700"
              role="status"
            >
              {interestChoice ? presentation.acceptedMessage : presentation.declinedMessage}
            </motion.p>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
