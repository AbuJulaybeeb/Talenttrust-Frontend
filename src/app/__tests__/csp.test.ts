type HeaderEntry = {
  key: string;
  value: string;
};

async function loadHeadersForEnv(nodeEnv: string) {
  (process.env as any).NODE_ENV = nodeEnv;
  jest.resetModules();

  const nextConfig = require('../../../next.config');
  return nextConfig.headers();
}

function getHeaderMap(headers: HeaderEntry[]) {
  return new Map(headers.map(header => [header.key, header.value]));
}

describe("Content Security Policy", () => {
  const originalEnv = process.env.NODE_ENV;

  afterAll(() => {
    (process.env as any).NODE_ENV = originalEnv;
    jest.resetModules();
  });

  test('development includes unsafe-eval and unsafe-inline', async () => {
    const result = await loadHeadersForEnv('development');
    const headerMap = getHeaderMap(result[0].headers);
    const cspHeader = headerMap.get('Content-Security-Policy');

    expect(cspHeader).toBeDefined();
    const value = cspHeader as string;
    expect(value).toContain("script-src 'self' 'unsafe-eval'");
    expect(value).toContain("style-src 'self' 'unsafe-inline'");
  });

  test('production omits unsafe-eval and unsafe-inline', async () => {
    const result = await loadHeadersForEnv('production');
    const headerMap = getHeaderMap(result[0].headers);
    const cspHeader = headerMap.get('Content-Security-Policy');

    expect(cspHeader).toBeDefined();
    const value = cspHeader as string;
    expect(value).toContain("script-src 'self'");
    expect(value).not.toContain("unsafe-eval");
    expect(value).toContain("style-src 'self'");
    expect(value).not.toContain("unsafe-inline");
  });

  test('global security headers include referrer and cross-origin hardening', async () => {
    const result = await loadHeadersForEnv('production');

    expect(result[0].source).toBe('/(.*)');

    const headerMap = getHeaderMap(result[0].headers);
    expect(headerMap.get('Content-Security-Policy')).toBeDefined();
    expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headerMap.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(headerMap.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
  });
});
