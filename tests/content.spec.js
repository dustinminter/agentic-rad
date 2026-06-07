// Content/brand-rule checks that do not need a browser render.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('no em dash or en dash anywhere (Archetype brand rule)', () => {
  const emDash = html.indexOf('—');
  const enDash = html.indexOf('–');
  expect(emDash, 'em dash (U+2014) is banned; use parentheses, colon, or comma').toBe(-1);
  expect(enDash, 'en dash (U+2013) is banned; use a hyphen').toBe(-1);
});

test('document declares the expected title and metadata', () => {
  expect(html).toContain('<title>Agentic AI Control Plane');
  expect(html).toContain('property="og:title"');
  expect(html).toContain('name="theme-color"');
});
