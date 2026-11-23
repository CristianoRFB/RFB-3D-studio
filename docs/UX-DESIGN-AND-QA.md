# RFBStudio — UX, identidade e catálogo completo de telas

> Pesquisa visual externa (23/11/2026): [RESEARCH-CONFIGURATORS.md](RESEARCH-CONFIGURATORS.md) — 4 soluções reais, decisões de UX e links oficiais. Não foram importados screenshots ou assets alheios.

> **ATUALIZAÇÃO G3:** status `UI_DEMO` indica cobertura funcional dentro de componentes compartilhados, **não** página separada, aplicação homologada ou integração com backend. `LOCAL_DEMO` indica `localStorage`. `GLB_PREVIEW_ONLY` não cadastra produtos nem torna preços vinculantes. T-IDs não implementados permanecem pendentes. QA de viewport específico e validação de licença continuam em aberto.

> **BASE DO USUÁRIO:** os 58 T-IDs abaixo são os planejados na fonte original, NÃO telas programadas. Os 10 PNGs de conceito existentes no ZIP são artes demonstrativas, NÃO prints do produto executando. **Este repositório público recebe o catálogo textual, mas os PNGs do ZIP original ainda não foram importados nem revisados quanto à marca e licença.**

## Identidade de produto baseada na fonte

- **Segmento:** Personalização de produtos 3D.
- **Direção visual original:** Produto 3D central, barra de opções à direita, configurações e preço vivos.
- **Cor de acento no índice do ZIP:** `#9A76FF`; verificar contraste AA 4,5:1 normal, 3:1 texto grande e estados focados WCAG 2.2.
- **Experiência principal:** Catálogo 3D → Visualizador → Materiais e cores.
- **Arquitetura/condição especializada:** Three.js + React Three Fiber; Firestore para configurações; assets 3D versionados na Cloudflare.
- Padrão: desktop 1440 px com grid e navegação consistente, tablet 768/1024 px com reorganização de densidade, mobile 320/360/390/430 px com alvo tátil e CTA alcançável; layout flexível, sem scroll horizontal nem microtexto.

## PNGs ORIGINAIS — localizados no ZIP, não nesta branch

Caminho exato de origem: `RFB-LABS-2026/repos-individuais/06-rfbstudio/design/PNG/`.

- **IMG-01** — `01-home.png` — conceito desktop/fluxo geral; estado `SOURCE_ZIP_ONLY` (não copiado ao GitHub).
- **IMG-02** — `02-fluxo-principal.png` — conceito desktop/fluxo geral; estado `SOURCE_ZIP_ONLY` (não copiado ao GitHub).
- **IMG-03** — `03-detalhe-e-estado.png` — conceito desktop/fluxo geral; estado `SOURCE_ZIP_ONLY` (não copiado ao GitHub).
- **IMG-04** — `04-painel-operacional.png` — conceito desktop/fluxo geral; estado `SOURCE_ZIP_ONLY` (não copiado ao GitHub).
- **IMG-05** — `05-admin-e-permissoes.png` — conceito desktop/fluxo geral; estado `SOURCE_ZIP_ONLY` (não copiado ao GitHub).
- **IMG-06** — `06-relatorios-e-indicadores.png` — conceito desktop/fluxo geral; estado `SOURCE_ZIP_ONLY` (não copiado ao GitHub).
- **IMG-07** — `07-configuracoes-e-seguranca.png` — conceito desktop/fluxo geral; estado `SOURCE_ZIP_ONLY` (não copiado ao GitHub).
- **IMG-08** — `08-mobile-home.png` — conceito mobile; estado `SOURCE_ZIP_ONLY` (não copiado ao GitHub).
- **IMG-09** — `09-mobile-fluxo.png` — conceito mobile; estado `SOURCE_ZIP_ONLY` (não copiado ao GitHub).
- **IMG-10** — `10-mobile-perfil.png` — conceito mobile; estado `SOURCE_ZIP_ONLY` (não copiado ao GitHub).

