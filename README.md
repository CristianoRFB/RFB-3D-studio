# RFB Studio — RFB Method

> **Estado:** G3, demonstração funcional em desenvolvimento, testada em Chromium CI. **Não é serviço comercial pronto**; sem Firebase/Cloudflare ativo, contas reais, pagamentos ou pedidos enviados. PR #1 permanece Draft.

**Escolha, visualize e transforme.** Configurador de produtos 3D com React 19, TypeScript, Vite, Three.js e React Three Fiber.

## Funcionalidades da demonstração

- 3 modelos procedurais originais: Garrafa Aura, Luminária Órbita e Vaso Nexo; renderização WebGL, modo reduzido e fallback 2D.
- Controles orbit/pan/zoom por mouse, touch e teclado; 4 cores, acabamentos, tamanho, acessórios e quantidades.
- Preços de demonstração calculados de um catálogo versionado em centavos, com regras de compatibilidade.
- 6 presets, pesquisa no catálogo, designs salvos localmente, carrinho e orçamentos simulados.
- Exportar config JSON, prévia 2D SVG e link de configuração sem dados pessoais.
- Prévia de GLB local com validação de formato/tamanho/referências externas; **não** pode ser salva, precificada nem enviada para venda.
- Painel com métricas apenas do armazenamento local; sem simulação enganosa de login administrativo.
- Endpoint computacional `server/worker.ts` para cotação DEMO: ainda não publicado, com testes negativos.

## Executar (Node.js 22)

```sh
npm ci
npm run typecheck
npm run test
npm run build
npx playwright install --with-deps chromium
npm run e2e
npm run dev
```

**Lockfile:** `package-lock.json` versionado pelo CI; `npm ci` reproduz as dependências. Os gates devem ser reexecutados no HEAD atual.

- [CI e relatórios](https://github.com/CristianoRFB/RFB-3D-studio/actions)
- [PR #1 — desenvolvimento](https://github.com/CristianoRFB/RFB-3D-studio/pull/1)
- [Roadmap](docs/ROADMAP.md) · [Progresso](docs/PROGRESS.md) · [Cobertura AC](docs/METHOD-COVERAGE.md) · [Handoff](docs/HANDOFF.md)
- [Especificação original](docs/ESPECIFICACAO-RFB.txt) · [Starter Pack](docs/STARTER-PACK.md) · [Diagramas](docs/DIAGRAMAS.md)
- [Catálogo UX de 58 T-IDs](docs/UX-DESIGN-AND-QA.md) · [Licença dos assets](docs/ASSETS-LICENSES.md)
- [Segurança e backend](docs/BACKEND-SECURITY.md) · [Infraestrutura e custo](docs/INFRA-COSTS.md)

A aplicação usa apenas dados sintéticos; nenhuma forma de autorização, persistência remota, cotação vinculante, pagamento ou envio real foi integrada. O objetivo de custo recorrente é R$ 0, condicionado a franquias verificadas e aprovação de infraestrutura.
