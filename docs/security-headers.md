# Security Headers

This project sets HTTP response headers via the `headers()` function in
`next.config.js`.  The headers are applied to every route.

## User-supplied record text

Contract names, party labels, and milestone titles are normalised at form
validation before they are saved to browser storage. `sanitizeUserText` removes
control characters, trims and collapses whitespace, and applies a length cap.
The forms validate the cleaned, unbounded value first, so input longer than the
cap is rejected with a field error rather than being silently truncated.

| Field | Maximum cleaned length |
|---|---:|
| Contract name | 200 characters |
| Party label | 100 characters |
| Milestone title | 200 characters |

## Login form throttling

The home page login form (`src/app/page.tsx`) uses a client-side attempt
throttle with exponential backoff as a first line of defence against
rapid-fire submission scripts.

### How it works

1. Each form submission increments an attempt counter, persisted via
   `src/lib/safeStorage.ts` so a page reload does not reset it.
2. After the first submission, subsequent attempts are subject to
   exponential backoff:
   - 2nd attempt: 5 s cooldown
   - 3rd attempt: 25 s cooldown
   - 4th attempt: 125 s cooldown
   - 5th+ attempt: capped at 300 s (5 minutes)
3. During the cooldown the submit button is disabled and shows the
   remaining seconds. An `aria-live="polite"` region announces the
   cooldown to screen readers.
4. A successful form submission resets the counter to zero.

### Configuration

| Constant | Location | Value |
|---|---|---|
| `BASE_BACKOFF_MS` | `src/lib/loginThrottle.ts` | 5 000 |
| `BACKOFF_FACTOR` | `src/lib/loginThrottle.ts` | 5 |
| `MAX_BACKOFF_MS` | `src/lib/loginThrottle.ts` | 300 000 |

### Test coverage

Run `npx jest -- src/app/__tests__/login-throttle.test.tsx` to execute
the throttle unit and integration tests.

## Headers in use

| Header | Value | Why |
|---|---|---|
| `Content-Security-Policy` | See CSP section below | Defence-in-depth against XSS, data injection |
| `X-Frame-Options` | `DENY` | Prevents clickjacking (legacy; also covered by CSP `frame-ancestors`) |
| `X-Content-Type-Options` | `nosniff` | Stops MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Sends only the origin (not full URL) on cross-origin nav |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolates the top-level browsing context from cross-origin windows and popups |
| `Cross-Origin-Resource-Policy` | `same-origin` | Stops other origins from embedding or hotlinking app-served resources |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Enforces HTTPS for 1 year (ignored by browsers on localhost per RFC 6797) |
| `X-Permitted-Cross-Domain-Policies` | `none` | Blocks Adobe Flash/PDF cross-domain requests (bonus hardening) |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables sensitive browser features app-wide (bonus hardening) |

## Cross-origin hardening notes

`Referrer-Policy: strict-origin-when-cross-origin` is intentionally retained.
It preserves same-origin analytics/debuggability while reducing cross-origin
URL leakage to the origin only.

`Cross-Origin-Opener-Policy: same-origin` narrows the browsing-context group to
same-origin documents. That reduces the cross-origin window surface area and is
safe for the current app because the repo does not show popup-based auth or
cross-origin window messaging requirements.

`Cross-Origin-Resource-Policy: same-origin` is the strongest safe default for
this app today. The project serves its own icons, manifest, and social preview
assets from the same origin, and the repo does not indicate any intentional
cross-site embedding or third-party hotlinking requirement.

If the app later adds popup auth, same-site asset sharing, or third-party
embeds, revisit COOP/CORP together rather than weakening only one header.

## About Subresource Integrity

This hardening pass is limited to response headers in `next.config.js`. It does
not add HTML `integrity` attributes or asset-pipeline Subresource Integrity
(SRI) generation for scripts/styles. That would be a separate change with
different build and rendering implications.

## Content-Security-Policy

### Current directives

The CSP is **environment-aware** and applies stricter rules in production:

#### Development (NODE_ENV=development)
```
default-src 'self'
script-src 'self' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
img-src 'self' data:'
font-src 'self'
connect-src 'self'
frame-src 'self'
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
```

#### Production (NODE_ENV=production)
```
default-src 'self'
script-src 'self'
style-src 'self'
img-src 'self' data:'
font-src 'self'
connect-src 'self'
frame-src 'self'
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
```

