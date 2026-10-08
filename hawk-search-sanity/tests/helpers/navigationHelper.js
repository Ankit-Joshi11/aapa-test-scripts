// tests/helpers/navigationHelper.js
// ─────────────────────────────────────────────────────────────────────────────
// Pure utility functions used across tests.
// No Playwright imports – these are plain JS helpers so they are easy to
// unit-test and reuse in future test files.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

/**
 * Randomly picks `count` unique items from `arr` (no repeats).
 * If `count` is larger than `arr.length`, the entire array is returned.
 *
 * @param {Array}  arr   - Source array
 * @param {number} count - How many items to pick
 * @returns {Array} Randomly selected items
 *
 * @example
 * pickRandom(['a', 'b', 'c', 'd'], 2) // → ['c', 'a']  (random order)
 */
function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * Cleans a raw link label collected from the DOM:
 *  - Strips Material Icon text (e.g. "keyboard_arrow_right", "home")
 *  - Collapses excess whitespace and newlines
 *
 * @param {string} rawText - Raw textContent from a DOM element
 * @returns {string} Cleaned label
 */
function cleanLinkName(rawText) {
  return (rawText || '')
    .replace(/keyboard_arrow_right/g, '')
    .replace(/keyboard_arrow_left/g, '')
    .replace(/keyboard_arrow_down/g, '')
    .replace(/keyboard_arrow_up/g, '')
    .replace(/chevron_right/g, '')
    .replace(/chevron_left/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts significant words (length > 3, alpha-numeric only) from a name
 * string so we can do a flexible "at least one word present" page check.
 *
 * @param {string} name - Subcategory or category label
 * @returns {string[]} Significant lowercase words
 *
 * @example
 * getSignificantWords('Brackets, Flanges and Hangers')
 * // → ['brackets', 'flanges', 'hangers']
 */
function getSignificantWords(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

/**
 * Returns true if at least one significant word from `name` appears inside
 * `pageText` (case-insensitive). Falls back to true when no significant words
 * exist (nothing meaningful to validate).
 *
 * @param {string} name     - Category / subcategory label
 * @param {string} pageText - Full page body text (lowercased expected)
 * @returns {boolean}
 */
function nameAppearsOnPage(name, pageText) {
  const words = getSignificantWords(name);
  if (words.length === 0) return true; // nothing to check
  return words.some((word) => pageText.toLowerCase().includes(word));
}

module.exports = {
  pickRandom,
  cleanLinkName,
  getSignificantWords,
  nameAppearsOnPage,
};
