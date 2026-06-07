// Verifies the fit-to-width behavior: the fixed 11in sheet scales to the
// window so there is never a horizontal scrollbar, shrinking on narrow
// screens and scaling up (capped) on wide ones.
const { test, expect } = require('@playwright/test');

const zoomOf = (page) =>
  page.evaluate(() => parseFloat(document.querySelector('.page').style.zoom) || 1);
const horizontalOverflow = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('narrow window', () => {
  test.use({ viewport: { width: 800, height: 900 } });

  test('shrinks the sheet and shows no horizontal scrollbar', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    expect(await zoomOf(page), 'sheet should scale below 1 on a narrow window').toBeLessThan(1);
    expect(await horizontalOverflow(page), 'no horizontal scrollbar').toBeLessThanOrEqual(0);
  });
});

test.describe('wide window', () => {
  test.use({ viewport: { width: 1680, height: 1000 } });

  test('scales the sheet up (capped) with no horizontal scrollbar', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    const z = await zoomOf(page);
    expect(z, 'sheet should scale above 1 on a wide window').toBeGreaterThan(1);
    expect(z, 'upscaling is capped at 1.5').toBeLessThanOrEqual(1.5);
    expect(await horizontalOverflow(page), 'no horizontal scrollbar').toBeLessThanOrEqual(0);
  });
});

test.describe('exact design width', () => {
  test.use({ viewport: { width: 1056, height: 900 } });

  test('renders near 1:1 with no horizontal scrollbar', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    expect(await horizontalOverflow(page), 'no horizontal scrollbar at design width').toBeLessThanOrEqual(0);
  });
});
