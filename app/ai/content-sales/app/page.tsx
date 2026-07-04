import { Suspense } from "react";
import ContentSalesApp from "@/components/content-sales/ContentSalesApp";

export default function ContentSalesAppPage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: "center" }}>...</div>}>
      <ContentSalesApp />
    </Suspense>
  );
}
