/**
 * §10, fires on every quiz submission (pass AND fail). Per CLAUDE.md Phase 8:
 * this must never block or fail the UI, so callers invoke it fire-and-forget
 * (no `await` at the call site) and every failure path here is swallowed,
 * never rethrown. Do NOT log gender, per §10.3, it was only ever used for
 * content targeting, not identity, and there's no reason to store it.
 */
export interface LogResultPayload {
  certificateId?: string; // present on Pass, blank on Fail
  name: string;
  role: string; // e.g. "Central FTE", the display label, not the raw slug
  score: string; // e.g. "11/12"
  percentage: string; // e.g. "91.7%"
  result: 'Pass' | 'Fail';
  attemptNumber: number;
}

export async function logResult(payload: LogResultPayload): Promise<void> {
  const endpoint = import.meta.env.VITE_LOG_ENDPOINT;
  if (!endpoint) {
    // Not configured yet (§10.6 setup is a manual, no-code step) — the app
    // must run fine without it, so this is an info log, not an error.
    console.info('Result logging skipped: VITE_LOG_ENDPOINT is not set.');
    return;
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      // text/plain avoids a CORS preflight that Apps Script doesn't handle well
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, token: import.meta.env.VITE_LOG_TOKEN }),
    });
  } catch (err) {
    console.error('Result logging failed (non-blocking):', err);
    // deliberately no rethrow, logging must never block the UI
  }
}
