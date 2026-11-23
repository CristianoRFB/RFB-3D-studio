# RFB Studio — fronteiras de segurança G3 (22/11/2026)

## Estado real
- Backend de produção e Firebase Authentication/Firestore: **NÃO CONECTADOS**. Não há projeto Firebase configurado para este app; sem credenciais, sem deploy, sem testes reais de Rules.
- `server/worker.ts`: endpoint computacional **DEMONSTRATIVO**, implementado em TypeScript sem dados pessoais ou persistência; `/api/health` e `POST /api/demo-quote`. Testes unitários rodados via Vitest em Node; **não houve deploy nem teste no runtime Workers**. Não usar a resposta como contrato comercial.
- `firestore.rules` e `firebase.json`: proposta de Rules para emuladores futuros, **não implantada nem homologada**. Não concede permissões administrativas. Nenhuma chave/segredo versionado.
- `src/records.ts`: persistência `localStorage` demonstrativa; qualquer usuário no mesmo navegador/perfil pode alterá-la. Não considerar os seus registros confiáveis.

## Threat model resumido
1. Cliente controla configurações e `localStorage`; preços/total nunca podem ser aceitos como autoridade de cobrança. Worker recalcula de catálogo versionado, mas continua apenas demo.
2. Auth/ownership: quando houver Firebase Auth, documentos de designs serão isolados em `/users/{uid}/designs/{id}`, com regras por `request.auth.uid`. Um usuário não deve ler/escrever dados de outro.
3. Roles: Visitante pode visualizar catálogo público; Cliente pode manter seus designs; Designer/Vendedor/Admin exigem claims controladas pelo servidor, não role no cliente ou UI oculta. **Ainda não implementado.**
4. Quotes e pedidos reais: Firestore Rules negam escritas diretas de quotes por cliente. Precisam de API autenticada/servidor de confiança com catálogo, versão, auditoria, idempotência e assinatura de eventos.
5. Sem uploads/GLB externos, URLs dinâmicas para download de terceiros, armazenamento cobrado, telefone/SMS, pagamentos nem envio a terceiros.
6. Aceites para uso real: Auth Emulator + Firestore Emulator isolados; testes anônimo, owner A, owner B e permissão negada; revisão de regras; backups; conformidade LGPD e privacidade.

## Matriz de permissões — alvo, não implementado
| Ator | Ler catálogo público | Salvar próprios designs | Editar produtos/preços | Criar quote/pedido real | Administração |
|---|---|---|---|---|---|
| Visitante | Sim | Não | Não | Não | Não |
| Cliente autenticado | Sim | Sim | Não | Solicitar via API validada | Não |
| Designer autenticado | Sim | Sim | Apenas modelos autorizados (pendente) | Solicitar via API | Não |
| Vendedor autenticado | Sim | Sim | Somente tenant autorizado (pendente) | API do tenant | Não |
| Admin autenticado | Sim | Sim | Claims + auditoria (pendente) | API administrativa | Claims verificadas |

## Plano seguro de conexão
1. Definir tenant/ownership e catálogo real. Provisionar projeto Spark de homologação **somente com autorização**, não reaproveitar banco de produção.
2. Implementar Firebase SDK e fluxo Auth real sem falsos logins, com políticas de retenção, exclusão e quotas verificadas.
3. Validar Rules no Emulator Suite com negações A/B/anônimo, payload inválido, alterado e concorrente; ajustar regras de compatibilidade por produto.
4. Conectar Worker com autenticação e backend para quotes, retries e logs sem PII. Servidor de preços é a autoridade.
5. Gerar preview Cloudflare isolado, observar custos e testar rollback; produção e merge somente após aprovação.

**BLOQUEADO para produção:** ausência de autenticação real, backend de persistência, testes Rules, revisão independente, deploy e QA completo de Browser/WebGL.
