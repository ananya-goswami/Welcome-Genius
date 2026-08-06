/**
 * §10/Phase 8 contract: logResult() must never throw, regardless of whether
 * an endpoint is configured or the network call fails, since App.tsx calls
 * it fire-and-forget and the results/certificate screen must render either way.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { logResult } from '../logResult';

const payload = {
  certificateId: 'SWFTY-CTL-20260805-K3P9',
  name: '',
  role: 'Central FTE',
  score: '11/12',
  percentage: '91.7%',
  result: 'Pass' as const,
  attemptNumber: 1,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('logResult', () => {
  it('POSTs to VITE_LOG_ENDPOINT with the token attached, as text/plain (avoids a CORS preflight)', async () => {
    vi.stubEnv('VITE_LOG_ENDPOINT', 'https://example.com/exec');
    vi.stubEnv('VITE_LOG_TOKEN', 'secret-token');
    const fetchMock = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', fetchMock);

    await logResult(payload);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.com/exec');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toMatch(/text\/plain/);
    expect(JSON.parse(options.body)).toEqual({ ...payload, token: 'secret-token' });
  });

  it('never logs gender and never sends anything beyond the typed payload fields', async () => {
    vi.stubEnv('VITE_LOG_ENDPOINT', 'https://example.com/exec');
    const fetchMock = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', fetchMock);

    await logResult(payload);

    const sentKeys = Object.keys(JSON.parse(fetchMock.mock.calls[0][1].body));
    expect(sentKeys).not.toContain('gender');
  });

  it('does not attempt a network call, and does not throw, when no endpoint is configured', async () => {
    vi.stubEnv('VITE_LOG_ENDPOINT', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(logResult(payload)).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('swallows a network failure without throwing (the UI must render regardless)', async () => {
    vi.stubEnv('VITE_LOG_ENDPOINT', 'https://example.com/exec');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(logResult(payload)).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('fires identically for a Fail result (blank certificateId)', async () => {
    vi.stubEnv('VITE_LOG_ENDPOINT', 'https://example.com/exec');
    const fetchMock = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', fetchMock);

    await logResult({ ...payload, certificateId: undefined, result: 'Fail', score: '9/12', percentage: '75%' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.result).toBe('Fail');
    expect(sent.certificateId).toBeUndefined();
  });
});
