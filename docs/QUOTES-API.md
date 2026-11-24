# API autenticada de solicitações demonstrativas — Contrato e segurança

**Status:** IMPLEMENTADO_EM_CÓDIGO / NÃO DEPLOYADO / SEM SEGREDOS. A API só serve para **solicitações de orçamento DEMONSTRATIVAS**, sem pagamento, envio, estoque ou contrato comercial real. Publicação depende de infraestrutura isolada e validações adicionais. O endpoint público `/api/demo-quote` continua stateless.

## Endpoint privado do Worker
`POST /api/private/quotes` com:
- `Authorization: Bearer <Firebase ID token>`, validado por assinatura RS256 e claims `aud`, `iss`, `exp`, tempo de emissão e `sub` contra project ID;
- `Idempotency-Key` UUID v4, obrigatório;
- `Content-Type: application/json` e corpo `{"items":[<DesignConfig v2>...]}` (1–12, no máximo 16 KiB).
- Retorno HTTP 201 criado, 200 replay do mesmo identificador+conteúdo, 409 para identificador reutilizado com conteúdo diferente; 400/401/413/415/429/503 conforme falha.

`GET /api/private/quotes`: lista até 30 solicitações daquele usuário autenticado. Não permite escolher UID ou tenant na URL; UID sempre vem da verificação Firebase. Respostas `Cache-Control: no-store`.

## Segurança
- Os preços são recalculados no Worker com `src/catalog.ts`, ignorando valores do navegador. O catálogo atual contém **valores sintéticos** e não autoriza cotação comercial real.
- Fluxo de armazenamento Firestore REST usa OAuth do service account em segredo **exclusivamente no Worker**, nunca enviado ao navegador. Regras Firestore negam escrita client-side de orçamentos.
- Persistência usa `createDocument?documentId=<UUID>`, criada uma única vez. Em HTTP 409, busca o documento existente do mesmo UID e compara hash SHA-256 da configuração; idempotência protege contra envio duplo.
- Para liberar API, exige `ENABLE_DEMO_QUOTE_PERSISTENCE=true`, `FIREBASE_PROJECT_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` e binding Cloudflare `QUOTE_RATE_LIMITER`. Ausência de qualquer um resulta em **503 (fail closed)**.
- `QUOTE_RATE_LIMITER` usa API oficial `limit({key: uid})`, mas seus limites, namespaces e disponibilidade no plano Free DEVEM ser confirmados em ambiente autorizado antes de ativar. Sem binding, API fica desabilitada.
- Nunca logar token, chave, valor bruto do usuário ou payload completo. Sem CORS permissivo; chamar sempre mesma origem. Não armazenar PII além de identificador técnico de usuário.
- JWT via Google public JWKS, sem chamada Admin SDK; revogação imediata do token ainda não é consultada. Se requisitos exigirem revogação imediata, bloquear release até acrescentar a verificação oficial.

## Limitações verificáveis
- **Integração Firestore REST/service account e Cloudflare Rate Limiting:** código escrito, **sem teste de integração real** por falta de projeto/segredo/preview autorizado. Testes unitários injetam IO simulado e não substituem teste integrado.
- A escrita via service account bypassa as Firestore Rules, por isso a assinatura do token e o UID derivado apenas do token são OBRIGATÓRIOS.
- Cotas Free, compartilhamento do namespace do limiter, escalabilidade, revogação de tokens, monitoramento, backup e política de retenção precisam gate adicional.
- Valores enviados são simulações ilustrativas. Nenhum orçamento é enviado a fornecedores nem aprovado automaticamente.

## Extensão testada em 23/11/2026 — registro e exclusão por UID

- `DELETE /api/private/quotes/{uuid-v4}` requer o mesmo token verificado e binding de quota. O UID deriva do token; não há `uid` escolhido por parâmetro ou body. Somente o documento `/users/{verifiedUid}/quotes/{id}` pode ser excluído. Resposta `{deleted:true}` ou `{deleted:false}` se já não existir (idempotente). Nunca exclui dados de outros usuários.
- `src/cloud/CloudWorkspace.tsx` pede confirmação explícita antes de excluir uma solicitação ou design remoto e oferece exportação parcial dos próprios registros.
- Testes JWT de assinatura RS256, projeto, emissor, provedor anônimo, chave errada e expiração continuam usando chaves locais de testes.
- [CI #45305460501](https://github.com/CristianoRFB/RFB-3D-studio/actions/runs/45305460501) validou `tests/quote-emulator.test.ts` (dois usuários e **Firestore Emulator verdadeiro**, persistência de documentos, replay, conflito e exclusão), além de unitários e 40 testes Rules.
- **Limite:** integração Firestore Emulator usa adaptador de testes com permissões privilegiadas; NÃO é prova de funcionamento do `persistQuote` via OAuth/REST Cloudflare real nem da emissão/revogação de tokens em produção.
- `src/quote-summary.ts` gera arquivo TXT local e `mailto:` opcional sem destinatário, dependentes de ação expressa do usuário; jamais envia, cobra ou transforma cotação demo em proposta comercial.
- Não incluir CPF, nome, email, endereço, preços reais ou chaves de service account nos testes/snapshots.
