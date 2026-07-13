import { kordianJsonLd } from "@/lib/showdemoto/dr-kordian/config";

export default function DrKordianRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(kordianJsonLd) }}
      />
      {children}
    </>
  );
}
