/**
 * Security Headers Tests
 * 
 * Validates that next.config.js applies correct security headers,
 * with environment-specific CSP directives for dev vs production.
 */

describe('next.config.js security headers', () => {
  let originalEnv;

  beforeEach(() => {
    // Save the original NODE_ENV
    originalEnv = process.env.NODE_ENV;
    // Clear the module cache to force re-evaluation with new NODE_ENV
    jest.resetModules();
  });

  afterEach(() => {
    // Restore the original NODE_ENV
    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  /**
   * Helper to extract header value from the headers array
   */
  function getHeaderValue(headers, key) {
    const header = headers.find(h => h.key === key);
    return header ? header.value : null;
  }

  describe('Development CSP', () => {
    it('includes unsafe-eval in script-src for Fast Refresh', async () => {
      process.env.NODE_ENV = 'development';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      expect(headersResult).toHaveLength(1);
      const headers = headersResult[0].headers;
      
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      expect(csp).toContain("script-src 'self' 'unsafe-eval'");
    });

    it('includes unsafe-inline in style-src for Tailwind', async () => {
      process.env.NODE_ENV = 'development';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    });

    it('matches the complete development CSP pattern', async () => {
      process.env.NODE_ENV = 'development';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      // Verify all expected directives are present
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'unsafe-eval'");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
      expect(csp).toContain("img-src 'self' data:");
      expect(csp).toContain("font-src 'self'");
      expect(csp).toContain("connect-src 'self'");
      expect(csp).toContain("frame-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
    });
  });

  describe('Production CSP', () => {
    it('omits unsafe-eval from script-src', async () => {
      process.env.NODE_ENV = 'production';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      expect(csp).toContain("script-src 'self'");
      expect(csp).not.toContain('unsafe-eval');
    });

    it('omits unsafe-inline from style-src', async () => {
      process.env.NODE_ENV = 'production';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      expect(csp).toContain("style-src 'self'");
      expect(csp).not.toContain('unsafe-inline');
    });

    it('matches the complete production CSP pattern', async () => {
      process.env.NODE_ENV = 'production';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      // Verify all expected directives are present
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("style-src 'self'");
      expect(csp).toContain("img-src 'self' data:");
      expect(csp).toContain("font-src 'self'");
      expect(csp).toContain("connect-src 'self'");
      expect(csp).toContain("frame-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      
      // Verify unsafe directives are NOT present
      expect(csp).not.toContain('unsafe-eval');
      expect(csp).not.toContain('unsafe-inline');
    });
  });

  describe('Other Security Headers', () => {
    it('applies all hardening headers consistently across environments', async () => {
      const envs = ['development', 'production'];
      
      for (const env of envs) {
        process.env.NODE_ENV = env;
        jest.resetModules();
        
        const config = require('../next.config.js');
        const headersResult = await config.headers();
        const headers = headersResult[0].headers;
        
        // Verify non-CSP security headers
        expect(getHeaderValue(headers, 'X-Frame-Options')).toBe('DENY');
        expect(getHeaderValue(headers, 'X-Content-Type-Options')).toBe('nosniff');
        expect(getHeaderValue(headers, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
        expect(getHeaderValue(headers, 'Cross-Origin-Opener-Policy')).toBe('same-origin');
        expect(getHeaderValue(headers, 'Cross-Origin-Resource-Policy')).toBe('same-origin');
        expect(getHeaderValue(headers, 'Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
        expect(getHeaderValue(headers, 'X-Permitted-Cross-Domain-Policies')).toBe('none');
        expect(getHeaderValue(headers, 'Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
      }
    });

    it('applies headers to all routes via the catch-all pattern', async () => {
      process.env.NODE_ENV = 'production';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      expect(headersResult).toHaveLength(1);
      expect(headersResult[0].source).toBe('/(.*)');
    });
  });

  describe('CSP Directive Coverage', () => {
    it('blocks external scripts by omitting them from script-src in production', async () => {
      process.env.NODE_ENV = 'production';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      // script-src should only allow 'self', no external domains
      expect(csp).toMatch(/script-src 'self'(?!.*https?:)/);
    });

    it('blocks plugins and embeds via object-src none', async () => {
      process.env.NODE_ENV = 'production';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      expect(csp).toContain("object-src 'none'");
    });

    it('prevents clickjacking via frame-ancestors none', async () => {
      process.env.NODE_ENV = 'production';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('restricts base tag injection via base-uri self', async () => {
      process.env.NODE_ENV = 'production';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      expect(csp).toContain("base-uri 'self'");
    });

    it('prevents form hijacking via form-action self', async () => {
      process.env.NODE_ENV = 'production';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      expect(csp).toContain("form-action 'self'");
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined NODE_ENV by defaulting to production-like behavior', async () => {
      delete process.env.NODE_ENV;
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      // When NODE_ENV is undefined, it should NOT equal 'development'
      // so production CSP should apply
      expect(csp).not.toContain('unsafe-eval');
      expect(csp).not.toContain('unsafe-inline');
    });

    it('treats test environment as production for CSP purposes', async () => {
      process.env.NODE_ENV = 'test';
      const config = require('../next.config.js');
      const headersResult = await config.headers();
      
      const headers = headersResult[0].headers;
      const csp = getHeaderValue(headers, 'Content-Security-Policy');
      
      // test !== development, so should get production CSP
      expect(csp).not.toContain('unsafe-eval');
      expect(csp).not.toContain('unsafe-inline');
    });
  });
});
