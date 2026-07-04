"use client";

export function ArenaChatSkeleton() {
  return (
    <div className="ar-skeleton-chat" aria-busy="true" aria-label="در حال بارگذاری گفتگو">
      <div className="ar-skeleton-line ar-skeleton-line--user" />
      <div className="ar-skeleton-line ar-skeleton-line--ai" />
      <div className="ar-skeleton-line ar-skeleton-line--ai short" />
    </div>
  );
}

export function ArenaPageSkeleton({ label = "در حال بارگذاری" }: { label?: string }) {
  return (
    <div className="ar-skeleton-page" aria-busy="true" aria-label={label}>
      <div className="ar-skeleton-block" />
      <div className="ar-skeleton-block sm" />
    </div>
  );
}

export default function AiRouteLoading() {
  return <ArenaPageSkeleton />;
}
