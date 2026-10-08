# Hawk Search Production Sanity Test Suite

Automated end-to-end sanity testing suite for **5 production auto parts e-commerce websites** built on the **Hawk Search** platform.

---

## ⚡ Quick Start

### 1. Run Tests for a Specific Website
```bash
npm run test:abcauto     # ABC Auto (https://abcauto.com/)
npm run test:eapw        # shop.eapw (https://shop.eapw.com/)
npm run test:bumper      # Bumper to Bumper (https://shopbumpertobumper.com/)
npm run test:autovalue   # Auto Value Stores (https://autovaluestores.com/)
npm run test:arnold      # Arnold Motors (https://arnoldmotorsupply.com/)
```

### 2. Run All 5 Websites
```bash
npm test                 # Run all sites sequentially in headless mode
npm run test:headed      # Run with live browser UI visible
```

### 3. Open the Interactive Test Dashboard
```bash
npm run test:dashboard
```

---

## 📚 Complete Documentation
For detailed architecture, test flows, assertions, error handling, and reporting details, read:
👉 **[HAWK_SEARCH_TEST_SUITE_DOCUMENTATION.md](HAWK_SEARCH_TEST_SUITE_DOCUMENTATION.md)**

---

## 🏗️ 4 Core Test Flows Covered

1. **Brand Search & Navigation**: Shop All Brands directory → randomly selects 1 brand → validates non-blank landing page and product cards.
2. **Category & Subcategory Navigation**: Tests all configured categories → randomly samples 2 subcategories per category → validates real navigation, non-blank rendering, and item counts.
3. **Keyword Search**: Clicks the desktop search box → types `"Cleaner"` → presses Enter → asserts non-blank results, URL matching, and product counts.
4. **Site Map Deep Navigation**: Opens `/site-map` (or `/sitemap`) → extracts all catalog links → randomly picks 1 link → validates non-blank destination rendering.

---

## 📊 Reports Generated

- **Custom Executive Dashboard**: `reports/hawk-search-dashboard.html` (Site filters, KPI cards, clickable links, step timelines, and console logs)
- **Markdown Summary**: `reports/summary.md` (Ready to copy to Slack/Jira)
- **JSON Data**: `reports/summary.json`
