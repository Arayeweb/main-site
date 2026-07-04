import type { Metadata, Viewport } from "next";
import "./content-sales.css";

export const metadata: Metadata = {
  title: "Content & Sales Bundle | Araaye AI",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function ContentSalesLayout({ children }: { children: React.ReactNode }) {
  return <div className="cs-root">{children}</div>;
}
