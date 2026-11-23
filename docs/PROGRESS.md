# RFB Studio — progresso e evidência

| Fatiamento | Critério | Estado em 22/11/2026 | Evidência |
|---|---|---|---|
| S001 | Conferir repo, PR, Issues e código | INSPECIONADO | PR #1 draft, branch feature/rfb-starter-pack-v1, HEAD de entrada 23035611c2da8dd86f86228231c0a0fabbe32ed4; 0 Issues abertas |
| S002 / AC-01 | Renderizar geometria 3D original com WebGL | IMPLEMENTADO_NAO_VERIFICADO | src/Viewer3D.tsx; execução browser NOT_RUN |
| S002 / AC-02 | Orbit/pan/zoom por pointer e teclado | IMPLEMENTADO_NAO_VERIFICADO | src/Viewer3D.tsx; E2E NOT_RUN |
| S002 / AC-03 | Troca de cor e acabamento | IMPLEMENTADO_NAO_VERIFICADO | src/studio.ts, src/App.tsx; unitários escritos, NOT_RUN |
| S002 / AC-10 | Qualidade reduzida | IMPLEMENTADO_NAO_VERIFICADO | botão de qualidade, dpr reduzido; avaliação real NOT_RUN |
| S002 / AC-11 | Fallback 2D | IMPLEMENTADO_NAO_VERIFICADO | SVG local e detecção WebGL; E2E WebGL off NOT_RUN |
| S004 / AC-06 (parcial) | Configuração restaurada em reload local | IMPLEMENTADO_NAO_VERIFICADO | localStorage versão 1; NÃO É persistência remota |
| S003 / AC-05 | Preço calculado de catálogo confiável | PLANEJADO | nenhum código de preço nesta fatia |
| S005 / AC-09 | Orçamento real | PLANEJADO | nenhum envio real autorizado |

## QA da revisão

- Lint/Typecheck/Vitest/Build/Playwright: **NOT_RUN**; o ambiente local não resolve github.com e não tinha as dependências do projeto instaladas.
- Checks do HEAD de entrada: nenhum status reportado; nenhum workflow run.
- CI definido em `.github/workflows/verify.yml`: **NÃO presumir PASS**, consultar execuções no novo HEAD.
- Dependências: sem lockfile no scaffold inicial. Gerar e versionar package-lock.json após instalação segura e repetir os checks.
- Aviso: este documento registra implementação em código, não homologa o comportamento no navegador.

## Riscos AntiVibeCoding

AV-01/02: comportamento gráfico e compilação sem teste -> NÃO VERIFICADO. AV-09/16: dependências e lockfile precisam de instalação CI. AV-11: apenas uma fatia, sem backend/cobrança. AV-12: acessibilidade responsiva e WebGL off precisam Playwright. AV-20: design conceitual separado de screenshot real.
