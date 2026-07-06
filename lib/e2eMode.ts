/** Server or client — true when Playwright / E2E harness is active. */
export function isE2eMode(): boolean {
  return process.env.E2E_MODE === "1" || process.env.NEXT_PUBLIC_E2E_MODE === "1";
}

/** Client components — only NEXT_PUBLIC_* is inlined by Next.js. */
export function isE2eModeClient(): boolean {
  return process.env.NEXT_PUBLIC_E2E_MODE === "1";
}
