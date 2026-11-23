# AGENTS — RFBStudio / RFB Method

Fonte de verdade: `docs/ESPECIFICACAO-RFB.txt`; leia `docs/STARTER-PACK.md`, `docs/DIAGRAMAS.md`, `docs/UX-DESIGN-AND-QA.md` e `docs/ROADMAP.md`. Em toda sessão verificar GitHub HEAD, Issues/PRs, custo, permissões e gates. Atualizar `PROJECT_STATUS.json` e roadmap com evidência. A stack alvo React/TS/Vite, Firebase Auth/Firestore e Cloudflare deve respeitar **R$0/mês adicional** sempre que viável, sem ativar billing.

Sem alterações em produção, sem API/pagamentos/mensagens reais; a UI G1 é demonstrativa, não MVP. Não armazenar tokens, PII ou assets sem licença no repo público. Antes do merge exigir build, testes, verificação de dados e revisão (gates). Nunca fechar pendência sem teste ou inventar QA.

## Handoff atual G3

- PR #1 e branch `feature/rfb-starter-pack-v1` continuam como local de trabalho.
- Verificar `docs/PROGRESS.md`, `docs/METHOD-COVERAGE.md`, `docs/BACKEND-SECURITY.md` e Issues #2–#4. A demonstração já possui catálogo, customização, orçamentos sintéticos, biblioteca 3D procedural e importação GLB local; **não** é SaaS em produção.
- CI usa TypeScript, Vitest, Build e Playwright. Teste no browser só é PASS se houver execução efetiva no SHA do commit; F01 WebGL real, Firestore Rules e acessibilidade completa necessitam revisão.
- RFB Method: não fechar tickets de Firebase e produção antes de auth real/tenancy, teste de Rules com emuladores, custos e revisão independente. Não publicar preview/produção no Cloudflare nem criar recursos persistentes sem autorização do escopo apropriado.
