// tests/pages/CategoryPage.js
// ─────────────────────────────────────────────────────────────────────────────
// CategoryPage – represents a top-level category landing page.
// URL examples:
//   https://abcauto.com/Accessories/MTAwMQ
//   https://abcauto.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng
//
// Responsibilities:
//  • Navigate to a category page by URL
//  • Verify the category is reflected on the page
//  • Collect all subcategory links from the page
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { BASE_URL } = require('../config/testConfig');
const { cleanLinkName, nameAppearsOnPage } = require('../helpers/navigationHelper');

class CategoryPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /**
   * Navigates directly to a category page.
   *
   * @param {string} url - Full category URL
   */
  async open(url) {
    await this.goto(url);
    console.log(`  ✔ URL: ${this.getCurrentUrl()}`);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  /**
   * Asserts that the category name (or any significant word from it) is
   * visible in the page body text.
   *
   * @param {string} categoryName
   */
  async assertCategoryNameVisible(categoryName) {
    const bodyText = await this.getBodyText();
    const decodedUrl = decodeURIComponent(this.getCurrentUrl()).toLowerCase();

    const { getSignificantWords } = require('../helpers/navigationHelper');
    const words = getSignificantWords(categoryName);

    const foundInBody = nameAppearsOnPage(categoryName, bodyText);
    const foundInUrl  = words.length === 0 || words.some((w) => decodedUrl.includes(w));

    expect(
      foundInBody || foundInUrl,
      `Category page should reflect the name "${categoryName}" in body text or URL`
    ).toBe(true);

    console.log(`  ✔ Category name is reflected on the page`);
  }

  // ── Data Collection ────────────────────────────────────────────────────────

  /**
   * Collects all subcategory links rendered on this category page.
   *
   * The site renders subcategory links inside:
   *  • #replacement-parts  – sidebar facet links
   *  • #search-results-page – inline breadcrumb / category links
   *  • .hawk-facet-bar     – Hawk Search facet bar
   *
   * Each raw link is cleaned (Material Icon text stripped) and filtered to
   * remove breadcrumb noise (home, back, prev, next).
   *
   * @param {string} currentUrl - The current category page URL to exclude from results
   * @returns {Promise<{ name: string, href: string }[]>}
   */
  async getSubcategoryLinks(currentUrl) {
    let currentOrigin = '';
    try {
      currentOrigin = new URL(currentUrl).origin;
    } catch (_e) {
      currentOrigin = '';
    }

    await this.waitForSpaContent(2000);

    const subLinkLocator = this.page.locator(
      '#replacement-parts a, #search-results-page a[href*="/"], .hawk-facet-bar a, [class*="facet"] a, [class*="category"] a, [class*="subcategory"] a'
    );

    const count = await subLinkLocator.count();
    if (count === 0) return [];

    const rawLinks = await subLinkLocator.evaluateAll((elements) =>
      elements.map((el) => {
        // Prefer direct text nodes to skip Material Icon <span> text
        let name = '';
        el.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            name += node.textContent;
          }
        });
        // Fallback: use full textContent with icon strings stripped
        if (!name.trim()) {
          name = (el.textContent || '')
            .replace(/keyboard_arrow_right/g, '')
            .replace(/keyboard_arrow_left/g, '')
            .replace(/keyboard_arrow_down/g, '')
            .replace(/keyboard_arrow_up/g, '')
            .replace(/chevron_right/g, '')
            .replace(/chevron_left/g, '');
        }
        return { name: name.trim(), href: el.href };
      })
    );

    // Labels that indicate breadcrumb / pagination noise
    const skipNames = new Set(['home', '', 'back', 'next', 'prev', 'previous', 'cart', 'sign in', 'log in']);

    const seen  = new Set();
    const links = [];

    for (const link of rawLinks) {
      const nameLower = link.name.toLowerCase();
      const isCurrentOrigin = currentOrigin ? link.href.startsWith(currentOrigin) : true;
      const isRoot = currentOrigin && (link.href === currentOrigin || link.href === `${currentOrigin}/`);

      if (
        link.name.length > 2 &&
        !skipNames.has(nameLower) &&
        link.href.startsWith('http') &&
        isCurrentOrigin &&
        !isRoot &&
        link.href !== currentUrl &&
        !seen.has(link.href)
      ) {
        seen.add(link.href);
        links.push({ name: cleanLinkName(link.name), href: link.href });
      }
    }

    console.log(`  ✔ Subcategories found: ${links.length}`);
    return links;
  }
}

module.exports = { CategoryPage };
