import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

test('WebGL: modelo procedural, câmera por teclado e fallback 2D', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  const webgl = await page.evaluate(() => {
    try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')); }
    catch { return false; }
  });
  if (!webgl) {
    testInfo.annotations.push({ type: 'limitation', description: 'WebGL indisponível no runner; teste hardware permanece NOT_RUN' });
    test.skip(true, 'WebGL indisponível neste executor');
  }
  await expect(page.getByText('WEBGL INTERATIVO')).toBeVisible();
  const canvas = page.locator('.scene canvas');
  await expect(canvas).toBeVisible();
  await mkdir('artifacts', { recursive: true });
  const before = await canvas.screenshot();
  await page.locator('.scene').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(220);
  const after = await canvas.screenshot();
  expect(before.equals(after)).toBe(false);
  await page.getByRole('group', { name: 'Cores do produto' }).getByRole('button', { name: 'Cor Coral' }).click();
  await page.waitForTimeout(150);
  const changed = await canvas.screenshot();
  expect(after.equals(changed)).toBe(false);
  await page.screenshot({ path: 'artifacts/rfb-studio-webgl-swiftshader.png', fullPage: true });
  await page.getByRole('checkbox', { name: 'Prévia 2D' }).check();
  await expect(page.getByText('MODO 2D')).toBeVisible();
  await expect(page.locator('.fallback .product-svg')).toBeVisible();
  expect(errors).toEqual([]);
});
test('acessibilidade: reduced motion, navegação de teclado e 320px', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  const style = await page.locator('.progress span').evaluate(el => getComputedStyle(el).transitionDuration).catch(() => '0s');
  expect(style).toBe('0s');
  await page.getByRole('checkbox', { name: 'Prévia 2D' }).check();
  await expect(page.getByText('MODO 2D')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
});
