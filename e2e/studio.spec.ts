import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { createTriangleGLB } from '../src/fixture-glb';

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


test('presets, qualidade reduzida e importação GLB local sem autorização comercial', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: 'Presets' }).click();
  await expect(page.getByRole('heading', { name: 'Aura Metal' })).toBeVisible();
  await page.getByRole('button', { name: 'Usar este preset' }).nth(1).click();
  await expect(page.getByRole('heading', { name: 'Garrafa Aura' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Qualidade reduzida' }).check();
  await page.getByRole('group', { name: /Visualizador/ }).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('+');

  const bytes = Buffer.from(createTriangleGLB());
  await page.getByLabel('Arquivo GLB local').setInputFiles({ name: 'original-demo.glb', mimeType: 'model/gltf-binary', buffer: bytes });
  await expect(page.getByText(/GLB carregado localmente/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho demo' })).toBeDisabled();
  await page.getByRole('button', { name: 'Remover GLB local' }).click();
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho demo' })).toBeEnabled();
});


test('responsividade 320 a 1440px sem rolagem horizontal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('checkbox', { name: 'Prévia 2D' }).check();
  await mkdir('artifacts', { recursive: true });
  for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('navigation', { name: 'Seções do estúdio' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar design local' })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'overflow horizontal na largura ' + width).toBeLessThanOrEqual(1);
    if ([320, 430, 768, 1024].includes(width)) {
      await page.screenshot({ path: 'artifacts/rfb-studio-responsive-' + width + '.png', fullPage: true });
    }
  }
});

test('privacidade: backup local, exclusão confirmada, importação e aviso offline', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Salvar design local' }).click();
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: 'Privacidade' }).click();
  await expect(page.getByText('Designs locais', { exact: true })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar backup local JSON' }).click();
  const backup = await download;
  expect(backup.suggestedFilename()).toBe('rfb-studio-backup-local.json');
  const { readFile } = await import('node:fs/promises');
  const body = await readFile(await backup.path());
  expect(JSON.parse(body.toString()).workspace.designs).toHaveLength(1);
  const deleteButton = page.getByRole('button', { name: 'Excluir todos os dados locais' });
  await expect(deleteButton).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Confirmo que desejo apagar meus registros locais.' }).check();
  await deleteButton.click();
  await expect(page.getByText('Registros locais excluídos.', { exact: false })).toBeVisible();
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: 'Meus designs' }).click();
  await expect(page.getByText('Nenhum design salvo.', { exact: false })).toBeVisible();
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: 'Privacidade' }).click();
  await page.getByLabel('Restaurar backup JSON').setInputFiles({
    name: 'backup.json', mimeType: 'application/json', buffer: body,
  });
  await expect(page.getByText('Backup local restaurado neste navegador.')).toBeVisible();
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: 'Meus designs' }).click();
  await expect(page.getByRole('heading', { name: 'Meu design' })).toBeVisible();
  await page.context().setOffline(true);
  await expect(page.getByText('Sem conexão:', { exact: false })).toBeVisible();
  await page.context().setOffline(false);
  await expect(page.getByText('Sem conexão:', { exact: false })).toHaveCount(0);
});

test('exportação SVG 2D preserva o acessório selecionado', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Acessório / personalização').selectOption('alca');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar prévia 2D SVG' }).click();
  const artifact = await pending;
  expect(artifact.suggestedFilename()).toBe('rfb-studio-previa-2d.svg');
  const { readFile } = await import('node:fs/promises');
  const svg = (await readFile(await artifact.path())).toString();
  expect(svg).toContain('<ellipse cx="194" cy="112"');
  expect(svg).toContain('viewBox="0 0 280 330"');
});

test('orçamento: cria e baixa resumo TXT não vinculante sem envio de mensagens', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Adicionar ao carrinho demo' }).click();
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: 'Carrinho' }).click();
  await page.getByRole('button', { name: 'Gerar orçamento demonstrativo' }).click();
  const waiting = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Preparar resumo TXT para envio manual' }).click();
  const file = await waiting;
  expect(file.suggestedFilename()).toMatch(/^rfb-orcamento-demo-[a-z0-9]+\.txt$/);
  const { readFile } = await import('node:fs/promises');
  const text = (await readFile(await file.path())).toString();
  expect(text).toContain('SIMULAÇÃO SEM VALIDADE COMERCIAL');
  expect(text).toContain('Garrafa Aura');
  expect(text).toContain('TOTAL ILUSTRATIVO');
  expect(text).toContain('exclusivamente manual');
});
