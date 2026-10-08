// tests/helpers/reportHelper.js
// ─────────────────────────────────────────────────────────────────────────────
// Reporting Helper for Hawk Search Tests
// Attaches formatted execution summaries, counts, and links to Playwright HTML reports
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const { test } = require('@playwright/test');

/**
 * Attaches a formatted Markdown execution summary to the Playwright test report.
 *
 * @param {import('@playwright/test').TestInfo} [testInfo]
 * @param {string} title - Title for the attachment
 * @param {Record<string, any>} data - Key-value details to include
 */
async function attachSummary(testInfo, title, data) {
  const info = (testInfo && typeof testInfo.attach === 'function') ? testInfo : test.info();
  if (!info || typeof info.attach !== 'function') return;

  let md = `### 📊 ${title}\n\n`;
  md += `| Field | Value |\n`;
  md += `| :--- | :--- |\n`;

  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string' && val.startsWith('http')) {
      md += `| **${key}** | [${val}](${val}) |\n`;
    } else {
      md += `| **${key}** | ${val} |\n`;
    }
  }

  await info.attach(title, {
    body: md,
    contentType: 'text/markdown',
  });
}

/**
 * Attaches a structured table of category & subcategory test results.
 *
 * @param {import('@playwright/test').TestInfo} [testInfo]
 * @param {string} siteName
 * @param {Array<{ category: string, subcategory: string, url: string, itemsCount: number }>} results
 */
async function attachCategoryResults(testInfo, siteName, results) {
  const info = (testInfo && typeof testInfo.attach === 'function') ? testInfo : test.info();
  if (!info || typeof info.attach !== 'function') return;

  let md = `### 📂 Category & Subcategory Navigation Summary – ${siteName}\n\n`;
  md += `| # | Category | Selected Subcategory | Subcategory URL | Items / Products Found |\n`;
  md += `| :---: | :--- | :--- | :--- | :---: |\n`;

  results.forEach((r, idx) => {
    md += `| ${idx + 1} | **${r.category}** | ${r.subcategory} | [View Link](${r.url}) | **${r.itemsCount}** |\n`;
  });

  await info.attach(`Category Results – ${siteName}`, {
    body: md,
    contentType: 'text/markdown',
  });
}

module.exports = {
  attachSummary,
  attachCategoryResults,
};