Outros arquivos do original: `design/desktop.svg`, `design/mobile.svg`, 8 PNG de diagramas e fontes DOT/Mermaid. Ao criar repo independente, copiar assets originais com hashes; para recursos de terceiros validar direitos e não publicar imagem sem licença.

## Navegação e hierarquia inicial (decisão de Starter Pack)

**Primeira demonstração funcional proposta:** começar por Catálogo 3D, usando Visualizador e Materiais e cores como navegação/contexto. Não escrever conteúdo genérico de SaaS em todas as telas; o domínio personalização de produtos 3d precisa ser visível no hero, no objeto principal e no CTA. A página deve mostrar o estado vazio, sucesso e falha com feedback concreto, não meros cartões estáticos.

- **Mobile:** menu conciso, CTA principal e fluxo do ator mais comum; títulos específicos, controles 44x44 px quando viável, scroll natural; movimento reduzido respeitado.
- **Desktop:** navegação lateral/superior quando pertinente, conteúdo principal + ações secundárias; evitar enfeites sem função.
- **Acessibilidade:** HTML semântico, foco visível, labels reais, mensagens de erro associadas, teclado, leitor de tela, skip link e `prefers-reduced-motion`.
- **Copy:** dados sintéticos identificados, sem reviews, métricas ou promessas de produto fictícias.

## Catálogo de T001 a T058 — todos da fonte original

| Tela | Especificação original | Estágio |
|---|---|---|
| T001 | Landing / apresentação | `UI_DEMO` |
| T002 | Cadastro / criar conta | `UI_DEMO` |
| T003 | Login e recuperar acesso | `UI_DEMO` |
| T004 | Onboarding e perfil | `UI_DEMO` |
| T005 | Página principal / feed | `UI_DEMO` |
| T006 | Busca e filtros | `UI_DEMO` |
| T007 | Detalhes do recurso | `UI_DEMO` |
| T008 | Fluxo de criação | `LOCAL_DEMO` |
| T009 | Fluxo de edição | `UI_DEMO` |
| T010 | Confirmação / revisão | `UI_DEMO` |
| T011 | Estado concluído / recibo | `UI_DEMO` |
| T012 | Lista pessoal / histórico | `UI_DEMO` |
| T013 | Notificações | `UI_DEMO` |
| T014 | Mensagens ou contato | `UI_DEMO` |
| T015 | Central de ajuda | `UI_DEMO` |
| T016 | Preferências e privacidade | `UI_DEMO` |
| T017 | Acesso e segurança | `UI_DEMO` |
| T018 | Página vazia / primeira vez | `UI_DEMO` |
| T019 | Carregamento e skeleton | `UI_DEMO` |
| T020 | Erro de rede / retentar | `UI_DEMO` |
| T021 | Sem permissão / bloqueio | `LOCAL_DEMO` |
| T022 | Estado de conflito concorrente | `LOCAL_DEMO` |
| T023 | Admin: visão geral | `LOCAL_DEMO` |
| T024 | Admin: gestão de usuários | `LOCAL_DEMO` |
| T025 | Admin: moderação e auditoria | `LOCAL_DEMO` |
| T026 | Admin: regras e configurações | `LOCAL_DEMO` |
| T027 | Admin: relatórios | `LOCAL_DEMO` |
| T028 | Página 404 / recurso indisponível | `LOCAL_DEMO` |
| T029 | Módulo / Catálogo 3D — lista | `LOCAL_DEMO` |
| T030 | Módulo / Catálogo 3D — detalhe | `UI_DEMO` |
| T031 | Módulo / Catálogo 3D — criar/editar | `UI_DEMO` |
| T032 | Módulo / Visualizador — lista | `GLB_PREVIEW_ONLY` |
| T033 | Módulo / Visualizador — detalhe | `METRICS_LOCAL_ONLY` |
| T034 | Módulo / Visualizador — criar/editar | `METRICS_LOCAL_ONLY` |
| T035 | Módulo / Materiais e cores — lista | `NOT_IMPLEMENTED` |
| T036 | Módulo / Materiais e cores — detalhe | `NOT_IMPLEMENTED` |
| T037 | Módulo / Materiais e cores — criar/editar | `NOT_IMPLEMENTED` |
| T038 | Módulo / Opções e variantes — lista | `NOT_IMPLEMENTED` |
| T039 | Módulo / Opções e variantes — detalhe | `NOT_IMPLEMENTED` |
| T040 | Módulo / Opções e variantes — criar/editar | `NOT_IMPLEMENTED` |
| T041 | Módulo / Preço dinâmico — lista | `NOT_IMPLEMENTED` |
| T042 | Módulo / Preço dinâmico — detalhe | `NOT_IMPLEMENTED` |
| T043 | Módulo / Preço dinâmico — criar/editar | `NOT_IMPLEMENTED` |
| T044 | Módulo / Salvar design — lista | `NOT_IMPLEMENTED` |
| T045 | Módulo / Salvar design — detalhe | `NOT_IMPLEMENTED` |
| T046 | Módulo / Salvar design — criar/editar | `NOT_IMPLEMENTED` |
| T047 | Módulo / Orçamento — lista | `NOT_IMPLEMENTED` |
| T048 | Módulo / Orçamento — detalhe | `NOT_IMPLEMENTED` |
| T049 | Módulo / Orçamento — criar/editar | `NOT_IMPLEMENTED` |
| T050 | Módulo / Carrinho — lista | `NOT_IMPLEMENTED` |
| T051 | Módulo / Carrinho — detalhe | `NOT_IMPLEMENTED` |
| T052 | Módulo / Carrinho — criar/editar | `NOT_IMPLEMENTED` |
| T053 | Módulo / Biblioteca de modelos — lista | `NOT_IMPLEMENTED` |
| T054 | Módulo / Biblioteca de modelos — detalhe | `NOT_IMPLEMENTED` |
| T055 | Módulo / Biblioteca de modelos — criar/editar | `NOT_IMPLEMENTED` |
| T056 | Módulo / Painel de vendas — lista | `NOT_IMPLEMENTED` |
| T057 | Módulo / Painel de vendas — detalhe | `NOT_IMPLEMENTED` |
| T058 | Módulo / Painel de vendas — criar/editar | `NOT_IMPLEMENTED` |

