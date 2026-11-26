import { test, expect } from '@playwright/test';

/**
 * Automated semantic accessibility smoke tests. These are NOT an audit
 * substituting for screen-reader, WCAG contrast or mobile hardware sessions.
 */
test('landmarks, language, and named form controls in core workflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  const tabs = ['Estúdio', 'Catálogo', 'Meus designs', 'Carrinho', 'Orçamentos',
    'Painel demo', 'Privacidade', 'Ajuda', 'Minha conta'];
  for (const tab of tabs) {
    await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: tab, exact: true }).click();
    const problems = await page.evaluate(() => {
      const visible = (el: Element) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const failures: string[] = [];
      const ids = new Set<string>();
      for (const element of document.querySelectorAll('[id]')) {
        if (ids.has(element.id)) failures.push('duplicate-id:' + element.id);
        ids.add(element.id);
      }
      for (const node of document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input,select,textarea')) {
        if (!visible(node) || node.type === 'hidden') continue;
        const accessible = node.labels?.length || node.getAttribute('aria-label')?.trim() ||
          node.getAttribute('aria-labelledby')?.trim() ||
          (node.getAttribute('title')?.trim());
        if (!accessible) failures.push('unlabelled-control:' + node.outerHTML.slice(0, 150));
      }
      for (const node of document.querySelectorAll('button')) {
        if (!visible(node)) continue;
        const accessible = node.getAttribute('aria-label')?.trim() ||
          node.getAttribute('aria-labelledby')?.trim() || node.textContent?.trim();
        if (!accessible) failures.push('unlabelled-button:' + node.outerHTML.slice(0, 150));
      }
      return failures;
    });
    expect(problems, 'A11y smoke errors in ' + tab).toEqual([]);
  }
});

test('FAQ and 404 have meaningful headings and keyboard-accessible navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Seções do estúdio' }).getByRole('button', { name: 'Ajuda' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Como usar o RFB Studio' })).toBeVisible();
  await page.getByText('O que fazer se o 3D não abrir?').click();
  await expect(page.getByText('O aplicativo usa prévia SVG 2D', { exact: false })).toBeVisible();
  await page.goto('/caminho-desconhecido');
  await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible();
  await page.getByRole('link', { name: 'Voltar ao início' }).focus();
  await expect(page.getByRole('link', { name: 'Voltar ao início' })).toBeFocused();
});
