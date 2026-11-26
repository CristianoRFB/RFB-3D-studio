# RFB Studio — arquitetura implementada e alvo de implantação

**Data:** 23/11/2026. Diagramas Mermaid representam contratos de código e fronteiras de confiança. Setas tracejadas representam integrações **desligadas/não implantadas**, não evidências de produção.

## A-01 — Componentes e fronteiras

```mermaid
flowchart LR
  U[Visitante ou usuário] --> SPA[React + Vite + R3F]
  SPA --> L[(localStorage do navegador)]
  SPA --> WebGL[Geometria 3D procedural e GLB local]
  SPA -. Firebase configurado .-> Auth[Firebase Auth]
  SPA -. Usuário autenticado .-> Rules[Firestore Rules]
  Rules --> Designs[(users / UID / designs)]
  Rules --> Models[(tenants / Tenant / models)]
  SPA -. API habilitada .-> Worker[Cloudflare Worker quote]
  Worker --> JWT[Google JWKS Firebase]
  Worker -. Servidor com secrets e limiter .-> REST[Firestore REST service account]
  REST --> Quotes[(users / UID / quotes)]
```

Estado: SPA, modelo, localStorage e UI testados em Chromium; Auth+Rules em Emulator; Worker quote mockado em Vitest; Cloudflare e Firebase reais NÃO implantados.

## A-02 — Design por usuário com revisão

```mermaid
sequenceDiagram
  actor C as Cliente
  participant UI as CloudWorkspace
  participant Auth as Firebase Auth
  participant FS as Firestore Rules / Transaction
  C->>UI: Salvar design atual
  UI->>Auth: Obter sessão autenticada
  UI->>FS: Transação users/UID/designs/ID
  FS->>FS: Verificar owner, schema e revision
  alt Documento novo
    FS-->>UI: Criado revision 1
  else Edição válida
    FS-->>UI: Atualizado revision + 1
  else Conflito ou sem acesso
    FS-->>UI: Erro de transação ou acesso negado
  end
  UI-->>C: Feedback verdadeiro / opção de recarregar
```

## A-03 — Quote autenticado e idempotente (não implantado)

```mermaid
sequenceDiagram
  actor C as Cliente
  participant SPA as Interface
  participant Worker as Worker server
  participant JWT as Firebase JWKS
  participant Limit as Limiter
  participant FS as Firestore REST
  C->>SPA: Solicitar quote demonstrativo
  SPA->>Worker: POST com ID token e UUID idempotente
  Worker->>Worker: Confirmar ambiente habilitado
  Worker->>JWT: Validar assinatura, aud, iss, exp e UID
  Worker->>Limit: Verificar quota por UID
  Worker->>Worker: Validar variantes e recalcular preço
  Worker->>FS: Criar documento único com UUID
  alt Novo
    FS-->>Worker: 201
  else Mesmo UUID e conteúdo
    FS-->>Worker: 409, GET documento, compara hash
    Worker-->>SPA: 200 replay sem duplicar
  else UUID reaproveitado para outro conteúdo
    Worker-->>SPA: 409 conflito
  end
  SPA-->>C: Solicitação apenas demonstrativa
```

**Obs.:** JWKS/OAuth/limiter e Firestore REST **não foram validados juntos num Worker remoto**. Nenhum fornecedor recebe mensagem.

## A-04 — Papéis e dados
| Operação | Visitante | Cliente | Designer | Vendedor | Admin do tenant |
|---|---|---|---|---|---|
| Ver catálogo demo local | Sim | Sim | Sim | Sim | Sim |
| CRUD do próprio design | Não | Sim | Sim | Sim | Sim |
| Ler metadados não publicados do tenant | Não | Não | Sim | Sim | Sim |
| Criar/editar modelos do tenant | Não | Não | Próprios | Não | Sim |
| Excluir modelos do tenant | Não | Não | Próprios | Não | Sim |
| Escrever quote diretamente no Firestore | Não | Não | Não | Não | Não (API confiável) |
| Modificar preço comercial ou criar pedido real | Não implementado | Não implementado | Não implementado | Não implementado | Não implementado |

Papel/tenant devem vir de **custom claims assinadas pelo Firebase**, atribuídas fora do navegador por administrador de confiança. Nenhuma seleção na UI concede permissão.

## A-05 — Render e exportação

```mermaid
flowchart LR
  Select[Produto + cor + acabamento + tamanho + acessório] --> Rules[normalizar combinações permitidas]
  Rules --> Mesh[3 geometrias originais / variante visual]
  Mesh --> GPU{WebGL utilizável?}
  GPU -->|Sim| Canvas[Viewer WebGL / mouse e teclado]
  GPU -->|Não| SVG[Preview SVG 2D]
  Canvas --> PNG[Exportar render PNG]
  SVG --> SVGFile[Exportar SVG de variação]
  Rules --> Cents[Valor sintético em centavos]
  Cents --> Save[Local ou Firestore autorizado]
```

Modelos GLB externos passam por validação 8 MB, estrutura glTF2 e restrições a URLs externas; nunca são enviados, monetizados ou incluídos em quotes.

## Contratos operacionais
- `docs/PROGRESS.md` e `PROJECT_STATUS.json`: evidência real e não realizado.
- `docs/BACKEND-SECURITY.md`: threat model.
- `docs/DEPLOY-PLAN.md`: gates de rollout sem ativar serviços pagos.

## Atualização do fluxo (23/11/2026)
- O render 3D carrega sob demanda pelo React lazy, e a prévia SVG usa módulo independente; falha de chunk passa por Error Boundary e fallback sem falsificar renderização.
- O fluxo privado tem `GET`, `POST` e `DELETE` por UUID; a identidade é derivada do ID token verificado, nunca do corpo. Testes reais de armazenamento **somente no Firestore Emulator**.
- Recuperação de conflito é por criação de cópia, sem forçar overwrite. Export de nuvem é limitado intencionalmente, não backup integral.
- No caminho local, TXT e `mailto:` são alternativas de colaboração manual sem side effects automáticos, contrato ou envio.
