// tests/pages/BasePage.js
// ─────────────────────────────────────────────────────────────────────────────
// BasePage – shared low-level actions inherited by every page object.
//
// All page objects extend this class so common logic (navigation, blank-check,
// waiting) is written once.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const { expect } = require('@playwright/test');
const { ELEMENT_TIMEOUT, NETWORK_IDLE_TIMEOUT } = require('../config/testConfig');

// Selectors that confirm the SPA (Hawk Search) has finished rendering content.
// Checked in order – the first one found means the page is ready.
const SPA_CONTENT_SELECTORS = [
  '#search-results-page',
  '#products-container',
  '.hawk-results',
  '[class*="hawk"]',
];

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /**
   * Navigate to a URL and wait for the page to be ready.
   * After the standard load events, also waits for Hawk Search SPA content
   * to appear so assertions never run against a blank render shell.
   *
   * @param {string} url
   */
  async goto(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.waitForReady();
    await this.waitForSpaContent();
  }

  /**
   * Waits for the page load-state events to settle.
   * Uses `domcontentloaded` (required) + `networkidle` (best-effort, 5 s cap).
   */
  async waitForReady() {
    await this.page.waitForLoadState('domcontentloaded', { timeout: ELEMENT_TIMEOUT });
    try {
      await this.page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT });
    } catch (_e) {
      // Tolerate slow or never-resolving third-party requests
    }
  }

  /**
   * Waits for the Hawk Search SPA content container to appear in the DOM.
   *
   * abcauto.com is a Single-Page Application – `domcontentloaded` and
   * `networkidle` can resolve before the Angular/React framework has
   * injected the actual page content. This method polls the known Hawk
   * Search containers until one becomes visible (up to ELEMENT_TIMEOUT).
   *
   * Silently continues if none appear (some pages may use different structure).
   */
  /**
   * Waits for the Hawk Search SPA content container to appear in the DOM.
   *
   * Combines all candidate selectors into a single query so they are checked
   * simultaneously rather than sequentially.
   *
   * @param {number} [timeout=4000] - Max wait time in ms
   */
  async waitForSpaContent(timeout = 4000) {
    try {
      const combinedSelector = SPA_CONTENT_SELECTORS.join(', ');
      await this.page
        .locator(combinedSelector)
        .first()
        .waitFor({ state: 'visible', timeout });
    } catch (_e) {
      // Content container not present (e.g., homepage or non-results page)
    }
  }

  // ── Error detection & Blank-screen assertions ──────────────────────────────

  /**
   * Asserts that the page does NOT display any critical server errors, HTTP error codes,
   * or broken crash banners (e.g. 500, 502, 503, 404, "Something went wrong").
   *
   * @param {string} label - Human-readable label used in the assertion message
   */
  async assertNoErrorsOnPage(label) {
    const bodyText = await this.getBodyText();
    const currentUrl = this.getCurrentUrl();

    const fullInfiniteLoopError =
      'ERROR in error page, (infinite loop or error page not found with name [/error/error.html]), but here is the text just in case it helps you: An unexpected system error occurred. Please try again later or contact support if the issue persists.';

    // Check for known infinite loop / system error screen
    if (
      bodyText.includes('infinite loop or error page not found') ||
      bodyText.includes('an unexpected system error occurred') ||
      bodyText.includes('error in error page')
    ) {
      expect(
        false,
        `[${label}] Server Error at URL ${currentUrl}:\n"${fullInfiniteLoopError}"`
      ).toBe(true);
    }

    // Critical error signatures
    const errorSignatures = [
      '500 internal server error',
      '502 bad gateway',
      '503 service unavailable',
      '404 page not found',
      '404 not found',
      'an unexpected error occurred',
      'unexpected system error',
      'system error occurred',
      'something went wrong',
      'unable to process your request',
      'service is temporarily unavailable',
    ];

    for (const signature of errorSignatures) {
      const hasError = bodyText.includes(signature);
      expect(
        hasError,
        `[${label}] Critical error detected on page: "${signature}" at URL ${currentUrl}`
      ).toBe(false);
    }

    // Check for standard error container elements
    const errorContainers = this.page.locator('.error-page, .server-error, .page-error, .error-500, .error-404');
    const isErrorContainerVisible = await errorContainers.first().isVisible().catch(() => false);
    expect(
      isErrorContainerVisible,
      `[${label}] Error container element detected on page at URL ${currentUrl}`
    ).toBe(false);

    console.log(`  ✔ No error screens/banners detected: ${label}`);
  }

  /**
   * Asserts that the current page is NOT a blank white screen and does NOT contain errors.
   *
   * @param {string} label - Human-readable label used in the assertion message
   */
  async assertPageIsNotBlank(label) {
    // Step 1: Ensure no error screens exist on the page
    await this.assertNoErrorsOnPage(label);

    // Step 2: Give SPA time to render content containers into DOM
    const contentSelectors = [
      '#search-results-page',
      '#products-container',
      '.hawk-results',
      '[class*="product"]',
      '[class*="category"]',
      '[class*="brand"]',
      '#replacement-parts',
      'main',
      'section',
      'header',
      'footer',
      'nav',
      'a',
    ];

    try {
      await this.page
        .locator(contentSelectors.join(', '))
        .first()
        .waitFor({ state: 'visible', timeout: 6000 });
    } catch (_e) {
      // Continue to verification check below
    }

    // Step 3: Height & Content Rendering check
    const pageHeight = await this.page.evaluate(() => {
      return Math.max(
        document.body ? document.body.scrollHeight : 0,
        document.documentElement ? document.documentElement.scrollHeight : 0,
        document.body ? document.body.offsetHeight : 0,
        document.documentElement ? document.documentElement.offsetHeight : 0
      );
    });

    // Step 4: At least one content container or substantial body text must be present
    const bodyText = await this.getBodyText();
    let foundContent = bodyText.length > 100;

    if (!foundContent) {
      for (const selector of contentSelectors) {
        try {
          const isVisible = await this.page.locator(selector).first().isVisible();
          if (isVisible) {
            foundContent = true;
            break;
          }
        } catch (_e) {
          // Element not in DOM – try next selector
        }
      }
    }

    expect(
      foundContent || pageHeight > 100,
      `[${label}] Page must render visible content – blank white screen detected (height: ${pageHeight}px, text length: ${bodyText.length})`
    ).toBe(true);

    console.log(`  ✔ Page is NOT blank: ${label}`);
  }

  // ── Page text helper ────────────────────────────────────────────────────────

  /**
   * Returns the full visible text of the page body (lowercased).
   *
   * @returns {Promise<string>}
   */
  async getBodyText() {
    return ((await this.page.locator('body').textContent()) || '').toLowerCase();
  }

  // ── URL helper ──────────────────────────────────────────────────────────────

  /**
   * Returns the current page URL.
   *
   * @returns {string}
   */
  getCurrentUrl() {
    return this.page.url();
  }
}

module.exports = { BasePage };
