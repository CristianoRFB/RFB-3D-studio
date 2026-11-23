# RFB Studio — checkpoint e progresso verificável

**Repositório:** CristianoRFB/RFB-3D-studio · branch `feature/rfb-starter-pack-v1` · [PR #1](https://github.com/CristianoRFB/RFB-3D-studio/pull/1) Draft. Toda conclusão abaixo é limitada à demonstração; nenhuma funcionalidade comercial foi publicada.

| Fatia | Implementação | Teste/Evidência | Estado |
|---|---|---|---|
| S001 | Starter Pack, 7 diagramas, 58 T-IDs, fontes e PR | Inventário de arquivos, GitHub | DOCS IMPORTED |
| S002 | 3 modelos procedurais WebGL + orbit/pan/zoom + 2D/reduced | Chromium E2E geral e fallback; QA WebGL GPU específica pendente | DEMO_PARTIAL |
| S003 | 4 cores, acabamento, tamanhos, acessórios, preço integer-cents com versão | Vitest preços/combinações, Playwright selecionar variantes | DEMO_TESTED |
| S004 | Designs, carrinho, presets, export JSON/SVG, link de config | Vitest serialização/hidratação, E2E recarga e exportação | LOCAL_DEMO_TESTED |
| S005 | Histórico de orçamento sintético, painel local de métricas, API Cloudflare demo sem persistência | Vitest negativos em `server/worker.ts`; E2E orçamento local | DEMO_TESTED; API NOT_DEPLOYED |
| S006 | GLB próprio local com 8 MB, validação e proibição de URLs externas | Vitest estrutura, E2E importação em andamento no HEAD; perf móvel e memória não medidas | PARTIAL |

**Último CI completo confirmado antes dos commits mais recentes:** [GitHub Actions #45094283215](https://github.com/CristianoRFB/RFB-3D-studio/actions/runs/45094283215), com TypeScript, Vitest, Build e Playwright PASS. A revisão posterior exige novo CI. Screenshots mobile/desktop estão em artefatos do workflow, não são mockups. NÃO afirmar performance, segurança ou WCAG homologadas sem ensaio.

**Backend e publicação:** Firebase Auth = NOT_IMPLEMENTED; Firestore Rules = WRITTEN_NOT_TESTED_EMULATOR; Worker demo = WRITTEN_NOT_DEPLOYED; Cloudflare static = NOT_DEPLOYED; orçamento comercial/pedido = NOT_IMPLEMENTED. Zero pagamentos ou envio reais. `package-lock.json` ainda pendente de versionamento neste checkpoint.

**BLOQUEADORES rastreados:** [Issue #2](https://github.com/CristianoRFB/RFB-3D-studio/issues/2) Auth/Firestore, [Issue #3](https://github.com/CristianoRFB/RFB-3D-studio/issues/3) preços/pedidos, [Issue #4](https://github.com/CristianoRFB/RFB-3D-studio/issues/4) QA/infra. O PR permanece Draft.

**Riscos RFB AntiVibeCoding:** AV-01/02 diferenças entre código e execução; AV-03/05 auth e regras sem prova; AV-09 lockfile/versões; AV-11 não substituir requisitos por UI vazia; AV-12 QA; AV-16 ambiente/cloud; AV-20 docs/estado. **STOP:** nenhum patch exploratório repetido, não promover sem evidência.

## Próxima fatia
1. Validar CI no HEAD atual; corrigir erros por log sem testar cegamente.
2. Materializar `package-lock.json`, mudar CI para `npm ci` e repetir suite.
3. Testes Firebase Auth/Rules em emuladores isolados, modelo RBAC/tenancy real e API de preços autenticada. Homologação Cloudflare isolada só após autorização e conferência de custo.
