// =========================================================
// In-process abort registry for active AI runs.
// Redis stop flags handle cross-process signalling; this registry aborts
// provider fetches immediately when the stop request lands on the same worker.
// =========================================================

const controllers = new Map<string, AbortController>();

export function registerRunAbortController(
  runId: string,
  controller: AbortController
): void {
  controllers.set(runId, controller);
}

export function unregisterRunAbortController(runId: string): void {
  controllers.delete(runId);
}

export function abortRun(runId: string): boolean {
  const controller = controllers.get(runId);
  if (!controller) return false;
  controller.abort();
  return true;
}

export function isRunAbortRegistered(runId: string): boolean {
  return controllers.has(runId);
}
