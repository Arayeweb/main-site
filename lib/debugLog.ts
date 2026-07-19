export function serverDebugLog(
  _location: string,
  _message: string,
  _data: Record<string, unknown>,
  _hypothesisId: string,
  _runId = "pre-fix"
) {
  // Debug logging disabled after investigation cleanup.
}

export function tgDebugLog(
  _hypothesisId: string,
  _location: string,
  _message: string,
  _data: Record<string, unknown> = {},
  _runId = "repro1"
) {
  // Debug logging disabled after investigation cleanup.
}
