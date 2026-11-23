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