| Directive | Development | Production | Notes |
|---|---|---|---|
| `default-src` | `'self'` | `'self'` | Baseline — only allow same-origin resources |
| `script-src` | `'self' 'unsafe-eval'` | `'self'` | `'unsafe-eval'` **only in dev** for Next.js Fast Refresh |
| `style-src` | `'self' 'unsafe-inline'` | `'self'` | `'unsafe-inline'` **only in dev** for Tailwind JIT |
| `img-src` | `'self' data:` | `'self' data:` | Allows inline `data:` URIs (SVGs, etc.) |
| `font-src` | `'self'` | `'self'` | All fonts are self-hosted |
| `connect-src` | `'self'` | `'self'` | API calls only go to the same origin today |
| `frame-src` | `'self'` | `'self'` | No cross-origin iframes |
| `object-src` | `'none'` | `'none'` | Blocks `<object>`, `<embed>`, `<applet>` |
| `base-uri` | `'self'` | `'self'` | Stops `<base>` tag injection |
| `form-action` | `'self'` | `'self'` | Prevents form hijacking to external endpoints |
| `frame-ancestors` | `'none'` | `'none'` | Same protection as `X-Frame-Options: DENY` but CSP-native |

### Development vs Production CSP

The CSP is **environment-aware** to balance security with development experience:

#### Development mode (`'unsafe-eval'` and `'unsafe-inline'`)

1. **`'unsafe-eval'` for Fast Refresh** — Next.js uses `eval()` for Hot Module
   Replacement (HMR) and Fast Refresh during development. This directive is
   **automatically removed in production**.

2. **`'unsafe-inline'` for Tailwind JIT** — The Tailwind JIT compiler emits
   inline `<style>` blocks during development. In production builds, Tailwind
   extracts styles to static CSS files, allowing this directive to be removed.

#### Production mode (strict CSP)

**Both `'unsafe-eval'` and `'unsafe-inline'` are removed in production**,
providing defense-in-depth against XSS attacks. The production build process:

1. **Scripts** — All JavaScript is bundled and served as static files from
   `_next/static/`, eliminating the need for `eval()`.
2. **Styles** — Tailwind CSS is extracted to static stylesheets during the
   build, and Next.js serves them as regular `<link>` tags rather than inline
   `<style>` blocks.

This approach has been **validated** to work with Next.js 16.x + Tailwind 4.x.
The production build successfully loads all assets without CSP violations.

### Current state vs roadmap

**Status: ✅ Roadmap implemented**

The tightening described in previous versions of this document has been
**completed**:

- ✅ `'unsafe-eval'` removed from production `script-src`
- ✅ `'unsafe-inline'` removed from production `style-src`
- ✅ Environment-based branching in `next.config.js`
- ✅ Comprehensive test coverage in `__tests__/next.config.test.js`

### Future improvements (optional)

While the current CSP is already strict, these further improvements could be
considered if additional hardening is required:

1. **Nonce-based CSP** — For even stricter protection, implement per-request
   nonces for styles and scripts. This requires Next.js middleware to generate
   and inject nonces into both headers and rendered HTML.

2. **Subresource Integrity (SRI)** — Add `integrity` attributes to `<script>`
   and `<link>` tags. This protects against CDN compromises but requires
   build-time hash generation. (Note: this project self-hosts all assets, so
   SRI provides less value than in CDN-heavy setups.)

3. **CSP Reporting** — Add `report-uri` or `report-to` directives to collect
   CSP violation reports for monitoring and debugging.

### Future: wallet integration

The wallet connect flow is currently mocked.  When a real provider (MetaMask,
WalletConnect v2) is integrated, extend the CSP:

```
connect-src 'self' https://*.infura.io wss://*.infura.io wss://relay.walletconnect.com
```

And allow the provider's injected script origin in `script-src` if needed.

## Verifying the headers locally

```bash
# 1. Build the production bundle
npm run build

# 2. Start the production server (defaults to http://localhost:3000)
npm start

# 3. In another terminal, check the headers
curl -I http://localhost:3000 2>&1 | grep -E 'content-security-policy|x-frame|x-content|referrer|strict-transport|permitted-cross|permissions-policy'
```

Or open DevTools → Network tab → click the document request → inspect the
Response Headers section.
