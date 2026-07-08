"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { personaAvatarSrc, type AiPersona, type PersonaAvatarVariant } from "@/lib/aiPersonas";

const VARIANT_LAYOUT = {
  card: { width: 320, height: 400, sizes: "(min-width: 960px) 25vw, (min-width: 640px) 33vw, 50vw" },
  thumb: { width: 48, height: 48, sizes: "48px" },
  full: { width: 320, height: 400, sizes: "320px" },
} as const;

export default function PersonaImage({
  persona,
  variant = "card",
  priority = false,
  className = "",
  style,
}: {
  persona: Pick<AiPersona, "id" | "avatar" | "nameFa">;
  variant?: PersonaAvatarVariant;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const { width, height, sizes } = VARIANT_LAYOUT[variant];

  return (
    <Image
      src={personaAvatarSrc(persona, variant)}
      alt={variant === "thumb" ? "" : persona.nameFa}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      style={style}
      loading={priority ? "eager" : "lazy"}
      priority={priority}
    />
  );
}
