import type { Metadata } from "next";
import FastWebTemplateGallery from "@/components/fastweb/FastWebTemplateGallery";

export const metadata: Metadata = {
  title: "گالری تمپلیت‌های سایت فوری | آرایه",
  robots: { index: false, follow: false },
};

export default function FastWebTemplatesPage() {
  return <FastWebTemplateGallery />;
}
