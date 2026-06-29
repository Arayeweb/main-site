import type { Metadata } from "next";
import "./ai.css";

export const metadata: Metadata = {
  title: "اتاق فکر هوشمند | آرایه",
  description:
    "یک سؤال بپرس؛ چند هوش مصنوعی با هم فکر کنند و جواب بهتر بدهند.",
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return <div className="ai-root">{children}</div>;
}
