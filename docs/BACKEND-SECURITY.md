# RFB Studio — arquitetura de autenticação, dados e segurança (23/11/2026)

## Fronteiras implementadas, comprovadas e não comprovadas

| Recurso | Implementação no GitHub | Evidência | Estado externo |
|---|---|---|---|
| Firebase Auth email/senha/logout/reset | `src/cloud/firebase.ts`, `CloudWorkspace.tsx` | 2 contas sintéticas em Auth Emulator, Playwright E2E | Sem projeto real configurado |
| Designs por owner/revision | `src/cloud/designs.ts`, `firestore.rules` | Firestore Emulator nega A/B/anônimo, payload forjado, revisão e createdAt | Rules ainda não aplicadas em Firebase real |
| Modelos/roles por tenant | `src/cloud/models.ts`, `ModelManager.tsx` e Rules | 40 verificações de Rules, designer/vendedor/admin, isolamento inclusive entre designers no mesmo tenant | Claims e tenants reais não provisionados |
| Preço de demonstração | `src/catalog.ts`, `server/worker.ts` | Vitest, E2E UI | Não é preço comercial |
| Quote privado, auth+rate+idempotência | `server/private-quotes.ts` | Vitest com token/verificador/store simulados, casos negativos | Worker não implantado, sem validação OAuth/Rate Limiter real |
| Privacidade local | `src/backup.ts`, `App.tsx` | Unit + E2E backup/restauração/remoção/offline | Não apaga dados de eventual conta remota |

## Modelo de confiança
- O navegador controla seus dados locais e inputs. Não confiar em `localStorage`, preço enviado pelo cliente ou `role` do body.
- Para designs remotos, Auth identifica `request.auth.uid` e Firestore Rules isolam `users/{uid}/designs`, validam esquema e incremento de revisão. Usuário B não acessa A.
- `request.auth.token.role` e `tenantId` devem ser **claims emitidas por backend/Admin SDK confiável**; nenhuma opção HTML confere acesso. Designer edita somente modelos próprios de seu tenant, Admin do tenant edita, Vendedor lê; visitante só lê modelos publicados.
- Quote privado valida `Authorization: Bearer Firebase ID token` com assinatura JWKS Google RS256, claims e audience de projeto. Usa uid só do token, recota pelo catálogo do Worker, bloqueia corpos grandes, payload extra e UUID idempotente reutilizado com conteúdo diferente.
- A API privada permanece 503 sem `ENABLE_DEMO_QUOTE_PERSISTENCE=true`, `FIREBASE_PROJECT_ID`, service account email/chave e Rate Limiter. Nunca expor a chave em `VITE_*` ou GitHub.
- Escritas de quote via service account (Admin) não passam por Rules: projeto real exige revisão de IAM, OAuth, revogação, rate limits, idempotência, logs sanitizados, integrações e backup. A implementação não chama APIs de pagamento nem envia mensagens.
- GLB local de até 8 MB validado; arquivos com referências externas bloqueados; preview é propriedade do usuário e não implica autorização de licença para publicar.

## P0/P1 ainda bloqueiam produção
1. Não existem projeto Spark e autenticação reais nem evidência de regras implantadas; ausência de provisioning de roles/tenants.
2. Worker com secrets+Rate Limiter e Firestore REST não tem teste de integração em runtime Cloudflare. A validação JWT por JWKS não verifica revogação imediata de token. Confirmar controles e custos Free antes da operação real.
3. Fluxos de exclusão de conta/dados remotos, LGPD e política de retenção/auditoria/recuperação precisam ser homologados. A opção de privacidade local **não apaga dados remotos**.
4. Pagamentos, pedidos, contatos reais e envio automático não estão implementados e não devem ser ativados silenciosamente.
5. QA físico de WebGL, OWASP/segurança e acessibilidade integral, revisão e deploy isolado com rollback seguem pendentes.

**Documentos correlatos:** [QUOTES-API.md](QUOTES-API.md), [DEPLOY-PLAN.md](DEPLOY-PLAN.md), [PROGRESS.md](PROGRESS.md), [Method](METHOD-COVERAGE.md). Sem alegar segurança total por testes de emulador.
