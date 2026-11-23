# RFBSTUDIO — Diagramas do Starter Pack (Mermaid editável)

> **ORIGEM:** entidades/estados/jornada retirados de `ESPECIFICACAO-RFB.txt`; relações propostas transcritas de `repos-individuais/06-rfbstudio/DATA/RELACOES-DE-DOMINIO.md` do ZIP original enviado. Toda associação é **proposta**, sem cardinalidade homologada. **Nenhum desses gráficos comprova aplicação ou banco existente.** Mermaid é notação prática, não substitui artefato UML formal.

## D-001 — Atores e casos de uso (mapeamento inicial)

```mermaid
flowchart LR
  A1["Visitante"]
  A2["Cliente"]
  A3["Designer"]
  A4["Vendedor"]
  A5["Administrador"]
  UC1(["UC-01: Visualização 3D"])
  UC2(["UC-02: Orbit/pan/zoom acessíveis"])
  UC3(["UC-03: Troca de materiais"])
  UC4(["UC-04: Variações de tamanho"])
  UC5(["UC-05: Atualização de preço"])
  UC6(["UC-06: Salvar configuração"])
  A1 --> UC1
  A2 --> UC2
  A3 --> UC3
  A4 --> UC4
  A5 --> UC5
  UC1 --> SYS["RFBSTUDIO (conceito)"]
  UC2 --> SYS["RFBSTUDIO (conceito)"]
  UC3 --> SYS["RFBSTUDIO (conceito)"]
  UC4 --> SYS["RFBSTUDIO (conceito)"]
  UC5 --> SYS["RFBSTUDIO (conceito)"]
  UC6 --> SYS["RFBSTUDIO (conceito)"]
```

O mapeamento é exploratório. Atribuição ator→caso tem de ser validada com a matriz de permissões; a ordem dos papéis na fonte não determina autorização automática.

## D-002 — Modelo conceitual de classes

```mermaid
classDiagram
  class Usuario {
    +string id
    +string status
    +string ownerId
    +int version
  }
  class Produto {
    +string id
    +string status
    +string ownerId
    +int version
  }
  class Modelo3D {
    +string id
    +string status
    +string ownerId
    +int version
  }
  class Material {
    +string id
    +string status
    +string ownerId
    +int version
  }
  class Variante {
    +string id
    +string status
    +string ownerId
    +int version
  }
  class Configuracao {
    +string id
    +string status
    +string ownerId
    +int version
  }
  class Opcao {
    +string id
    +string status
    +string ownerId
    +int version
  }
  class Orcamento {
    +string id
    +string status
    +string ownerId
    +int version
  }
  class Pedido {
    +string id
    +string status
    +string ownerId
    +int version
  }
  class ImagemRender {
    +string id
    +string status
    +string ownerId
    +int version
  }
  class LicencaModelo {
    +string id
    +string status
    +string ownerId
    +int version
  }
  Produto --> Modelo3D : representa
  Produto --> Variante : contém
  Modelo3D --> Material : utiliza
  Configuracao --> Opcao : seleciona
  Usuario --> Configuracao : salva
  Configuracao --> Orcamento : calcula
  Orcamento --> Pedido : converte
  Modelo3D --> ImagemRender : gera
```

**Relações propostas da fonte (a validar):**
- `Produto` → `Modelo3D` — representa
- `Produto` → `Variante` — contém
- `Modelo3D` → `Material` — utiliza
- `Configuracao` → `Opcao` — seleciona
- `Usuario` → `Configuracao` — salva
- `Configuracao` → `Orcamento` — calcula
- `Orcamento` → `Pedido` — converte
- `Modelo3D` → `ImagemRender` — gera

Não são FK/coleções já criadas. `ownerId`/`version` são campos candidatos genéricos definidos no caderno; modelagem real terá índices, escopo de tenant, constraints e testes de concorrência.

## D-003 — Entidade-relacionamento sem cardinalidades inventadas

```mermaid
erDiagram
  Usuario {
    string id PK
    string status
    string ownerId
    datetime createdAt
  }
  Produto {
    string id PK
    string status
    string ownerId
    datetime createdAt
  }
  Modelo3D {
    string id PK
    string status
    string ownerId
    datetime createdAt
  }
  Material {
    string id PK
    string status
    string ownerId
    datetime createdAt
  }
  Variante {
    string id PK
    string status
    string ownerId
    datetime createdAt
  }
  Configuracao {
    string id PK
    string status
    string ownerId
    datetime createdAt
  }
  Opcao {
    string id PK
    string status
    string ownerId
    datetime createdAt
  }
  Orcamento {
    string id PK
    string status
    string ownerId
    datetime createdAt
  }
  Pedido {
    string id PK
    string status
    string ownerId
    datetime createdAt
  }
  ImagemRender {
    string id PK
    string status
    string ownerId
    datetime createdAt
  }
  LicencaModelo {
    string id PK
    string status
    string ownerId
    datetime createdAt
  }
```

Os nomes provêm do planejamento; as relações estão em D-002 mas **deliberadamente sem 1:1, 1:N ou N:M**, pois o ZIP proíbe inferir cardinalidade automaticamente. Definir cardinalidades, deleção, transações e tenant invariants antes do Firestore.

## D-004 — Arquitetura de contêineres candidata (visão C4 aproximada)

```mermaid
flowchart LR
  U["Visitante / Cliente"] --> UI["React + TypeScript + Vite
SPA/PWA (PLANEJADO)"]
  UI --> AUTH["Firebase Auth (PLANEJADO)"]
  UI --> API["Cloudflare Worker (PLANEJADO)"]
  API --> DB["Firestore Standard / Emulator (PLANEJADO)"]
  AUTH -. token validado .-> API
  TEST["Vitest + Playwright + Rules Emulator"] -. verifica .-> UI
  TEST -. verifica .-> API
```

