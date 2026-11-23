# RFB Studio — execução RFB Method (checkpoint 23/11/2026)

**Repo:** `CristianoRFB/RFB-3D-studio` · **branch:** `feature/rfb-starter-pack-v1` · [PR #1 Draft](https://github.com/CristianoRFB/RFB-3D-studio/pull/1). A homologação abaixo é por camada: testes sintéticos e de emuladores não provam operação comercial.

| Fatia | Entrega implementada | Evidência executada | Lacuna |
|---|---|---|---|
| S001/G0 | Fonte original, 7 diagramas, 58 T-IDs, 4 concorrentes/soluções pesquisadas | GitHub docs + URLs oficiais | Validar público real e licenças dos PNGs de origem |
| S002 | 3 modelos 3D procedurais, câmera por teclado/ponteiro, materiais, acessórios, tamanhos, fallback 2D e export PNG | Chromium + SwiftShader render/pixel diff, E2E PNG e SVG | GPU/celulares físicos, perda de contexto em hardware, perfil de memória |
| S003 | Regras de compatibilidade, preço sintético em centavos, quantidades e presets | Vitest adversarial + E2E de variantes | Produtos, regras e preços comerciais autorizados |
| S004 | Designs locais, backup/restore/clear, histórico, offline, autenticação Firebase e designs Firestore com revisão | Auth Emulator com contas Alice/Bob + 40 Rules Emulator + E2E local | Projeto Firebase Spark real, políticas LGPD de conta e backup remoto |
| S005 | Carrinho, simulação, quote API com JWT, preço do servidor, rate binding obrigatório, idempotência e sem envio real | Vitest negativos e testes de UI/Worker simulados | Firestore REST/service account, Rate Limiting, OAuth e runtime Worker NÃO testados em ambiente real |
| S006 | GLB local glTF 2 validado, biblioteca de modelos com roles e tenant, política de owner na atualização | Vitest de GLB, E2E importação, regras RBAC em emulador | Upload comercial, licenças, armazenamento e atribuição de custom claims em projeto real |
| G5 | A11y básica, sete larguras responsivas, `prefers-reduced-motion`, controle de gzip, npm audit | CI Chromium/SwiftShader, 320–1440 px, orçamento de JS | WCAG 2.2 completa, Lighthouse/RUM, dispositivos físicos |
| G6 | GitHub PR e artefatos compilados/screenshots de QA | GitHub Actions + evidências no commit | Cloudflare preview/produção **não implantados**, sem merge `main` |

## Resultados concretos de CI

**Código mais recente testado e confirmado:** commit [`35f822ca`](https://github.com/CristianoRFB/RFB-3D-studio/commit/35f822caeacdcc067a972fa32f7fe2413caf74f1), execução [`45179480137`](https://github.com/CristianoRFB/RFB-3D-studio/actions/runs/45179480137):

- `npm ci`, TypeScript e build Vite: PASS.
- Vitest: **24 testes**, 8 arquivos: PASS.
- `npm audit --omit=dev --audit-level=high`: PASS no ambiente da execução; não é prova de ausência de qualquer vulnerabilidade.
- Firestore Emulator: **40 verificações de autorização/esquema**, incluindo tenant e owner: PASS.
- Playwright Chromium: **7 E2E** do estúdio, mais **2 E2E WebGL/reduced motion**, mais **1 E2E de autenticação/isolamento no Firebase Emulator**: PASS.
- JS gzip: **340,0 KiB inicial; 516,7 KiB total**, abaixo dos limites de 420/650 KiB definidos no projeto.
- Artefatos `rfb-studio-dist` e `rfb-studio-browser-qa`: builds e screenshots de teste, **não endereços de produção**.

**IMPORTANTE:** commits posteriores ao SHA acima (como pesquisa e docs) precisam do próprio CI antes de se afirmar PASS no HEAD final. `PROJECT_STATUS.json` guarda a última revisão de código comprovada.

## Bloqueadores e STOP

- [Issue #2](https://github.com/CristianoRFB/RFB-3D-studio/issues/2): nenhum projeto Firebase real ou custom claims provisionados, nenhum teste LGPD/backup de conta real.
- [Issue #3](https://github.com/CristianoRFB/RFB-3D-studio/issues/3): quote API autenticada tem testes simulados, mas ambiente de Worker, credenciais e Firestore REST não foram homologados. Sem pedidos, pagamentos, notificações ou contato real.
- [Issue #4](https://github.com/CristianoRFB/RFB-3D-studio/issues/4): custo Free e quotas a confirmar no ambiente escolhido, preview Cloudflare isolado, QA físico, revisão independente e rollback pendentes.
- AV-01/02/09/12/16/20: separar `IMPLEMENTED`, `TESTED_EMULATOR`, `NOT_RUN` e `DEPLOYED`. Não declarar 90% de produção sem aceites completos.

**Próximas ações seguras:** integrar um projeto Spark autorizado e isolado, credenciais/claims server-side, verificar regras em implantação, depois Worker preview com rate limiter e testes de runtime/contrato; só publicar após gates. Enquanto faltarem esses recursos, o projeto permanece `NOT_PRODUCTION_READY`.
