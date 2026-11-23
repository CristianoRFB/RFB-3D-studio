# RFB Studio — configurador 3D | RFB Method

**Estado verificado em 23/11/2026:** aplicação demonstrativa G4 implementada e testada no Chromium, WebGL via SwiftShader e Firebase Emulator. **Não há deploy Cloudflare/Firebase real e não se trata de sistema comercial homologado.** Desenvolvimento em [PR #1 Draft](https://github.com/CristianoRFB/RFB-3D-studio/pull/1), sem merge na `main`.

> **Escolha, visualize e transforme.** Configurador visual de produtos 3D usando React 19, TypeScript, Vite, Three.js, React Three Fiber e integrações Firebase opcionais.

## O que funciona no código e no ambiente de testes

- **Render 3D:** Garrafa Aura, Luminária Órbita e Vaso Nexo — geometria procedural original; rotação, zoom, pan, acabamento e tamanho, com acessórios visuais efetivos.
- **Fallback/acessibilidade:** prévia 2D com acessórios, modo qualidade reduzida, teclado, `prefers-reduced-motion` e WebGL no Chromium/SwiftShader.
- **Catálogo:** busca, 4 cores, acabamentos, 3 tamanhos, acessórios, quantidades 1–10, 6 presets e regras de compatibilidade/preço em centavos.
- **Designs e orçamento locais:** edição, salvar/retomar, carrinho, simulações, métricas locais, links de configuração, export JSON, SVG e screenshot PNG 3D.
- **Privacidade:** backup local JSON, restauração com validação, exclusão confirmada e aviso de offline.
- **Importação GLB local:** até 8 MB; glTF 2.0 com validação de geometria e referências internas; nenhuma mídia é enviada ou precificada automaticamente.
- **Firebase opcional:** cadastro/login/logout/recuperação de acesso e CRUD de designs por UID com revisão; verificados com Authentication e Firestore Emulator e duas contas sintéticas.
- **Modelos por tenant:** metadados de modelos originais, permissões de Designer/Vendedor/Admin atribuídas por custom claims, com negações de acesso entre usuários/tenants testadas em emuladores.
- **Worker opcional:** `/api/demo-quote` stateless; `/api/private/quotes` autenticado, com rate limiting e idempotência, desligado por padrão até configurar infraestrutura de confiança. **Não há pagamentos ou mensagens reais.**

## Ambiente de desenvolvimento

Node.js 22, `npm ci` a partir de lockfile versionado e nenhum segredo incluído no GitHub:

```sh
npm ci
npm run typecheck
npm run test
npm run build
npm run perf:budget
npm run rules:test
npx playwright install --with-deps chromium
npm run e2e
npm run dev
```

A execução de CI inclui também o modo WebGL e o teste Auth+Firestore em emuladores separados, com variáveis de ambiente **sintéticas**. Para configurar um projeto Firebase autorizado, começar em [`.env.example`](.env.example) e seguir [DEPLOY-PLAN.md](docs/DEPLOY-PLAN.md). O backend de quote requer segredos server-side e binding de Rate Limiting, nunca variáveis `VITE_*`.

## Evidência

- [CI do código 35f822ca: 24 testes unitários; 40 verificações Firestore; 7 E2E comuns, 2 WebGL e 1 Auth; `npm ci`, audit e build](https://github.com/CristianoRFB/RFB-3D-studio/actions/runs/45179480137).
- Orçamento de bundles verificado: **340 KiB gzip inicial / 516,7 KiB gzip total JS**. Não é um resultado Lighthouse ou medição de FPS.
- [Progresso e critérios AC](docs/METHOD-COVERAGE.md) · [Handoff](docs/HANDOFF.md) · [Roadmap](docs/ROADMAP.md) · [Segurança](docs/BACKEND-SECURITY.md).
- [Especificação original](docs/ESPECIFICACAO-RFB.txt) · [Starter Pack](docs/STARTER-PACK.md) · [Diagramas](docs/DIAGRAMAS.md) · [Arquitetura de implementação](docs/ARCHITECTURE-IMPLEMENTED.md).
- [Pesquisa comparativa G0](docs/RESEARCH-CONFIGURATORS.md) · [58 telas e UX](docs/UX-DESIGN-AND-QA.md) · [Assets e licenças](docs/ASSETS-LICENSES.md) · [Infra/custo](docs/INFRA-COSTS.md).

**Bloqueios atuais:** Firebase real/claims/credenciais, Worker + persistência testados no runtime Cloudflare, autorização e QA de preview isolado, acessibilidade/dispositivos físicos e validação comercial. [Issue #2](https://github.com/CristianoRFB/RFB-3D-studio/issues/2), [#3](https://github.com/CristianoRFB/RFB-3D-studio/issues/3) e [#4](https://github.com/CristianoRFB/RFB-3D-studio/issues/4) permanecem abertas. **Meta de R$0/mês adicional**, sujeita a quotas verificadas; nenhum billing foi ativado.
