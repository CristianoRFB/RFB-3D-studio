# RFB Studio — handoff verificável

**Data:** 22/11/2026 (America/Sao_Paulo)
**Repo:** CristianoRFB/RFB-3D-studio; branch: feature/rfb-starter-pack-v1; PR #1 draft; SHA de entrada: 23035611c2da8dd86f86228231c0a0fabbe32ed4.

## Fatia atual S002

Trocar o roteiro estático G1 por um configurador visual com modelo original procedural (Garrafa Aura); opção de cor/acabamento, interação orbit/pan/zoom por ponteiro e teclado, qualidade reduzida e fallback 2D. Preservar o roteiro original em `<details>`, sem simular autenticação/orçamento/envio. Dados locais são demonstrativos.

## Limitações e próximos passos

1. Consultar HEAD, PR e Issues ao retomar; conferir CI do commit mais recente.
2. Executar `npm install`, versionar `package-lock.json`, `npm run typecheck`, `npm run test`, `npm run build`. Falha deve ser registrada e corrigida pelo erro real.
3. QA no navegador WebGL disponível e desativado; mobile 320/390, desktop 1440; capturar screenshot real e checar atalhos, contraste e reduced motion.
4. S003: precificação determinística de catálogo sintético e regras de incompatibilidade; nunca confiar em preços de cliente. Não adicionar Firebase/cobrança sem decisão.
5. NÃO mesclar PR nem publicar em produção até gates comprovados.

**Riscos:** AV-01, AV-02, AV-09, AV-12, AV-16; gates de QA abertos. Assets e licenças em docs/ASSETS-LICENSES.md. Checkpoint de commit SHA final deve ser conferido no GitHub.

## Checkpoint S002 — evidência CI

- Commit de implementação: [77856b1](https://github.com/CristianoRFB/RFB-3D-studio/commit/77856b1f6c41a6a1465b9a9ec53f31d410c58219) na branch do PR #1, sem merge.
- GitHub Actions [run 45091528752](https://github.com/CristianoRFB/RFB-3D-studio/actions/runs/45091528752): instalação PASS; Typecheck PASS; Vitest PASS; Build PASS.
- **NOT_RUN:** Playwright, screenshot real, WebGL on/off, verificação em mobile. Lockfile não versionado.
- Alterações documentais posteriores exigem nova confirmação do HEAD/CI.
