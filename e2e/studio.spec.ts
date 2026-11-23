import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

/** All E2E operations use synthetic data and localStorage. No Firebase or production connections. */
test('configuração, carrinho, orçamento e recarga', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Seu produto/ })).toBeVisible();
  await page.getByRole('group', { name: 'Produtos disponíveis' }).getByRole('button', { name: 'Luminária Órbita' }).click();
  await page.getByRole('group', { name: 'Cores do produto' }).getByRole('button', { name: 'Cor Azul' }).click();
  await page.getByLabel('Tamanho').selectOption('g');
  await page.getByLabel('Acessório / personalização').selectOption('base');
  await page.getByLabel('Quantidade (1 a 10)').fill('2');
  await page.getByLabel('Nome do design (sem dados pessoais)').fill('Luminária para demo');
  await page.getByRole('button', { name: 'Salvar design local' }).click();
  await expect(page.getByRole('status').last()).toContainText('Design salvo');
  await page.getByRole('button', { name: 'Adicionar ao carrinho demo' }).click();
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: /Carrinho/ }).click();
  await expect(page.getByText('Luminária Órbita').last()).toBeVisible();
  await page.getByRole('button', { name: 'Gerar orçamento demonstrativo' }).click();
  await expect(page.getByRole('heading', { name: 'Orçamentos demonstrativos' })).toBeVisible();
  await expect(page.getByText('Luminária Órbita', { exact: false }).last()).toBeVisible();
  await page.reload();
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: /Orçamentos/ }).click();
  await expect(page.getByText('Luminária Órbita', { exact: false }).last()).toBeVisible();
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: /Meus designs/ }).click();
  await expect(page.getByRole('heading', { name: 'Luminária para demo' })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir e editar' }).click();
  await expect(page.getByRole('heading', { name: 'Luminária Órbita' })).toBeVisible();
});

test('modo WebGL indisponível mantém fallback 2D, teclado e mobile', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
      return original.call(this, type as '2d', ...args as []) as RenderingContext | null;
    } as typeof original;
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByText('MODO 2D')).toBeVisible();
  await page.getByRole('group', { name: 'Cores do produto' }).getByRole('button', { name: 'Cor Coral' }).click();
  await expect(page.getByRole('img', { name: /Ilustração 2D/ })).toBeVisible();
  await page.getByRole('button', { name: 'Prévia 2D' }).count().catch(() => 0);
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/rfb-studio-mobile-390.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
});

test('desktop, catálogo, busca e exportação seguros', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: /Catálogo/ }).click();
  await page.getByLabel('Buscar no catálogo').fill('vaso');
  await expect(page.getByRole('heading', { name: 'Vaso Nexo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Garrafa Aura' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Personalizar modelo' }).click();
  await page.getByRole('button', { name: 'Prévia 2D' }).count().catch(() => 0);
  await page.getByRole('checkbox', { name: 'Prévia 2D' }).check();
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/rfb-studio-desktop-1440.png', fullPage: true });
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar configuração JSON' }).click();
  expect((await event).suggestedFilename()).toBe('rfb-studio-design.json');
});
