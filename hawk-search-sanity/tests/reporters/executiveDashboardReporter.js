// tests/reporters/executiveDashboardReporter.js
// ─────────────────────────────────────────────────────────────────────────────
// Custom Executive Dashboard Reporter for Hawk Search Sanity Suite
// Generates:
//  1. reports/hawk-search-dashboard.html – Complete interactive executive dashboard
//     with Step Timelines, Structured Data Tables, Clickable URLs, and Console Logs
//  2. reports/summary.md               – Markdown tables ready for Slack / Jira
//  3. reports/summary.json             – Structured JSON data
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} TestStepItem
 * @property {string} title
 * @property {number} duration
 * @property {string|null} error
 * @property {TestStepItem[]} steps
 */

/**
 * @typedef {Object} TestResultItem
 * @property {string} title
 * @property {string} siteName
 * @property {string} status
 * @property {number} duration
 * @property {number} retry
 * @property {string|null} error
 * @property {string} stdout
 * @property {string} stderr
 * @property {TestStepItem[]} steps
 * @property {Array<{ name: string, contentType: string, body: string }>} attachments
 */

class ExecutiveDashboardReporter {
  /**
   * @param {Object} [options]
   * @param {string} [options.outputDir]
   */
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'reports');
    /** @type {TestResultItem[]} */
    this.results = [];
    this.startTime = Date.now();
    this.totalTests = 0;
  }

  /**
   * @param {any} _config
   * @param {any} suite
   */
  onBegin(_config, suite) {
    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;
  }

  /**
   * Recursively extracts test steps
   * @param {any[]} steps
   * @returns {TestStepItem[]}
   */
  extractSteps(steps = []) {
    return steps
      .filter((s) => s.category === 'test.step' || s.category === 'hook')
      .map((s) => ({
        title: s.title || '',
        duration: s.duration || 0,
        error: s.error ? s.error.message : null,
        steps: this.extractSteps(s.steps),
      }));
  }

  /**
   * @param {any} test
   * @param {any} result
   */
  onTestEnd(test, result) {
    const titlePath = typeof test.titlePath === 'function' ? test.titlePath() : [];
    const siteMatch = titlePath.find((p) => typeof p === 'string' && p.startsWith('Hawk Search - '));
    const siteName = siteMatch ? siteMatch.replace('Hawk Search - ', '').split(' (')[0].trim() : 'General';

    // Parse stdout / console logs
    let stdoutText = '';
    if (Array.isArray(result.stdout)) {
      stdoutText = result.stdout
        .map((chunk) => (Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : String(chunk)))
        .join('');
    }

    let stderrText = '';
    if (Array.isArray(result.stderr)) {
      stderrText = result.stderr
        .map((chunk) => (Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : String(chunk)))
        .join('');
    }

    // Parse attachments
    const attachments = (result.attachments || []).map((att) => {
      let bodyText = '';
      if (att.body) {
        bodyText = Buffer.isBuffer(att.body) ? att.body.toString('utf-8') : String(att.body);
      }
      return {
        name: att.name || 'Attachment',
        contentType: att.contentType || 'text/plain',
        body: bodyText,
      };
    });

    // Parse steps
    const steps = this.extractSteps(result.steps);

    this.results.push({
      title: test.title,
      siteName,
      status: result.status,
      duration: result.duration,
      retry: result.retry || 0,
      error: result.error ? result.error.message : null,
      stdout: stdoutText,
      stderr: stderrText,
      steps,
      attachments,
    });
  }

  /**
   * @param {any} result
   */
  onEnd(result) {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter((r) => r.status === 'passed').length;
    const failed = this.results.filter((r) => r.status === 'failed' || r.status === 'timedOut').length;
    const skipped = this.results.filter((r) => r.status === 'skipped').length;

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const data = {
      summary: {
        total: this.results.length,
        passed,
        failed,
        skipped,
        durationMs: totalDuration,
        timestamp: new Date().toISOString(),
        overallStatus: result ? result.status : 'unknown',
      },
      tests: this.results,
    };

    // 1. Write JSON summary
    const jsonPath = path.join(this.outputDir, 'summary.json');
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');

    // 2. Write Markdown summary
    const mdContent = this.generateMarkdown(data);
    const mdPath = path.join(this.outputDir, 'summary.md');
    fs.writeFileSync(mdPath, mdContent, 'utf-8');

    // 3. Write HTML Dashboard
    const htmlContent = this.generateHtmlDashboard(data);
    const htmlPath = path.join(this.outputDir, 'hawk-search-dashboard.html');
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

    console.log(`\n📊 Executive Test Dashboard Generated: file://${htmlPath}`);
    console.log(`📄 Markdown Summary Generated: file://${mdPath}\n`);

    // Auto-open dashboard in browser automatically after every test run (pass or fail)
    if (!process.env.CI && process.env.AUTO_OPEN_REPORT !== 'false') {
      const { exec } = require('child_process');
      const openCmd =
        process.platform === 'darwin'
          ? `open "${htmlPath}"`
          : process.platform === 'win32'
          ? `start "" "${htmlPath}"`
          : `xdg-open "${htmlPath}"`;

      try {
        exec(openCmd);
        console.log(`🚀 Executive Test Dashboard opened automatically in browser.\n`);
      } catch (_e) {
        // Tolerate environment without GUI
      }
    }
  }

  /**
   * @param {any} data
   * @returns {string}
   */
  generateMarkdown(data) {
    const s = data.summary;
    const formattedDuration = (s.durationMs / 1000).toFixed(1);
    let md = `# 🚀 Hawk Search Production Sanity Report\n\n`;
    md += `**Execution Date**: ${new Date(s.timestamp).toLocaleString()}  \n`;
    md += `**Total Tests**: ${s.total} | **Passed**: ✅ ${s.passed} | **Failed**: ❌ ${s.failed} | **Duration**: ⏱ ${formattedDuration}s\n\n`;
    md += `---\n\n`;

    const sites = Array.from(new Set(data.tests.map((t) => t.siteName)));

    for (const site of sites) {
      const siteTests = data.tests.filter((t) => t.siteName === site);
      md += `## 🏢 ${site}\n\n`;

      for (const t of siteTests) {
        const icon = t.status === 'passed' ? '✅' : '❌';
        md += `### ${icon} ${t.title}\n`;
        md += `- **Status**: ${t.status.toUpperCase()} (${(t.duration / 1000).toFixed(1)}s)\n\n`;

        for (const att of t.attachments) {
          if (att.body) {
            md += `${att.body}\n\n`;
          }
        }
      }
      md += `---\n\n`;
    }

    return md;
  }

  /**
   * @param {any} data
   * @returns {string}
   */
  generateHtmlDashboard(data) {
    const s = data.summary;
    const durationSec = (s.durationMs / 1000).toFixed(1);
    const passRate = s.total > 0 ? Math.round((s.passed / s.total) * 100) : 0;
    const sites = Array.from(new Set(data.tests.map((t) => t.siteName)));

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hawk Search Sanity Test Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #090d16;
      --bg-secondary: #0f172a;
      --bg-card: #1e293b;
      --bg-card-header: #1e293b;
      --bg-subtle: #141e33;
      --border: #334155;
      --border-light: #475569;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-blue: #38bdf8;
      --accent-cyan: #06b6d4;
      --accent-green: #34d399;
      --accent-red: #f87171;
      --accent-amber: #fbbf24;
      --accent-indigo: #818cf8;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-sans);
      line-height: 1.5;
      padding: 2rem 1.5rem;
      min-height: 100vh;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    
    /* Header */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .brand-title { display: flex; align-items: center; gap: 0.85rem; }
    .brand-badge {
      background: linear-gradient(135deg, #0284c7, #6366f1);
      color: #fff;
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    }
    h1 { font-size: 1.85rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
    .header-meta { color: var(--text-secondary); font-size: 0.875rem; text-align: right; }
    .header-meta span { color: #fff; font-weight: 600; }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }
    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.35rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    .kpi-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 4px;
    }
    .kpi-total::after { background: var(--accent-blue); }
    .kpi-pass::after { background: var(--accent-green); }
    .kpi-fail::after { background: var(--accent-red); }
    .kpi-rate::after { background: var(--accent-indigo); }
    .kpi-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 700; margin-bottom: 0.4rem; }
    .kpi-value { font-size: 2.2rem; font-weight: 800; color: #fff; }
    .kpi-sub { font-size: 0.825rem; color: var(--text-secondary); margin-top: 0.3rem; }

    /* Controls */
    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
      background: var(--bg-subtle);
      padding: 1rem 1.25rem;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .site-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .filter-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: 0.5rem 1.1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .filter-btn:hover { background: #334155; color: #fff; }
    .filter-btn.active { background: var(--accent-blue); color: #090d16; border-color: var(--accent-blue); font-weight: 700; }
    .search-input {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      color: #fff;
      padding: 0.55rem 1.1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      min-width: 280px;
    }
    .search-input:focus { outline: none; border-color: var(--accent-blue); }
    .action-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      padding: 0.5rem 0.9rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .action-btn:hover { color: #fff; background: #334155; }

    /* Site Section */
    .site-section { margin-bottom: 3rem; }
    .site-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--border);
    }
    .site-title { font-size: 1.35rem; font-weight: 700; color: #fff; }

    /* Test Cards */
    .test-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 1.25rem;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      transition: border-color 0.2s;
    }
    .test-card:hover { border-color: var(--border-light); }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.1rem 1.35rem;
      background: var(--bg-card-header);
      cursor: pointer;
      user-select: none;
    }
    .test-info { display: flex; align-items: center; gap: 0.85rem; }
    .status-pill {
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-passed { background: rgba(52, 211, 153, 0.15); color: var(--accent-green); border: 1px solid rgba(52, 211, 153, 0.3); }
    .status-failed { background: rgba(248, 113, 113, 0.15); color: var(--accent-red); border: 1px solid rgba(248, 113, 113, 0.3); }
    .test-name { font-weight: 600; font-size: 1rem; color: #fff; }
    .test-duration { font-family: var(--font-mono); font-size: 0.825rem; color: var(--text-muted); background: rgba(0,0,0,0.25); padding: 0.2rem 0.5rem; border-radius: 4px; }

    .test-body {
      padding: 1.35rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      background: #111827;
    }

    /* Section Headings inside Card */
    .section-title {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-cyan);
      font-weight: 700;
      margin: 1rem 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .section-title:first-child { margin-top: 0; }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.75rem 0 1.25rem 0;
      font-size: 0.875rem;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    th {
      background: #1f293d;
      color: var(--text-secondary);
      font-weight: 700;
      text-align: left;
      padding: 0.7rem 1rem;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 0.7rem 1rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      color: var(--text-primary);
    }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background: rgba(30, 41, 59, 0.35); }
    a { color: var(--accent-blue); text-decoration: none; word-break: break-all; font-weight: 500; }
    a:hover { text-decoration: underline; color: #7dd3fc; }

    /* Step Timeline */
    .step-list {
      list-style: none;
      margin: 0.75rem 0 1.25rem 0;
      border-left: 2px solid var(--border);
      padding-left: 1.25rem;
    }
    .step-item {
      position: relative;
      margin-bottom: 0.65rem;
      font-size: 0.875rem;
    }
    .step-item::before {
      content: '';
      position: absolute;
      left: -1.6rem;
      top: 0.35rem;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-green);
    }
    .step-item.failed::before { background: var(--accent-red); }
    .step-title { font-weight: 500; color: #e2e8f0; }
    .step-dur { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem; }

    /* Console Logs Accordion */
    details.console-accordion {
      margin-top: 1rem;
      background: #090d16;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    details.console-accordion summary {
      padding: 0.6rem 1rem;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: #141e33;
      user-select: none;
    }
    details.console-accordion summary:hover { color: #fff; }
    .console-box {
      padding: 1rem;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      line-height: 1.6;
      color: #93c5fd;
      white-space: pre-wrap;
      max-height: 350px;
      overflow-y: auto;
    }
    .error-msg {
      background: rgba(248, 113, 113, 0.1);
      border-left: 3px solid var(--accent-red);
      padding: 0.85rem 1.1rem;
      margin-bottom: 1rem;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: #fca5a5;
      white-space: pre-wrap;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <div class="brand-title">
          <span class="brand-badge">Executive View</span>
          <h1>Hawk Search Sanity Test Dashboard</h1>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.925rem; margin-top: 0.35rem;">
          Production verification suite across 5 multi-tenant Auto Parts platforms
        </p>
      </div>
      <div class="header-meta">
        <div>Executed at: <span>${new Date(s.timestamp).toLocaleString()}</span></div>
        <div>Total Duration: <span>${durationSec}s</span></div>
      </div>
    </header>

    <!-- KPI Section -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-total">
        <div class="kpi-title">Total Tests Executed</div>
        <div class="kpi-value">${s.total}</div>
        <div class="kpi-sub">Across 5 Production Sites</div>
      </div>
      <div class="kpi-card kpi-pass">
        <div class="kpi-title">Passed Tests</div>
        <div class="kpi-value" style="color: var(--accent-green);">${s.passed}</div>
        <div class="kpi-sub">${passRate}% Pass Rate</div>
      </div>
      <div class="kpi-card kpi-fail">
        <div class="kpi-title">Failed Tests</div>
        <div class="kpi-value" style="color: var(--accent-red);">${s.failed}</div>
        <div class="kpi-sub">${s.skipped} Skipped / Timed Out</div>
      </div>
      <div class="kpi-card kpi-rate">
        <div class="kpi-title">Execution Duration</div>
        <div class="kpi-value" style="color: var(--accent-indigo);">${durationSec}s</div>
        <div class="kpi-sub">Sequential Single Worker</div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <div class="site-filters">
        <button class="filter-btn active" onclick="filterSite('all')">All Sites (${sites.length})</button>
        ${sites.map((site) => `<button class="filter-btn" onclick="filterSite('${site}')">${site}</button>`).join('')}
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <input type="text" id="searchInput" class="search-input" placeholder="Search tests, categories, links..." onkeyup="searchTests()">
        <button class="action-btn" onclick="toggleAllDetails()">Toggle Details</button>
      </div>
    </div>

    <!-- Test List Grouped by Site -->
    <div id="testContainer">
      ${sites.map((site) => {
        const siteTests = data.tests.filter((t) => t.siteName === site);
        return `
          <div class="site-section" data-site="${site}">
            <div class="site-header">
              <span style="font-size: 1.35rem;">🏢</span>
              <h2 class="site-title">${site}</h2>
              <span style="color: var(--text-muted); font-size: 0.875rem;">(${siteTests.length} tests)</span>
            </div>
            ${siteTests.map((t) => `
              <div class="test-card" data-title="${t.title.toLowerCase()}">
                <div class="test-header" onclick="toggleCardBody(this)">
                  <div class="test-info">
                    <span class="status-pill status-${t.status}">${t.status}</span>
                    <span class="test-name">${t.title}</span>
                  </div>
                  <span class="test-duration">${(t.duration / 1000).toFixed(1)}s</span>
                </div>
                <div class="test-body">
                  ${t.error ? `<div class="error-msg"><strong>Error:</strong><br>${escapeHtml(t.error)}</div>` : ''}
                  
                  <!-- Structured Tables from Attachments -->
                  ${t.attachments.map((att) => `
                    <div class="attachment-section">
                      ${markdownToHtml(att.body)}
                    </div>
                  `).join('')}

                  <!-- Step Execution Timeline -->
                  ${t.steps && t.steps.length > 0 ? `
                    <div class="section-title">⏱ Step-by-Step Execution Timeline</div>
                    <ul class="step-list">
                      ${renderStepsHtml(t.steps)}
                    </ul>
                  ` : ''}

                  <!-- Console & Terminal Logs -->
                  ${t.stdout ? `
                    <details class="console-accordion">
                      <summary>📋 View Console & Terminal Output</summary>
                      <div class="console-box">${escapeHtml(t.stdout)}</div>
                    </details>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
    </div>
  </div>

  <script>
    function filterSite(site) {
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.includes(site) || (site === 'all' && btn.innerText.includes('All')));
      });
      document.querySelectorAll('.site-section').forEach(sec => {
        if (site === 'all' || sec.getAttribute('data-site') === site) {
          sec.style.display = 'block';
        } else {
          sec.style.display = 'none';
        }
      });
    }

    function searchTests() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      document.querySelectorAll('.test-card').forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(q) ? 'block' : 'none';
      });
    }

    function toggleCardBody(headerEl) {
      const bodyEl = headerEl.nextElementSibling;
      if (bodyEl) {
        bodyEl.style.display = bodyEl.style.display === 'none' ? 'block' : 'none';
      }
    }

    let allExpanded = true;
    function toggleAllDetails() {
      allExpanded = !allExpanded;
      document.querySelectorAll('.test-body').forEach(b => {
        b.style.display = allExpanded ? 'block' : 'none';
      });
    }
  </script>
</body>
</html>`;
  }
}

/**
 * Renders hierarchical step list HTML
 * @param {TestStepItem[]} steps
 * @returns {string}
 */
function renderStepsHtml(steps) {
  return steps
    .map((s) => {
      const durSec = (s.duration / 1000).toFixed(2);
      const isFailed = !!s.error;
      let html = `<li class="step-item ${isFailed ? 'failed' : ''}">`;
      html += `<span class="step-title">${escapeHtml(s.title)}</span>`;
      html += `<span class="step-dur">(${durSec}s)</span>`;
      if (s.steps && s.steps.length > 0) {
        html += `<ul class="step-list">${renderStepsHtml(s.steps)}</ul>`;
      }
      html += `</li>`;
      return html;
    })
    .join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToHtml(md) {
  if (!md) return '';
  let html = md;

  // Convert markdown headers
  html = html.replace(/### (.*)/g, '<div class="section-title">$1</div>');
  html = html.replace(/## (.*)/g, '<div class="section-title">$1</div>');
  html = html.replace(/# (.*)/g, '<div class="section-title">$1</div>');

  // Convert markdown links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Convert bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Convert markdown tables
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  const newLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHtml = '<table><tbody>';
      }
      if (trimmed.includes('---')) {
        continue;
      }
      const cells = trimmed.split('|').slice(1, -1);
      const isHeader = !tableHtml.includes('<tr>');
      const tag = isHeader ? 'th' : 'td';
      tableHtml += '<tr>' + cells.map((c) => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    } else {
      if (inTable) {
        tableHtml += '</tbody></table>';
        newLines.push(tableHtml);
        inTable = false;
        tableHtml = '';
      }
      newLines.push(line);
    }
  }
  if (inTable) {
    tableHtml += '</tbody></table>';
    newLines.push(tableHtml);
  }

  return newLines.join('\n');
}

module.exports = ExecutiveDashboardReporter;
