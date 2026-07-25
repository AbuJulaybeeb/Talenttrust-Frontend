/** @type {import('next').NextConfig} */

/*
  Content-Security-Policy
  ------------------------------------------------------------------
  Environment-aware CSP that provides strict security in production
  while preserving developer experience in development.

  Development vs Production:
    - script-src: adds 'unsafe-eval' in dev for Next.js Fast Refresh/HMR
    - style-src: adds 'unsafe-inline' in dev for Tailwind JIT compiler
    - All other directives remain consistent across environments

  See docs/security-headers.md for complete rationale and future roadmap.

  Quick reference for future wallet integration:
    connect-src additions: https://*.infura.io wss://*.infura.io (MetaMask RPC)
                           wss://relay.walletconnect.com          (WalletConnect relay)
    script-src may also need the provider's injection origin.
*/

// Build CSP directives conditionally based on environment
const cspDirectives = ["default-src 'self'"];

if (process.env.NODE_ENV === 'development') {
  // Development-only: 'unsafe-eval' enables Next.js Fast Refresh and HMR
  cspDirectives.push("script-src 'self' 'unsafe-eval'");
  // Development-only: 'unsafe-inline' enables Tailwind JIT inline style injection
  cspDirectives.push("style-src 'self' 'unsafe-inline'");
} else {
  // Production: strict CSP without unsafe directives
  // All scripts are bundled to _next/static/ (no eval needed)
  cspDirectives.push("script-src 'self'");
  // All styles are extracted to static CSS files (no inline styles needed)
  cspDirectives.push("style-src 'self'");
}

// Environment-consistent directives
cspDirectives.push(
  "img-src 'self' data:'",       // Allow self-hosted images and inline data: URIs (SVGs, etc.)
  "font-src 'self'",              // All fonts are self-hosted
  "connect-src 'self'",           // API calls restricted to same origin (extend for wallet providers later)
  "frame-src 'self'",             // No cross-origin iframes
  "object-src 'none'",            // Block plugins (<object>, <embed>, <applet>)
  "base-uri 'self'",              // Prevent <base> tag injection attacks
  "form-action 'self'",           // Prevent form hijacking to external endpoints
  "frame-ancestors 'none'"        // Prevent clickjacking (also enforced by X-Frame-Options)
);

const cspHeader = cspDirectives.join('; ');

const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },

  /**
   * Apply baseline security headers to every response.
   * Revisit COOP/CORP if the app later adds popup auth flows,
   * cross-site asset sharing, or third-party embeds.
   */
  async headers() {
    return [
      {
        // Apply security headers to every route
        source: '/(.*)',
        headers: [
          // Restrict resource origins without changing the existing dev/prod CSP behavior.
          { key: 'Content-Security-Policy', value: cspHeader },
          // Legacy clickjacking protection for browsers that do not enforce frame-ancestors.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME sniffing so assets are interpreted as declared.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Keep full referrers on same-origin navigation and trim cross-origin referrers to origin only.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Isolate the top-level browsing context from cross-origin windows and popups.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          // Prevent other origins from embedding or hotlinking app-served assets.
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          // Enforce HTTPS in supported browsers once the site is loaded over TLS.
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },

          // Bonus hardening headers (not part of the original spec but
          // recommended by OWASP and the security community):
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
