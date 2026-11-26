# Infraestrutura e custo — RFB Studio (23/11/2026)

**Meta:** custo recorrente adicional de R$ 0/mês, dentro de franquias oficiais, sem garantias de uso ilimitado nem criação automática de contas pagas.

## Inventário consultado, sem mutação
- Conta Cloudflare conectada em leitura: **67 Workers** e **9 projetos Pages** existentes listados pela API, sem projeto identificado como RFB Studio.
- Inicialmente `GET /pages/projects` com parâmetros `page/per_page` retornou HTTP 400 `8000024`. Sem os parâmetros, o endpoint listou os 9 projetos corretamente. Nenhum projeto Pages/RFB novo foi criado.
- Não houve criação de Worker, Pages, R2, domínio, secrets, DNS, Firebase, billing nem deploy.
- Os screenshots `rfb-studio-browser-qa` e build `rfb-studio-dist` são artefatos temporários GitHub Actions, **não hospedagem pública**.

## Escolha de stack
- Frontend React/Vite SPA + Three.js, estático Cloudflare Workers Static Assets em subdomínio gratuito `*.workers.dev`, quando aprovado. Documentação: https://developers.cloudflare.com/workers/framework-guides/web-apps/react/ e https://developers.cloudflare.com/workers/static-assets/
- Worker de API pequena `server/worker.ts`, sem emissão de quote autenticado por padrão; requer `QUOTE_RATE_LIMITER` e serviço OAuth Firebase para ativação. Referência: https://developers.cloudflare.com/workers/
- Firebase Authentication email/senha e Firestore no Spark em projeto isolado, respeitando quotas e método de autenticação. Referências: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans e https://firebase.google.com/docs/firestore/pricing
- Dependências fixadas em `package-lock.json`; `@grpc/grpc-js` corrigida para 1.14.7 via override depois de falha da auditoria de produção.
- Não habilitar Storage, SMS, pagamento, R2, Blaze, Workers Paid, domínio comprado nem terceira API com tarifa sem análise específica.

## CLI Cloudflare e bloqueios
O projeto ainda não possui configuração Cloudflare de deploy. A orientação oficial da Cloudflare para projetos novos sem Wrangler é usar `cf` (CLI, release candidate em novembro de 2026), com `cloudflare.config.ts` e Vite plugin após `cf init .`: https://developers.cloudflare.com/cf/get-started/first-worker/ . Não inventar comandos/config não testados; só executar após autorização de um preview isolado.

Conferir plano Free, quotas de CPU/requisição/limiter, autenticação, binding, secrets, logs, rollback e URL antes de marcar `DEPLOYED`. Para este ciclo, **nenhum serviço novo foi cobrado ou ativado**; não é previsão de custo universal.