**Prioridade de desenvolvimento:** T001 apresentação, T003 login se realmente requerido, T005 primeira tela do produto, T007 recurso, T008 criação, T009 edição, T010 confirmação, T018–T022 vazios/erro/concorrência, T028 404 e T029–T031 primeiro módulo, mais telas necessárias ao fluxo end-to-end. Não gerar telas de admin/moderação sem domínio, autorização e dados reais de teste.

## Contrato de design para exportação futura

**D-UX-01:** mockup desktop e mobile de cada tela prioritária, mantendo estilo original sem usar o PNG como prova de execução. **D-UX-02:** user flow clicável ou interativo, separado do layout conceitual. **D-UX-03:** UI real em React, estados tratados. **D-UX-04:** screenshot REAL com URL/commit/viewports e data, separado dos PNG conceituais.

A lista de 58 telas não obriga implementar 58 páginas idênticas: revisar redundância, agrupar componentes e produzir apenas aquelas necessárias ao caso de uso, preservando rastreabilidade de cada T-ID.

## QA visual obrigatório antes de portfólio público

- [ ] Mobile 320, 360, 390, 430 px; tablet 768/1024; desktop 1440 px em navegador REAL.
- [ ] Navegação por teclado, sem foco preso, linguagem acessível, erros e loaders visíveis.
- [ ] Comparação com PNGs **originais** e feedback fundamentado; não exigir pixel match nem plagiar marcas.
- [ ] CRUD/fluxo mínimo real, persistência após reload, dados isolados e teste de duas sessões quando aplicável.
- [ ] Screenshot do APP executando e screenshot do original rotulados distintamente.
- [ ] Cores/contraste, motion/reduced-motion, CLS e imagens/performance avaliados.
- [ ] Publicação somente com gate de segurança, custo e permissão do usuário.

**Status no RFB Method:** `SCREEN_CATALOG_IMPORTED / ORIGINAL_DESIGN_REFERENCED / BROWSER_QA_NOT_RUN`.
