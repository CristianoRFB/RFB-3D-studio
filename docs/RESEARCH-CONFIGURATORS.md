# RFB Studio — pesquisa comparativa de configuradores de produtos 3D

**Consulta:** 23/11/2026. **Objetivo do G0 RFB Method:** analisar quatro soluções reais do nicho, justificar a primeira entrega, identificar padrões de UX e riscos técnicos. Fontes oficiais listadas ao final. **Não copiamos código, assets ou telas de terceiros.**

## Tabela comparativa

| Referência | Capacidades verificadas nas fontes oficiais | Decisão de UX para RFB Studio | Lacuna/riscos de produção |
|---|---|---|---|
| Zakeke | Configurador 3D com materiais, componentes, prévia 2D, presets e interação orientada. Documentação de novembro de 2026 descreve espaço de trabalho com 3 editores, um viewport 3D e cartões/hotspots. | Manter visualizador sempre visível e agrupar opções em controles simples, não replicar os 3 editores completos nesta fase. Focar no fluxo primeiro produto→ajustes→prévia→salvar. | Uploads e composição de mídia exigem licenças, limites e sanitização; sem IA/hotspots nesta demonstração. |
| Threekit | Configuração visual 3D em tempo real; suporta presets e combinações de produtos aninhadas, com regras de partes/opções. | Presets e regras de incompatibilidade centralizadas são fundamentais para evitar combinações impossíveis. Usar UX incremental, não um formulário gigante. | Regras reais de manufatura, BOM, AR e assets comerciais continuam fora do escopo homologado. |
| Kickflip | Prévia visual imediata por opções de cores, materiais, tamanho, textos e logos; possibilidade de integração a plataformas de e-commerce. | Swatches com nomes acessíveis, preço próximo às opções, ações explícitas de salvar/exportar/continuar e mobile sem scroll horizontal. | Não afirmar plugins Shopify/Wix/WooCommerce, upload de logo ou comércio real sem integração. |
| Expivi | Configurador com opções e variantes, precificação, regras de produtos, 2D/3D, composição de listas de materiais e propostas. | Distinguir claramente catálogo, regra de compatibilidade, cotação calculada e pedido comercial. Orçamento sintético nunca é recibo ou compra. | CPQ, ordens, preço vinculante, administração de produção e idempotência real precisam de dados/tenants/integração autenticada. |

## Direção visual e fluxo escolhido
1. **Preview como foco:** viewport 3D em destaque, controles à direita em desktop e empilhados em mobile. Preservar rótulos legíveis e ação final não obstruída.
2. **Interação objetiva:** 4 swatches com `aria-pressed`, acabamentos, tamanho, acessório, quantidade e preço recalculado. Rotação/zoom/teclado e fallback 2D.
3. **Feedback e continuidade:** salvar design local/nuvem, presets, preview PNG/SVG, histórico, estados vazios/erros/offline e backup local; nenhuma confirmação fictícia de compra.
4. **Público inicial:** pessoa escolhendo uma configuração visual de produto; três produtos **sintéticos e autorais**, não estoque real. Diferencial de portfólio: funcionamento independente de SaaS proprietário com custo recorrente pretendido R$0.
5. **Limites:** não simular AR, reprodutor de vídeo, IA, pagamentos ou edição de GLB de terceiros como se fossem recursos homologados. Não transformar os 58 T-IDs em telas artificiais sem função.
6. **Usuário mobile:** controles alvo >=44 px quando viável, teclado, `prefers-reduced-motion`, qualidade reduzida, leitura de estado real e tratamento de perda de WebGL.
7. **Custo & software:** React + Three/R3F e assets procedurais sob autoria deste projeto. Considerar `<model-viewer>` (biblioteca aberta) como alternativa técnica para casos de exibição simples; não é o mecanismo implementado.

## Referências visuais examinadas — NÃO copiadas
- Kickflip, demonstrações com painel de cores/opções e preview de produto: https://gokickflip.com/product-configurator e https://gokickflip.com/features
- Zakeke, interface do configurador e editor de Engajamento: https://zakeke.zendesk.com/hc/en-us/articles/28811589965468-The-configurator-your-customers-see
- Zakeke, atualização 2026: https://zakeke.zendesk.com/hc/en-us/articles/31872041807260-Product-Update-November-2026

Imagens ilustrativas de produtos dessas empresas permanecem SOMENTE nas fontes citadas; nenhuma imagem ou modelo de terceiros foi versionado para o RFB Studio.

## Referências oficiais para auditoria
1. https://www.zakeke.com/features/
2. https://zakeke.zendesk.com/hc/en-us/articles/360009350574-Introduction-to-the-3D-Product-Configurator
3. https://zakeke.zendesk.com/hc/en-us/articles/31872041807260-Product-Update-November-2026
4. https://www.threekit.com/feature/configuration
5. https://gokickflip.com/product-configurator
6. https://help.gokickflip.com/en/articles/4579577-what-you-can-build-with-kickflip
7. https://docs.expivi.com/docs/cpq-configuration/
8. https://www.expivi.com/3d-configurator/
9. https://github.com/google/model-viewer/blob/master/packages/model-viewer/README.md

**Status do gate:** `RESEARCH_DOCUMENTED`, sem afirmar validação de mercado real, teste com usuários ou paridade comercial com as soluções. Não constitui endosso das empresas.
