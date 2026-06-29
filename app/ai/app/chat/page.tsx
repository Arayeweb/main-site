"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ChatClient from "../c/[id]/ChatClient";

function NewChatInner() {
  const params = useSearchParams();
  const mode = (params.get("mode") as "quick" | "brainstorm" | "critique") || "quick";
  return <ChatClient initialMode={mode} />;
}

export default function NewChatPage() {
  return (
    <Suspense fallback={<div className="ai-chat-shell" />}>
      <NewChatInner />
    </Suspense>
  );
}
