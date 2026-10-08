// tests/pages/SitemapPage.js
// ─────────────────────────────────────────────────────────────────────────────
// SitemapPage – represents https://abcauto.com/site-map
//
// Responsibilities:
//  • Navigate to the sitemap page
//  • Verify the sitemap page is not blank
//  • Collect category and subcategory links from the sitemap
//  • Verify that navigating to a sitemap link renders non-blank destination content
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { SITEMAP_URL, BASE_URL, ELEMENT_TIMEOUT } = require('../config/testConfig');
const { cleanLinkName } = require('../helpers/navigationHelper');

class SitemapPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.sitemapLinksLocator = page.locator(
      '#site-map a, .site-map a, main a[href*="/"], section a[href*="/"]'
    );
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Navigates directly to the sitemap page.
   * @param {string} [url]
   */
  async open(url = SITEMAP_URL) {
    await this.goto(url);
    console.log(`  ✔ Navigated to Site Map → ${this.getCurrentUrl()}`);
  }

  /**
   * Collects all category, subcategory, and brand links rendered on the sitemap.
   *
   * @returns {Promise<{ name: string, href: string }[]>}
   */
  async getSitemapLinks() {
    try {
      await this.page.waitForSelector('#site-map a, .site-map a, main a, section a, a[href*="/"]', {
        state: 'visible',
        timeout: 6000,
      });
    } catch (_e) {
      // Continue to evaluate DOM links below
    }

    const rawLinks = await this.sitemapLinksLocator.evaluateAll((elements) =>
      elements.map((el) => {
        let name = (el.textContent || '').trim();
        name = name
          .replace(/keyboard_arrow_right/g, '')
          .replace(/keyboard_arrow_left/g, '')
          .replace(/chevron_right/g, '')
          .replace(/chevron_left/g, '')
          .trim();

        return { name, href: el.href };
      })
    );

    const skipKeywords = ['home', 'cart', 'store locator', 'account', 'sign in', 'log in', 'privacy', 'terms'];
    const seen = new Set();
    const validLinks = [];

    const currentUrl = this.getCurrentUrl();
    let currentOrigin = '';
    try {
      currentOrigin = new URL(currentUrl).origin;
    } catch (_e) {
      currentOrigin = '';
    }

    for (const item of rawLinks) {
      const lower = item.name.toLowerCase();
      const isIgnored = skipKeywords.some((k) => lower.includes(k));
      const isRoot = currentOrigin && (item.href === currentOrigin || item.href === `${currentOrigin}/`);

      if (
        item.name.length > 2 &&
        !isIgnored &&
        item.href.startsWith('http') &&
        !isRoot &&
        item.href !== currentUrl &&
        !seen.has(item.href)
      ) {
        seen.add(item.href);
        validLinks.push({
          name: cleanLinkName(item.name),
          href: item.href,
        });
      }
    }

    console.log(`  ✔ Valid sitemap links collected: ${validLinks.length}`);
    return validLinks;
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  /**
   * Asserts that the sitemap contains at least `minCount` links.
   *
   * @param {number} [minCount=5]
   */
  async assertSitemapLinksVisible(minCount = 5) {
    const links = await this.getSitemapLinks();
    expect(
      links.length,
      `Site Map page should contain at least ${minCount} valid links`
    ).toBeGreaterThanOrEqual(minCount);
  }
}

module.exports = { SitemapPage };
