import { test, expect } from '@playwright/test';

test('Firebase Emulator: cadastro, salvamento, reload e segregação de contas', async ({ page }) => {
  // CI executes this test only inside Firebase Authentication + Firestore emulators.
  const alice = 'alice-rfb-studio@test.invalid';
  const bob = 'bob-rfb-studio@test.invalid';
  const password = 'RfbDemoPassword2026!';
  await page.goto('/');
  const cloudButton = page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: 'Minha conta' });
  await cloudButton.click();
  await expect(page.getByRole('heading', { name: 'Meus designs na nuvem' })).toBeVisible();
  await expect(page.getByText('SEM SESSÃO')).toBeVisible();
  await page.getByLabel('E-mail').fill(alice);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByText('Conta conectada:', { exact: false })).toContainText(alice);
  await page.getByRole('button', { name: 'Salvar configuração atual na nuvem' }).click();
  await expect(page.getByRole('heading', { name: 'Meu design' })).toBeVisible();
  await page.reload();
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: 'Minha conta' }).click();
  await expect(page.getByRole('heading', { name: 'Meu design' })).toBeVisible();
  const pendingDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar amostra da nuvem (JSON)' }).click();
  const exported = await pendingDownload;
  expect(exported.suggestedFilename()).toBe('rfb-studio-nuvem-amostra.json');
  const { readFile } = await import('node:fs/promises');
  const content = JSON.parse((await readFile(await exported.path())).toString());
  expect(content.kind).toBe('RFB_STUDIO_USER_SNAPSHOT');
  expect(content.designs).toHaveLength(1);
  expect(content.scope).toBe('first_30_records_per_collection');
  expect(JSON.stringify(content)).not.toContain('RfbDemoPassword2026!');
    await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page.getByText('SEM SESSÃO')).toBeVisible();
  await page.getByLabel('E-mail').fill(bob);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByText('Conta conectada:', { exact: false })).toContainText(bob);
  await expect(page.getByRole('heading', { name: 'Meu design' })).toHaveCount(0);
  await expect(page.getByText('Nenhum design disponível nesta conta.')).toBeVisible();
  await page.getByRole('button', { name: 'Sair' }).click();
  await page.getByLabel('E-mail').fill(alice);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Meu design' })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir no estúdio' }).click();
  await expect(page.getByRole('heading', { name: 'Garrafa Aura' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: 'Minha conta' }).click();
  await expect(page.getByRole('button', { name: 'Salvar edição na nuvem' })).toBeVisible();
});

test('Firebase Emulator: conflito de edição entre duas sessões não sobrescreve sem autorização', async ({ page, browser }) => {
  const alice = 'conflict-alice-rfb@test.invalid';
  const password = 'RfbDemoPassword2026!';
  const nav = (target: typeof page) => target.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: 'Minha conta' });
  await page.goto('/'); await nav(page).click();
  await page.getByLabel('E-mail').fill(alice);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByText('Conta conectada:', { exact: false })).toContainText(alice);
  await page.getByRole('button', { name: 'Salvar configuração atual na nuvem' }).click();
  await expect(page.getByRole('heading', { name: 'Meu design' })).toBeVisible();

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  try {
    await page2.goto('/'); await nav(page2).click();
    await page2.getByLabel('E-mail').fill(alice);
    await page2.getByLabel('Senha').fill(password);
    await page2.getByRole('button', { name: 'Entrar' }).click();
    await expect(page2.getByRole('heading', { name: 'Meu design' })).toBeVisible();
    await page.getByRole('button', { name: 'Abrir no estúdio' }).click();
    await page2.getByRole('button', { name: 'Abrir no estúdio' }).click();
    await nav(page).click(); await nav(page2).click();
    await page.getByLabel('Nome do design').fill('Versão Alice');
    await page.getByRole('button', { name: 'Salvar edição na nuvem' }).click();
    await expect(page.getByRole('heading', { name: 'Versão Alice' })).toBeVisible();
    await page2.getByLabel('Nome do design').fill('Versão local concorrente');
    await page2.getByRole('button', { name: 'Salvar edição na nuvem' }).click();
    await expect(page2.getByText('Este design foi alterado em outra sessão.', { exact: false })).toBeVisible();
    await expect(page2.getByRole('button', { name: 'Salvar como cópia nova' })).toBeVisible();
    await page2.getByRole('button', { name: 'Salvar como cópia nova' }).click();
    await expect(page2.getByRole('heading', { name: 'Versão local concorrente (cópia)' })).toBeVisible();
    await expect(page2.getByRole('heading', { name: 'Versão Alice' })).toBeVisible();
  } finally { await context2.close(); }
});