Antes de deploy confirmar configuração atual de Cloudflare, Firebase Spark, SDK no runtime, limites/custos, upload, autenticação e isolamento. A arquitetura acima NÃO está operacional.

## D-005 — Sequência do fluxo principal (planejado)

```mermaid
sequenceDiagram
  actor U as Pessoa usuária de teste
  participant UI as SPA / Interface
  participant API as API autorizada (planejada)
  participant DB as Firebase Emulator (planejado)
  U->>UI: 1. Escolher produto
  UI->>API: Validar ação e autorização (1)
  API->>DB: Transação/consulta sintética (se aplicável)
  DB-->>API: Resultado de teste
  API-->>UI: Resultado ou erro autorizado
  U->>UI: 2. Carregar modelo
  UI->>API: Validar ação e autorização (2)
  API->>DB: Transação/consulta sintética (se aplicável)
  DB-->>API: Resultado de teste
  API-->>UI: Resultado ou erro autorizado
  U->>UI: 3. Alterar cor/material
  UI->>API: Validar ação e autorização (3)
  API->>DB: Transação/consulta sintética (se aplicável)
  DB-->>API: Resultado de teste
  API-->>UI: Resultado ou erro autorizado
  U->>UI: 4. Recalcular preço
  UI->>API: Validar ação e autorização (4)
  API->>DB: Transação/consulta sintética (se aplicável)
  DB-->>API: Resultado de teste
  API-->>UI: Resultado ou erro autorizado
  U->>UI: 5. Salvar configuração
  UI->>API: Validar ação e autorização (5)
  API->>DB: Transação/consulta sintética (se aplicável)
  DB-->>API: Resultado de teste
  API-->>UI: Resultado ou erro autorizado
  U->>UI: 6. Enviar orçamento
  UI->>API: Validar ação e autorização (6)
  API->>DB: Transação/consulta sintética (se aplicável)
  DB-->>API: Resultado de teste
  API-->>UI: Resultado ou erro autorizado
  UI-->>U: Estado final ou recuperação
```

Pseudointeração, não endpoints existentes. Criar contratos reais em G1/G2, incluir falha de rede, permissão negada, retry, duplicação e concorrência.

## D-006 — Máquina de estados do domínio (fonte)

```mermaid
stateDiagram-v2
  [*] --> S0
  state "inicial" as S0
  state "personalizando" as S1
  state "salva" as S2
  state "orcada" as S3
  state "enviada" as S4
  state "aprovada" as S5
  S0 --> S1
  S1 --> S2
  S2 --> S3
  S3 --> S4
  S4 --> S5
  S5 --> [*]
```

Transições não autorizadas devem ser recusadas; definir precondição, agente, logs, efeitos transacionais e reversões para cada aresta.

## D-007 — Atividade e exceção principal

```mermaid
flowchart TD
  START(["Iniciar RFBSTUDIO"]) --> GUARD{"Autorização e dados válidos?"}
  GUARD -- "Não" --> DENY["Erro seguro e recuperação"]
  GUARD -- "Sim" --> T1["Escolher produto"]
  T1 --> T2["Carregar modelo"]
  T2 --> T3["Alterar cor/material"]
  T3 --> T4["Recalcular preço"]
  T4 --> T5["Salvar configuração"]
  T5 --> T6["Enviar orçamento"]
  T6 --> END(["Fluxo demonstrado com dados sintéticos"])
  DENY --> START
```

O diagrama representa o cenário mínimo. Cenários alternativos não estão todos detalhados; desenvolver quando o primeiro fluxo estiver em código.

## Catálogo de diagramas: aplicabilidade de 14 UML + 4 C4 + ERD

| Tipo considerado | Estado |
|---|---|
| UML: casos de uso | RASCUNHO — atores e casos via fluxograma Mermaid, revisar UML formal |
| UML: classes | RASCUNHO — entidades e relações propostas do ZIP |
| UML: objetos | AVALIAR necessidade após contratos de dados |
| UML: pacotes | AVALIAR quando os módulos forem implementados |
| UML: componentes | AVALIAR depois da definição da API |
| UML: estrutura composta | AVALIAR apenas se houver interfaces internas complexas |
| UML: implantação | AVALIAR após decisão Cloudflare/Firebase e staging |
| UML: perfis | AVALIAR necessidade de estereótipos específicos |
| UML: atividades | RASCUNHO — jornada com autorização/erro |
| UML: estados | RASCUNHO — sequência de estados original |
| UML: sequência | RASCUNHO — interações previstas, backend NÃO implementado |
| UML: comunicação | AVALIAR após contrato de comunicação |
| UML: visão geral de interação | AVALIAR para fluxos concorrentes complexos |
| UML: timing | AVALIAR apenas se tempo/liveness for requisito |
| C4: contexto | RASCUNHO — atores externos ainda devem ser confirmados |
| C4: contêineres | RASCUNHO — stack original candidata, não deployed |
| C4: componentes | AVALIAR após implementação de API/UI |
| C4: código | AVALIAR após G2, sem diagrama vazio artificial |
| ERD | RASCUNHO — entidades sem inventar cardinalidades |

**Critério de manutenção:** requisitos `F-IDs` e telas `T001..T058` devem indicar o D-ID pertinente; nenhuma classe/relacionamento vai para produção sem teste Rules/contratos e revisão de modelagem. Diagramas de objetos, perfil, timing, composite structure etc. NÃO são gerados apenas para preencher catálogo quando não são adequados.
