# RFB Studio — RFB Method

> **G2 demonstrativo em branch Draft.** Um visualizador procedural 3D foi implementado e **compila em CI**, mas ainda não recebeu homologação em navegador/WebGL real. Nada foi publicado em produção.

Personalização visual de produtos 3D. Slogan: **Escolha, visualize e transforme**.

## O que há nesta revisão
- Viewer WebGL original com Three.js + React Three Fiber v9: garrafa de demonstração autoral.
- Quatro cores, dois materiais, orbit/pan/zoom por ponteiro e teclado, qualidade reduzida e fallback 2D SVG.
- Configuração demonstrativa guardada em `localStorage`, sem servidor/conta. O roteiro original G1 continua acessível.
- **Não implementado:** preço dinâmico, orçamento, carrinho, autenticação, Firebase, persistência remota, envio, pagamentos ou deploy.

## Rodar localmente

```sh
npm install
npm run typecheck
npm run test
npm run build
npm run dev
```

**CI:** [GitHub Actions](https://github.com/CristianoRFB/RFB-3D-studio/actions). Na revisão de código `77856b1`, instalação, typecheck, testes e build passaram no workflow [45091528752](https://github.com/CristianoRFB/RFB-3D-studio/actions/runs/45091528752). Browser/WebGL E2E: **NOT_RUN**. Gerar e versionar o lockfile permanece pendente.

## Documentos do Starter Pack
- [Especificação original](docs/ESPECIFICACAO-RFB.txt)
- [Starter Pack](docs/STARTER-PACK.md), [Diagramas](docs/DIAGRAMAS.md) e [UX — catálogo de 58 telas](docs/UX-DESIGN-AND-QA.md)
- [Roadmap](docs/ROADMAP.md), [Proveniência](docs/PROVENIENCIA.md), [Status](PROJECT_STATUS.json)
- [Progresso e evidências](docs/PROGRESS.md), [Handoff](docs/HANDOFF.md) e [Licenças de assets](docs/ASSETS-LICENSES.md)

**Infra:** objetivo de custo recorrente adicional R$0, condicionado a limites verificados. Nenhum Firebase, Cloudflare, billing ou serviço de produção foi ativado.
