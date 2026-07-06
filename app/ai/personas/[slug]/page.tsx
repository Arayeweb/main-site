import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase";
import { AI_COOKIE, verifyAIToken } from "@/lib/aiAuth";
import { getPersona } from "@/lib/aiPersonas";
import PersonaChatClient from "./PersonaChatClient";

export const dynamic = "force-dynamic";

type Props = {
  params: { slug: string };
  searchParams: { thread?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const persona = getPersona(params.slug);
  if (!persona) return { title: "شخصیت | آرایه AI" };
  const title = `چت با ${persona.nameFa} فارسی | آرایه AI`;
  const description = `${persona.taglineFa} — ثبت‌نام رایگان برای شروع گفتگو. ${persona.greetingFa.slice(0, 100)}`;
  return {
    title,
    description,
    keywords: [`چت با ${persona.nameFa}`, "شخصیت AI", "Character.ai فارسی", persona.nameFa],
    alternates: { canonical: `/ai/personas/${persona.id}` },
    openGraph: {
      title,
      description,
      url: `/ai/personas/${persona.id}`,
      locale: "fa_IR",
      type: "website",
    },
  };
}

export default async function PersonaChatPage({ params, searchParams }: Props) {
  const persona = getPersona(params.slug);
  if (!persona) notFound();

  const threadParam = searchParams.thread?.trim() || null;
  const cookieStore = cookies();
  const token = cookieStore.get(AI_COOKIE)?.value;
  const session = token ? verifyAIToken(token) : null;

  let plan = "free";
  let initialTurns: { id: string; prompt: string; response: string }[] = [];
  let threadId: string | null = threadParam;

  if (session) {
    const supabase = getSupabaseAdmin();

    const [userP, rowsP] = await Promise.all([
      supabase.from("ai_users").select("plan").eq("id", session.userId).maybeSingle(),
      threadParam
        ? supabase
            .from("ai_battles")
            .select("id, user_id, prompt, response_a, persona_key, tier, created_at, thread_id")
            .or(`id.eq.${threadParam},thread_id.eq.${threadParam}`)
            .order("created_at", { ascending: true })
            .limit(40)
        : Promise.resolve({ data: [] }),
    ]);

    plan = (userP.data?.plan as string) || "free";

    const mine = ((rowsP.data as unknown[]) || []).filter((r) => (r as { user_id: string }).user_id === session.userId);
    const personaRows = mine.filter(
      (r) =>
        ((r as { persona_key?: string | null }).persona_key as string | null) === persona.id ||
        (((r as { tier?: string }).tier as string) === "persona" &&
          !(r as { persona_key?: string | null }).persona_key)
    ) as typeof mine;

    if (personaRows.length === 0 && mine.length > 0) {
      redirect(`/ai/personas/${persona.id}`);
    }

    if (personaRows.length > 0) {
      const first = personaRows[0] as { thread_id?: string | null; id: string };
      threadId = first.thread_id || first.id;
      initialTurns = personaRows.map((r) => ({
        id: (r as { id: string }).id,
        prompt: (r as { prompt: string }).prompt,
        response: (r as { response_a: string }).response_a,
      }));
    }
  }

  return (
    <PersonaChatClient
      persona={persona}
      modelId={persona.defaultModelId}
      threadId={threadId}
      initialTurns={initialTurns}
      plan={plan}
      authed={!!session}
    />
  );
}
