# RFB Studio — handoff verificável 23/11/2026

**ÚNICO repositório-alvo:** `CristianoRFB/RFB-3D-studio`; **PR:** #1 Draft para `main`; branch `feature/rfb-starter-pack-v1`. Não editar método-mãe `rfb-method-gpt` nem outros produtos.

## Linha do tempo deste ciclo
- Base anterior: `957071d56bdeec1c08a747b29fe6eaaa0df558bd`, G3 demo, E2E Chromium.
- G4 Auth: Firebase Auth real quando configurado, Firestore por UID/revisionamento, 2 contas no Emulator, regras e 40 verificações de segurança.
- API: JWT Firebase verificado pelo Worker, precificação server-side sintética, request UUID idempotente, rate limiter obrigatório e OAuth server-only de service account; `ENABLE_DEMO_QUOTE_PERSISTENCE` desabilitada por padrão.
- RBAC: designer/vendedor/admin via custom claims de servidor; metadata de modelos em `/tenants/{tenantId}/models`, tenant e owner verificados em Rules. Sem upload de GLB para Cloud Storage.
- 3D: 3 geometrias autorais, acessórios visuais, export screenshot PNG, SVG 2D e fallback, controles teclado/touch/zoom.
- Produto e privacidade: presets, carrinho/quote local, designs, backup/restore/clear local, offline; pesquisa das 4 soluções oficiais.
- QA: [build 35f822ca](https://github.com/CristianoRFB/RFB-3D-studio/actions/runs/45179480137) PASS 24 unit, 40 rules, 7+2+1 Playwright; bundles 340/516,7 KiB gzip.

## Estado e limites
- NÃO há Firebase configurado/implantado para este app, nem credenciais/claims reais, nem preview Cloudflare.
- Nenhum Worker novo, Pages novo, domínio, banco Firebase, plano pago, billing, pagamento, entrega de mensagem ou produto real foi criado/ativado nesta rodada.
- O código é uma demonstração com emuladores; builds/screenshots de CI não são URL pública. Não tomar decisões de negócio com preços fictícios.
- Assets e PNGs conceituais originais continuam fora do repositório enquanto licença/autoria não forem checadas.
- A `main` e ambientes existentes foram preservados.

## Continuar (RFB Method rfb:continue)
1. Reabrir `AGENTS.md`, `PROJECT_STATUS.json`, `docs/PROGRESS.md`, `docs/METHOD-COVERAGE.md`; verificar HEAD do PR, CI, Issues #2–#4 e revisões.
2. Rodar `npm ci`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run perf:budget`, `npm run rules:test` e Playwright. A cada SHA, atualizar evidências.
3. Após autorização de um projeto Firebase Spark dedicado, habilitar Authentication e Firestore sem tocar em outros projetos; validar email/password, ownership, backup e deleção; aplicar Rules em staging. Administradores/Designers exigem custom claims atribuídas por servidor confiável.
4. Para API autenticada, configurar serviço Worker em preview isolado com Firebase JWKS, server OAuth, rate limit binding, logs/rollback, integração real contra banco de teste; manter cobrança e mensagens desligadas.
5. QA em hardware real, perf/segurança/a11y, licenças e revisão independente. Só liberar PR Draft, merge e publicação quando todos gates passarem e houver autorização.

**Próximo bloqueio concreto:** configuração/provisionamento externo Firebase+Cloudflare; nenhuma ferramenta de engenharia local substitui credenciais, conta e política de custo. Não prometer entrega assíncrona.
