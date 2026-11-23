# RFB Method — 12 critérios de aceite do RFB Studio

**Legenda:** `C` código; `U` teste unitário; `E` Playwright Chromium; `R` Firestore/Auth Emulator; `B` bloqueio comercial/produção. Exigir validação no ambiente real antes de `ACCEPTED`.

| AC | Requisito original | Evidência de demo | Falta para aceite integral |
|---|---|---|---|
| 01 | Visualização 3D | C/E SwiftShader com 3 modelos originais | GPU real, licenças, móveis físicos |
| 02 | Orbit/pan/zoom acessíveis | C/E câmera por teclado e ponteiro | Cobertura completa de gestos e leitor de tela |
| 03 | Troca de materiais | C/U/E cores, acabamentos, opções visuais | Materiais e produção reais |
| 04 | Variações de tamanho | C/U/E escala 3D e preço em centavos | Dimensões, conformidade e produção física reais |
| 05 | Atualização de preço | C/U/E catálogo local e Worker demo | Autoridade comercial e sincronização de catálogo real |
| 06 | Salvar configuração | C/U/E local, R Auth/Firestore 2 contas | Firebase de projeto real, retention e restore |
| 07 | Exportar visualização | C/E PNG WebGL, SVG 2D + acessório, JSON | Perf e fidelidade em dispositivos/GLB reais |
| 08 | Galeria de presets | C/U/E 6 modelos/presets | Curadoria, gestão, ativos reais |
| 09 | Orçamento por configuração | C/U/E demo local, quote JWT/uuid mock unit | Integração real Worker/Firestore, rate, claims, envio aprovado |
| 10 | Modo qualidade reduzida | C/E DPR/antialias e motion | Medidas de FPS e memória mobile |
| 11 | Fallback 2D | C/E WebGL off e SVG | Simulação de perda de contexto e hardware |
| 12 | Painel de modelos | C/R papéis/tenant e CRUD metadata 3 modelos; C/E GLB local | Atribuição de claims real, upload licenciado, gestão/admin em produção |

## 10 módulos da especificação
1. Catálogo 3D: seleção/busca de 3 produtos sintéticos.
2. Visualizador: Three.js, R3F, 2D, PNG, câmera.
3. Materiais e cores: 4 cores, acabamentos.
4. Opções e variantes: tamanhos/acessórios representados visualmente.
5. Preço dinâmico: cálculo demonstrativo versionado, API server-cotação desativada.
6. Salvar design: local e Firebase Emulator por UID/revisionamento.
7. Orçamento: simulações e API privada autenticada somente em código/mocks.
8. Carrinho: composição local, valores não vinculantes, histórico.
9. Biblioteca de modelos: 3 procedurais, importação GLB local, metadados RBAC por tenant.
10. Painel de vendas: métricas **locais**, sem fingir vendedor administrativo em produção.

## 58 T-IDs e metas
O catálogo completo de 58 telas está em [UX-DESIGN-AND-QA.md](UX-DESIGN-AND-QA.md). Uma tela conceitual pode ser atendida por componente reutilizável; `UI_DEMO`, `EMULATOR`, `CODE_ONLY` **não** equivalem a serviço comercial entregue. Os 12 critérios têm **código demonstrativo parcial ou completo**, mas nenhum deve ser anunciado `ACCEPTED_IN_PRODUCTION` sem os gates críticos. Não calcular porcentagem de conclusão a partir de arquivos ou número de componentes.

### Gates de 90% e full
Antes de declarar pelo menos 90% ou 100%, exigir aceites funcionais E2E e RBAC em ambiente isolado real, catálogos e preços aprovados, QA físico/perf/a11y, confidencialidade LGPD, verificação de custo, deployment/rollback, revisão independente e aprovação final. O estado atual não satisfaz essa condição.
