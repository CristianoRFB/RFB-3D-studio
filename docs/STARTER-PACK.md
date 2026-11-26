# RFBStudio — Starter Pack inicial (RFB Method)

> **ESTADO ATUAL:** `BLUEPRINT_ORIGINAL_PRESERVADO / STARTER_SPECIFIED / APP_NOT_CREATED / QA_NOT_RUN / DEPLOY_NOT_DONE`. Material agora na branch do **repositório individual**; o MVP real ainda não foi implementado. O conceito não equivale a software pronto.

## 00. Proveniência e estado de importação

- [Especificação RFB](ESPECIFICACAO-RFB.txt): cópia textual do método atualizada para marca RFB.
- [Proveniência](PROVENIENCIA.md): origem GitHub e SHA dos documentos anteriores à adaptação para repo individual.
- Starter Pack importado do RFB Method PR #4 para o novo repositório **público** CristianoRFB/RFB-3D-studio.
- PNG/SVG e assets originais ainda **não importados**, nem avaliados para licença e marca.
- Estágio: `G0_DOCUMENTS_IMPORTED / G1_SCAFFOLD_IN_BRANCH / G2_APP_NOT_IMPLEMENTED / QA_NOT_RUN / DEPLOY_NOT_DONE`.
- Documentação de arquitetura, UX, roadmap e diagramas são propostas; não demonstram sistema em produção.

## 01. Definição do produto — origem do usuário

**Segmento:** Personalização de produtos 3D. **Slogan:** Escolha, visualize e transforme.

**Problema:** Vendedores de produtos customizados precisam explicar variantes e mostrar como a personalização afetará o resultado e o preço.

**Quem usa:** Consumidores, marcas de produtos customizados e designers.

**Prova de valor pretendida:** Mudar cores e acessórios altera modelo e preço mantendo configurações ao recarregar.

**Identidade visual proposta:** Produto 3D central, barra de opções à direita, configurações e preço vivos.

## 02. MVP implementável, não somente protótipo ilustrado

**Hipótese da primeira fatia:** reproduzir a jornada principal abaixo com **dados sintéticos**, navegação de verdade, lógica testável e persistência/autorização quando o backend for introduzido. Começar com 1 fluxo completo; não implementar 58 telas superficiais ao mesmo tempo.

1. Escolher produto
2. Carregar modelo
3. Alterar cor/material
4. Recalcular preço
5. Salvar configuração
6. Enviar orçamento

**Recorte de escopo G2 (decisão proposta):** `Visualização 3D + Orbit/pan/zoom acessíveis + Troca de materiais`; validar dependências de identidade, permissões e estados com a fonte original antes do código. Critério de demonstração: Mudar cores e acessórios altera modelo e preço mantendo configurações ao recarregar.

**Fora do primeiro slice (planejado):** Variações de tamanho; Atualização de preço; Salvar configuração; Exportar visualização; Galeria de presets; Orçamento por configuração; demais integrações conforme risco/custo. Nada dessas funções está implementado no repositório de metodologia.

## 03. Atores e regras de acesso

- **A-01 — Visitante:** definir recursos permitidos, negados e testes 401/403 por rota, tenant e ownership; nenhuma role vem do body do cliente.
- **A-02 — Cliente:** definir recursos permitidos, negados e testes 401/403 por rota, tenant e ownership; nenhuma role vem do body do cliente.
- **A-03 — Designer:** definir recursos permitidos, negados e testes 401/403 por rota, tenant e ownership; nenhuma role vem do body do cliente.
- **A-04 — Vendedor:** definir recursos permitidos, negados e testes 401/403 por rota, tenant e ownership; nenhuma role vem do body do cliente.
- **A-05 — Administrador:** definir recursos permitidos, negados e testes 401/403 por rota, tenant e ownership; nenhuma role vem do body do cliente.

## 04. Domínios e módulos

**Módulos originais (10):** Catálogo 3D; Visualizador; Materiais e cores; Opções e variantes; Preço dinâmico; Salvar design; Orçamento; Carrinho; Biblioteca de modelos; Painel de vendas.

**Entidades propostas (modelagem original, cardinalidades não homologadas):** Usuario; Produto; Modelo3D; Material; Variante; Configuracao; Opcao; Orcamento; Pedido; ImagemRender; LicencaModelo.

**Features originais (12):**
- [ ] **F-01** Visualização 3D — requisito/aceite AC-01; código e teste `NOT_RUN`.
- [ ] **F-02** Orbit/pan/zoom acessíveis — requisito/aceite AC-02; código e teste `NOT_RUN`.
- [ ] **F-03** Troca de materiais — requisito/aceite AC-03; código e teste `NOT_RUN`.
- [ ] **F-04** Variações de tamanho — requisito/aceite AC-04; código e teste `NOT_RUN`.
- [ ] **F-05** Atualização de preço — requisito/aceite AC-05; código e teste `NOT_RUN`.
- [ ] **F-06** Salvar configuração — requisito/aceite AC-06; código e teste `NOT_RUN`.
- [ ] **F-07** Exportar visualização — requisito/aceite AC-07; código e teste `NOT_RUN`.
- [ ] **F-08** Galeria de presets — requisito/aceite AC-08; código e teste `NOT_RUN`.
- [ ] **F-09** Orçamento por configuração — requisito/aceite AC-09; código e teste `NOT_RUN`.
- [ ] **F-10** Modo qualidade reduzida — requisito/aceite AC-10; código e teste `NOT_RUN`.
- [ ] **F-11** Fallback 2D — requisito/aceite AC-11; código e teste `NOT_RUN`.
- [ ] **F-12** Painel de modelos — requisito/aceite AC-12; código e teste `NOT_RUN`.

