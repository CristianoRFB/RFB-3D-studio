# RFB Studio — plano de habilitação, preview e rollback (não executado)

**Objetivo:** passar de demonstração testada em CI para preview isolado e, depois de aprovação, produção. No início deste arquivo **nenhum deploy foi executado**. Não alterar `main`, Workers/Pages existentes, Firebase de outros produtos ou billing sem autorização específica.

## Gate 0 — artefato e dependências
1. Confirmar branch/HEAD em [PR #1](https://github.com/CristianoRFB/RFB-3D-studio/pull/1) e status de Issues #2–#4.
2. Executar `npm ci`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run perf:budget`, `npm audit --omit=dev --audit-level=high`.
3. Executar `npm run rules:test`, E2E Chromium, WebGL e Auth Emulator. Verificar SHA nos screenshots e no build.
4. Revisar licença dos arquivos GLB reais e imagens conceituais do ZIP original; não incorporá-los sem autorização.

## Gate 1 — Firebase isolado e sem conta cobrada
1. Autorizar/identificar um projeto **Spark dedicado ao RFB Studio**, região, limites e responsáveis. Não usar projeto de produção alheio; não vincular faturamento.
2. Ativar provedor de Auth email/senha e Firestore somente após conferir regras atuais/quota; testar `users/{uid}/designs`, `tenants/{tenantId}/models` e `users/{uid}/quotes`.
3. Usar `cp .env.example .env.local` localmente e informar apenas identificadores **públicos** VITE Firebase; manter `.env.local` fora do Git. Nunca colocar chave de service account em `VITE_*`.
4. Provisionar `role` e `tenantId` como custom claims por serviço/admin confiável; testar owner A, B, designer A/B, vendedor e admin. Verificar recuperação, exclusão de dados, retenção e backups.

## Gate 2 — preview Cloudflare isolado, com aprovação
1. Confirmar conta/limites Free, nome exclusivo e inexistência do Worker/Pages desejado. Não alterar outros projetos.
2. Usar a CLI Cloudflare atual `cf`, seguindo https://developers.cloudflare.com/cf/get-started/first-worker/ . Para app Vite existente, documentação orienta `cf init .`, que acrescenta `cloudflare.config.ts` e o plugin Vite; revisar TODO diff e testes antes de `cf build`.
3. Criar preview só após aprovação de nome, subdomínio e plano. Manter `ENABLE_DEMO_QUOTE_PERSISTENCE` omitido/falso; `VITE_ENABLE_QUOTE_REQUESTS=false` e sem secrets até auth/limiter revisados. Validar SPA e `/api/health` em origem real.
4. Se habilitar quotes, provisionar `FIREBASE_PROJECT_ID`, service account email/chave como **Secrets do Worker**, `QUOTE_RATE_LIMITER` com limites comprovados, ID-token/JWKS, Firestore REST e logs sanitizados. Testar replay, rate 429, A/B e chaves expiradas.
5. Testar interface a 320/390/768/1440 px, teclado, WebGL em hardware e fallback, links e exclusão. Verificar quota e custo pela conta.
6. Rollback: reverter versão de preview ao SHA anterior e desligar flag de quote imediatamente; não corrigir usando produção ou alterando dados privados sem backup.

## Gate 3 — aprovação e release
- Exigir CI PASS no **HEAD exato**, reviewer, aceites de segurança/dados/LGPD/asset, scripts de rollback e backup real.
- Promover `main` ou publicar URL pública somente após aprovação específica. Meta recorrente R$0 não assegura uso ilimitado; excedentes devem falhar sem cobrar quando possível.
- Dados e valores sintéticos devem ser substituídos por catálogo comercial legítimo e aceito. Pagamentos/transações/fornecedores não são parte da demo atual; não declarar funcionalidade que não foi implantada.
