/** Update URL without navigation — keeps Arena shell mounted. */
export function replaceThreadUrl(path: string) {
  if (typeof window === "undefined") return;
  if (window.location.pathname + window.location.search === path) return;
  window.history.replaceState(null, "", path);
}