## 05. Stack e decisão de R$0

**Stack candidata original:** React + TypeScript + Vite; Cloudflare Workers / Static Assets; Firebase Auth / Firestore; ferramentas opcionais conforme módulo.

**Especialização original:** Three.js + React Three Fiber; Firestore para configurações; assets 3D versionados na Cloudflare.

**Risco/custo apontado na fonte:** Modelos leves e assets estáticos cabem em demo; render cloud e modelos pesados elevam custo.

**Risco de domínio:** Modelos 3D exigem autoria/licença; otimizar GLB, textura e LOD para mobile.

**Decisão de implementação proposta:** React + TypeScript + Vite para interface responsiva; Firebase Emulator como primeira persistência testável; Workers/Static Assets e Firebase Auth/Firestore **somente quando houver necessidade e conta autorizada**. No projeto novo consultar Cloudflare CLI `cf` e documentação atual; projetos legados Wrangler ficam em Wrangler. Não instalar R2, Stream, mapas comerciais, pagamento real ou API de IA paga por padrão. Custo recorrente adicional alvo: **R$0**, sujeito às cotas e pré-requisitos reais; nunca prometer produção escalável gratuita.

**Segurança transversal:** sem credenciais no repositório; tokens validados em backend, Firestore Rules testadas, API privilegiada não confia no userId/tenantId/preço/role enviados pelo navegador; logs sem dados sensíveis. Para funcionalidades de personalização de produtos 3d, revisar requisitos de segurança e leis pertinentes antes de dados reais.

## 06. Telas e diagramas

- [UX, layout desktop/mobile, catálogo T001–T058 e QA](UX-DESIGN-AND-QA.md) — conceitos originais do ZIP NÃO são screenshots de aplicativo.
- [Diagramas, riscos de modelagem, C4, UML e ERD](DIAGRAMAS.md) — desenhos de arquitetura **propostos**, validação de cardinalidade e semântica ainda pendente.
- [Roadmap e gates por fase](ROADMAP.md) — preparação para repositório independente, sem merge/deploy antecipado.

## 07. Critérios de entrega do Starter Pack

- [x] Requisito ORIGINAL transcrito e preservado, com identificador da fonte.
- [x] Resumo do problema, atores, módulos, jornada, 12 features, telas e dependências em documentos editáveis.
- [x] Diagramas editáveis Mermaid propostos; todos devem passar revisão de arquitetura antes de virar schema.
- [ ] Pesquisa externa do segmento atual, concorrentes e decisões de posicionamento com referências/data/observações `NOT_RESEARCHED_FOR_THIS_PROJECT`.
- [ ] Design PNG original do ZIP extraído e versionado no **repo individual** com integridade/licença (arquivo binário ainda não está nesta branch).
- [ ] Código React/TypeScript gerado, com build real e primeiro fluxo implementado `NOT_CREATED`.
- [ ] Regras Firebase/Workers com testes E2E, autenticação e autorização reais `NOT_RUN`.
- [ ] Capturas de tela verdadeiras, feedback de usuário, deploy/preview Cloudflare `NOT_RUN`.
- [ ] Aprovação do escopo e URL do repositório específico `PENDING_USER_CREATION`.

## 08. Handoff para o futuro repo `RFBStudio`

1. Criar repositório individual **quando solicitado pelo usuário**; verificar se já existe antes de propor novo, conferir Issues/PRs/HEAD.
2. Importar **sem modificar** original TXT e assets documentais do ZIP na pasta de `06-rfbstudio`; registrar hashes no manifest; não confundir PNG de conceito com screenshot de produto.
3. Transportar Starter Pack/UX/Diagramas/Roadmap, adaptar paths e marcar tarefas do projeto no Issue tracker; a fonte original permanece referência imutável.
4. Antes de programar pesquisar mercado e UX do **nicho específico**, validar fluxo principal, DTO/Rules/segurança/uso em dispositivo, escolher stack realmente suportada e custo R$0.
5. Implementar primeira fatia da jornada acima e provar com testes executados; atualizar `ROADMAP.md` e `STATE/PROGRESS` a cada checkpoint; `codex:pc` prioriza browser, execução local, testes do Firebase Emulator e screenshot.
6. Somente quando demonstrável e realmente publicado incluir no **portfólio profissional** com selo `PROTÓTIPO` ou `PROJETO CONCLUÍDO` de acordo com evidência. Não editar o Worker profissional nesta rodada.
