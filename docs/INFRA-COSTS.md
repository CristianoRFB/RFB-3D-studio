# Infraestrutura e custo — RFB Studio

**Verificação documental:** 22/11/2026. **Objetivo:** R$0/mês de custo recorrente, sem compromisso de uso ilimitado ou serviços pagos.

## Cloudflare
A documentação oficial da Cloudflare indica Worker Static Assets como hospedagem possível para React/Vite: [React + Vite](https://developers.cloudflare.com/workers/framework-guides/web-apps/react/) e [Static Assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/). No plano Workers Free (limites oficiais consultados em 22/11/2026): 100.000 invocações do script/dia, CPU 10 ms/invocação, memória 128 MiB, até 20.000 assets estáticos por versão e 25 MiB por asset. Requisições de assets estáticos são gratuitas/ilimitadas; invocações do Worker obedecem à cota Free. Conferir mudanças no [guia de limites](https://developers.cloudflare.com/workers/platform/limits/) antes do deploy.

**Estado verificado:** conta Cloudflare conectada por ferramenta de leitura; Workers existentes examinados e nenhum projeto identificado como RFB-Studio. API de listar Pages retornou 400 `8000024`, de modo que **não é possível afirmar ausência/presença de Pages**. Não criou Worker, Pages, domínio, binding ou billing. Para este projeto novo sem configuração Cloudflare, seguir a diretriz atual de uso do CLI `cf` ao criar preview autorizado; não introduzir arquivo Wrangler por inércia.

## Firebase
Firebase Spark permite iniciar Authentication e uma base Firestore com quotas gratuitas; nem todos os recursos são ilimitados. Consultas oficiais: [Planos](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [Firestore pricing](https://firebase.google.com/docs/firestore/pricing), [Authentication limits](https://firebase.google.com/docs/auth/limits). Authentication Spark com Identity Platform cita limites de 3.000 usuários ativos diários de Tier 1 e restrições específicas por provedor; Firestore oferece apenas uma base gratuita por projeto. Verificar franquias reais, usuários, região e provedores antes de qualquer ativação. Não usar SMS/telefone, Storage com cobrança, Blaze ou Cloud Billing sem autorização.

## Arquitetura sugerida
React/Vite estático em subdomínio `workers.dev` gratuito; Worker apenas para APIs de domínio quando autenticadas e com custos verificados; Firebase Auth + Firestore Spark para salvar designs com tenant/owner e Rules realmente testadas. GLB e imagens pequenas estáticos sob licença, não armazenar upload arbitrário em R2/Storage por padrão. `server/worker.ts` é prova de conceito sem implantação.

## Gates de deploy
1. Aprovação do ambiente de homologação e recursos persistentes; não reutilizar projeto Firebase de outro produto.
2. `npm ci`, typecheck, Vitest, Build, Playwright Chromium + mobile/WebGL real, scans de dependências, licenças e regras.
3. Revisar IAM, segredos, logs, migrations, rollback e quotas. Sem transações reais.
4. Deploy apenas preview isolado, testar URL e SHA, homologar antes de produção.

**R$ 0 verificado no orçamento de alterações desta rodada:** nenhum recurso pago criado; **não** afirma custo futuro universal ou status do plano de toda a conta.
