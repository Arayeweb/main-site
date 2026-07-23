import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "مرکز رشد آرایه",
    template: "%s | مرکز رشد آرایه",
  },
  robots: { index: false, follow: false },
};

// Client portal root. Public marketing chrome is suppressed for /app via
// PublicOnlyChrome. Auth + tenancy are enforced in nested layouts/helpers.
export default function GrowthHubPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
