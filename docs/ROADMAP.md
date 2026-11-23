# Roadmap específico — RFBStudio (RFB Method)

> **G3 — UPDATE 22/11/2026:** A aplicação demonstrativa agora cobre os 10 módulos como componentes de UI e as 12 features em diferentes níveis, não 58 telas individuais nem backend real. Ver [cobertura](METHOD-COVERAGE.md) e [progresso](PROGRESS.md). O checklist histórico abaixo é mantido como baseline e só pode ser fechado com teste correspondente. Sem deploy Firebase/Cloudflare.

**Origem:** blueprint original do usuário (22/11/2026); **estado técnico:** `G0_DOCS_IMPORTED / APP_NOT_CREATED / QA_NOT_RUN`. Marcadores abaixo são gate de trabalho, **não aprovação implícita**. Este Starter Pack foi importado no repositório público `CristianoRFB/RFB-3D-studio` na branch `feature/rfb-starter-pack-v1`; projeto G1, sem software funcional.

## Gate G0 — fonte, pesquisa e decisão do primeiro produto (parcial)

- [x] Preservar especificação original textual e nome/numeração do projeto.
- [x] Inventariar 10 módulos, 12 features, entidades, 58 telas e jornada; 7 diagramas editáveis iniciais.
- [x] Relacionar riscos técnicos/custos à fonte original.
- [ ] Ler e comparar **3–5 produtos/soluções reais do mesmo nicho**; anotar URL/data, forças de UX, oportunidade e riscos. Não copiar mídia/código/marca de terceiros.
- [ ] Validar público, diferenciais e critérios de MVP, inclusive experiência mobile.
- [ ] Importar PNGs conceituais do ZIP no repo individual e conferir SHA antes de declarar assets versionados.
- [ ] Aprovar arquitectura, permissões, modelo de dados e requisitos aplicáveis ao MVP.

## Gate G1 — bootstrap de repositório e ambiente (não iniciado)

- [x] Usuário criou o repositório público `CristianoRFB/RFB-3D-studio`; main inicializada para documentação e branch própria; Issues/PRs inexistentes antes do Starter Pack.
- [ ] Usar `rfb:starter` depois de ler o repo, respeitando `AGENTS.md`, `stack.md`, AntiVibeCoding, AntiLoop e proteção de dados.
- [ ] React/TS/Vite e Vitest: scaffold ilustrativo no PR; lockfile, build, QA real e Firebase Emulator ainda pendentes de execução.
- [ ] Nenhuma integração paga, segredo ou dado real; Meta operacional **R$0/mês adicional**.
- [ ] Rodar `npm install`, `npm run typecheck`, `npm run test`, `npm run build` em checkout real e guardar logs/exit codes; sem executor `NOT_RUN`.
- [ ] Branch/PR/Issue, checkpoint e rollback antes de persistência/produção.

## Gate G2 — fluxo vertical mínimo demonstrável (não iniciado)

**Jornada original a implementar e testar:**

1. Escolher produto
2. Carregar modelo
3. Alterar cor/material
4. Recalcular preço
5. Salvar configuração
6. Enviar orçamento

- [ ] Implementar o fluxo inteiro usando estados reais de UI, dados sintéticos e operações coerentes.
- [ ] Testar persistência após recarregar e duas sessões se o domínio exigir, sem vazar registros.
- [ ] Autorizar de modo server-side/Rules todos os comandos protegidos. Casos 401/403 e usuários/tenants distintos.
- [ ] Tratar loading, empty, erro, offline/conflito, retry/idempotência e recuperação, conforme o caso.
- [ ] Captura screenshot real mobile e desktop com SHA/URL do build, nunca usar mockup como evidência de funcionamento.

## Gate G3 — módulos, atores e exceções principais (não iniciado)

- [ ] Selecionar e implementar os demais módulos originais conforme prioridade comprovada, não necessariamente todas as 58 telas físicas.
- [ ] Testar transições da máquina de estados, concorrência e políticas de retenção/exclusão.
- [ ] Adicionar perfis de usuários apenas com matriz RBAC/ABAC e testes de negação.
- [ ] Criar relatórios/logs não sensíveis e mecanismos de recuperação/backup compatíveis com as cotas.

## Gate G4 — integrações externas condicionais (bloqueadas até análise)

