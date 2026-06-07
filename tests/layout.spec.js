// Layout regression suite for the Agentic AI Control Plane diagram.
// Each assertion locks in a fix made during the design/cleanup passes so the
// fixed-width (11in / 1056px) print layout can never silently regress.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'networkidle' });
});

test('content does not overflow the 11in page box', async ({ page }) => {
  // Viewport-independent: the .page box itself must not scroll horizontally.
  // (Comparing against window width would falsely flag the centered side margins.)
  const overflow = await page.evaluate(() => {
    const el = document.querySelector('.page');
    return el.scrollWidth - el.clientWidth;
  });
  expect(overflow, 'no element may extend past the page box').toBeLessThanOrEqual(0);
});

test('flow and boundary have zero internal overflow', async ({ page }) => {
  const r = await page.evaluate(() => {
    const flow = document.querySelector('.flow');
    const boundary = document.querySelector('.boundary');
    return {
      flow: flow.scrollWidth - flow.clientWidth,
      boundary: boundary.scrollWidth - boundary.clientWidth,
    };
  });
  expect(r.flow, '.flow row must not overflow').toBe(0);
  expect(r.boundary, '.boundary must not overflow').toBe(0);
});

test('data-foundation labels fit inside their boxes (HARMONIZED)', async ({ page }) => {
  const r = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll('.z-data .bx')];
    return boxes.map((b) => {
      const t = b.querySelector('.bxt');
      return { label: t.textContent.trim(), overflow: t.scrollWidth - b.clientWidth };
    });
  });
  for (const box of r) {
    expect(box.overflow, `"${box.label}" must fit inside its box`).toBeLessThanOrEqual(0);
  }
});

test('the three box rows are internally even', async ({ page }) => {
  const r = await page.evaluate(() => {
    const widths = (sel) => [...document.querySelectorAll(`${sel} .bx`)].map((b) => b.clientWidth);
    return { agent: widths('.z-agent'), tools: widths('.z-tools'), data: widths('.z-data') };
  });
  for (const [zone, ws] of Object.entries(r)) {
    expect(new Set(ws).size, `${zone} boxes should be equal width`).toBe(1);
  }
});

test('the three column headers share one alignment line', async ({ page }) => {
  const tops = await page.evaluate(() => {
    const top = (sel) => Math.round(document.querySelector(sel).getBoundingClientRect().top);
    return {
      sources: top('.col-src .band-label'),
      actionGov: top('.gate .band-label'),
      actPublish: top('.col-pub .band-label'),
    };
  });
  const spread = Math.max(...Object.values(tops)) - Math.min(...Object.values(tops));
  expect(spread, `headers should align (got ${JSON.stringify(tops)})`).toBeLessThanOrEqual(2);
});

test('boundary title stays on one line with subtitle below', async ({ page }) => {
  const r = await page.evaluate(() => {
    const title = document.querySelector('.bl-title');
    const sub = document.querySelector('.bl-sub');
    return {
      titleH: Math.round(title.getBoundingClientRect().height),
      titleOverflow: title.scrollWidth - title.clientWidth,
      subBelow: sub.getBoundingClientRect().top > title.getBoundingClientRect().top,
    };
  });
  expect(r.titleH, 'title should be a single line').toBeLessThan(20);
  expect(r.titleOverflow, 'title text must not clip').toBeLessThanOrEqual(0);
  expect(r.subBelow, '(account boundary) should sit below the title').toBe(true);
});

test('the Natoma gate text fits inside its dashed box', async ({ page }) => {
  const overflow = await page.evaluate(() => {
    const inner = document.querySelector('.gate-inner');
    return inner.scrollWidth - inner.clientWidth;
  });
  expect(overflow, 'gate content must not overflow').toBeLessThanOrEqual(0);
});

test('a favicon is declared (no 404)', async ({ page }) => {
  const fav = await page.getAttribute('link[rel="icon"]', 'href');
  expect(fav, 'an icon link must be present').toBeTruthy();
  expect(fav.startsWith('data:image/svg'), 'favicon should be a self-contained data URI').toBe(true);
});

test('page loads with no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('requestfailed', (req) => errors.push(`requestfailed: ${req.url()}`));
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  expect(errors, `console errors: ${errors.join(' | ')}`).toEqual([]);
});
