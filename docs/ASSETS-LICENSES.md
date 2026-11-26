# RFB Studio — autoria dos assets G2 (22/11/2026)

- **Garrafa Aura**: forma 3D composta exclusivamente por primitivas procedurais de Three.js (cilindros e caixa), codificada em `src/Viewer3D.tsx` para esta demonstração. Nenhum GLB/GLTF ou modelo 3D de terceiros foi incorporado.
- **Fallback 2D**: SVG original definido em `src/Viewer3D.tsx`. Não é screenshot nem imagem obtida de terceiros.
- **Paleta e nomes da demonstração**: definidos localmente em `src/studio.ts`, dados sintéticos, sem alegar marca/produto comercial.
- **Bibliotecas**: Three.js e React Three Fiber são projetos open-source; conferir licenças e avisos no lockfile após instalação. Não incorporamos código-fonte dessas bibliotecas.
- **Imagens conceituais originais do ZIP**: continuam não importadas; verificar licença/autoria e SHA antes de publicação.
- **Risco**: a geometria mostra variação de acabamento por material PBR, mas não simula fisicamente um produto real. Preview 2D não representa o render 3D.

## Importação GLB local (S006)
- O código pode ler um arquivo `.glb` fornecido **pelo próprio usuário** em memória; limita 8 MB, exige glTF 2, bloqueia URLs de recursos externos e extensões obrigatórias. Nenhum arquivo é enviado ao servidor nem persistido.
- O usuário precisa deter a autoria/licença do modelo. Não fornecemos GLB de terceiros. A renderização é visual e não faz cotação comercial da peça importada.
- Modelos procedurais do catálogo e SVG 2D continuam como recursos originais e sintéticos.