- [ ] Validar custos e requisitos de RFBStudio: Modelos 3D exigem autoria/licença; otimizar GLB, textura e LOD para mobile.
- [ ] Risco específico: Modelos 3D exigem autoria/licença; otimizar GLB, textura e LOD para mobile.
- [ ] Se houver pagamentos, vídeo, IA, mapas/tiles, R2 ou dispositivos físicos: sandbox/fixture e orçamento aprovado antes de produzir; nunca ativar serviços pagos automaticamente.
- [ ] Provar callback/webhook autorizado, assinatura/verificação, retentativas, concorrência e monitoramento quando existirem.

## Gate G5 — QA e engenharia de qualidade (não executado)

- [ ] Vitest (regras, modelos, invariantes), contratos HTTP, Firestore Emulator Rules, teste de concorrência/idempotência.
- [ ] Playwright Chrome desktop/mobile em 320/360/390/430/768/1024/1440 px com screenshot/screencast dos fluxos e falhas.
- [ ] OWASP ASVS 5.0 aplicável, autorização server-side, LGPD, uso de assets licenciados, auditoria de dependências, acessibilidade WCAG 2.2.
- [ ] Checks GitHub CI/Actions executados e aprovados em HEAD exato; reviewer independente e validação humana do produto.
- [ ] Rastrear cada requisito abaixo até código, teste, issue e evidência `PASS`.

**12 aceites originais — todos NÃO comprovados:**
- [ ] AC-01: Visualização 3D — persistência, autorização, concorrência, teste de integração, teste E2E.
- [ ] AC-02: Orbit/pan/zoom acessíveis — persistência, autorização, concorrência, teste de integração, teste E2E.
- [ ] AC-03: Troca de materiais — persistência, autorização, concorrência, teste de integração, teste E2E.
- [ ] AC-04: Variações de tamanho — persistência, autorização, concorrência, teste de integração, teste E2E.
- [ ] AC-05: Atualização de preço — persistência, autorização, concorrência, teste de integração, teste E2E.
- [ ] AC-06: Salvar configuração — persistência, autorização, concorrência, teste de integração, teste E2E.
- [ ] AC-07: Exportar visualização — persistência, autorização, concorrência, teste de integração, teste E2E.
- [ ] AC-08: Galeria de presets — persistência, autorização, concorrência, teste de integração, teste E2E.
- [ ] AC-09: Orçamento por configuração — persistência, autorização, concorrência, teste de integração, teste E2E.
- [ ] AC-10: Modo qualidade reduzida — persistência, autorização, concorrência, teste de integração, teste E2E.
- [ ] AC-11: Fallback 2D — persistência, autorização, concorrência, teste de integração, teste E2E.
- [ ] AC-12: Painel de modelos — persistência, autorização, concorrência, teste de integração, teste E2E.

## Gate G6 — integração, publicação e portfólio profissional (não iniciado)

- [ ] Aprovação explícita para deploy na conta/projeto/branch identificados; confirmar limite de custo, segurança e rollback.
- [ ] Preview isolado real com URL aberta e verificada; não tocar Cloudflare/Firebase existentes sem necessidade.
- [ ] Fotos e textos com licença/origem; navegação completa e métricas apenas comprovadas.
- [ ] Promover repo só quando CI/QA e gates de privacidade atendidos; não tratar mergeable=true como aprovação.
- [ ] No portfólio profissional `cristiano-bueno-portfolio.on7.workers.dev`, mostrar inicialmente **Planejamento/Conceito**; quando implementação/teste existirem, evoluir para **Protótipo** e depois **Aplicação**, com screenshots reais e links confirmados. Esta atualização do RFB Method **não modifica o Worker**.

## Quadro de estado e rastreabilidade

| Item | Estado | Evidência ou ausência |
|---|---|---|
| Fonte original | `IMPORTED_VERBATIM` | `ESPECIFICACAO-RFB.txt` |
| Fluxo G2 | `PLANNED` | Jornada acima |
| Modelagem | `DRAFT` | `DIAGRAMAS.md`, cardinalidades pendentes |
| Telas e UX | `SPECS_IMPORTED` | `UX-DESIGN-AND-QA.md`, PNGs no ZIP |
| Código React/TS | `NOT_CREATED` | Nenhum repo individual |
| Firebase/Cloudflare | `NOT_DEPLOYED` | Nenhum recurso novo autorizado |
| Testes E2E/CI | `NOT_RUN` | Sem app/checkout |
| Portfólio profissional | `NOT_ADDED` | Worker existente preservado |

**Próxima ação executável no futuro repo:** depois do usuário criar o repositório, importar assets com hashes, fazer pesquisa de nicho, escrever critério G2 e implementar o primeiro fluxo com teste real. Registrar avanço em `ROADMAP.md`, `STATE.json`, `PROGRESS.md` e Issues/PRs somente após execução.
