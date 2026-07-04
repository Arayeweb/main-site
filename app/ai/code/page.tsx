import { Suspense } from "react";
import { ArenaPageSkeleton } from "../ArenaSkeleton";
import CodeStudioPageInner from "./CodeStudioPageInner";

export default function CodeStudioPage() {
  return (
    <Suspense fallback={<ArenaPageSkeleton label="در حال بارگذاری استودیو کد" />}>
      <CodeStudioPageInner />
    </Suspense>
  );
}
