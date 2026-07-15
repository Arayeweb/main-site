import { resolvePublicOrigin } from "@/lib/siteUrl";

function siteUrl(): string {
  return resolvePublicOrigin();
}

/** Zibal browser callbacks — phase 2 routes through payment.araaye.com when enabled. */
export function getPaymentCallbackUrl(
  product:
    | "ai"
    | "content-sales"
    | "seo"
    | "doctors"
    | "googlesabt"
    | "telegram"
    | "fastweb"
    | "adready",
  vercelPath: string
): string {
  const paymentBase = process.env.PAYMENT_SERVICE_URL?.replace(/\/$/, "");
  if (paymentBase && process.env.PAYMENT_CALLBACKS_ENABLED === "true") {
    return `${paymentBase}/callback/${product}`;
  }
  return `${siteUrl()}${vercelPath}`;
}

export { siteUrl as paymentSiteUrl };
