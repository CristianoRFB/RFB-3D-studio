# Cobertura RFB Method — RFB Studio

**Interpretação:** `CODE` = existe implementação; `UNIT` = teste unitário passou em CI anterior; `E2E` = Playwright comprovou parte do fluxo; `NOT_VERIFIED` = nenhuma homologação. Isto mede uma demonstração, **não porcentagem de sistema pronto para produção**. Cada AC exige frontend, persistência real, segurança e UX para ser homologado.

| AC | Feature | Implementação demonstrativa | Evidência disponível | Lacuna para aceite integral |
|---|---|---|---|---|
| AC-01 | Visualização 3D | Three/R3F com 3 geometrias procedurais | CODE, Browser CI parcial | GPU/WebGL real validada visualmente e licenças reais |
| AC-02 | Orbit/pan/zoom | Mouse, touch, teclado | CODE, E2E acionamento parcial | Testes detalhados de navegação e dispositivos |
| AC-03 | Troca de materiais | 4 cores, fosco/metálico | CODE, UNIT, E2E seleção | Modelos reais/QA PBR |
| AC-04 | Variações de tamanho | 3 opções por produto | CODE, UNIT, E2E seleção | Modelo físico real, compatibilidade homologada |
| AC-05 | Atualização de preço | Calculadora em centavos por catálogo versionado | UNIT, E2E; Worker demo testado | Autoridade de preço do backend de produção |
| AC-06 | Salvar configuração | localStorage com esquema e reload | UNIT, E2E | Firebase Auth/Firestore, ownership e sincronização |
| AC-07 | Exportar visualização | SVG 2D original, JSON de config | CODE, E2E JSON | Captura real 3D e licenças/export fidelity |
| AC-08 | Galeria de presets | 6 presets originais, galeria editável | UNIT, E2E em revisão | Persistência multiusuário e curadoria de catálogo |
| AC-09 | Orçamento por configuração | Histórico local, versão de tabela, Worker demo | UNIT, E2E local | API autenticada e vinculante, idempotência |
| AC-10 | Qualidade reduzida | DPR reduzido e antialias off | CODE, E2E checkbox em revisão | Medições reais de memória/performance |
| AC-11 | Fallback 2D | SVG e WebGL check | E2E WebGL desativado | Testar perda de contexto e aparelhos físicos |
| AC-12 | Painel de modelos | 3 modelos locais + GLB até 8 MB apenas visual | UNIT, E2E em revisão | CRUD autenticado de modelos/licenças, armazenamento |

## Módulos originais
| Módulo | Cobertura demonstrativa | Falta para produção |
|---|---|---|
| Catálogo 3D | 3 produtos, pesquisa, escolha | CRUD confiável |
| Visualizador | R3F, 2D, controles | QA GPU/devices |
| Materiais e cores | Paletas e acabamentos | Assets reais |
| Opções e variantes | Tamanhos e acessórios | Regras comerciais aprovadas |
| Preço dinâmico | Cotação sintética | Backend e catálogo autorizado |
| Salvar design | localStorage com versão | Auth e Firestore |
| Orçamento | Simulação local/JSON | Estado e envio autenticado |
| Carrinho | Itens locais e totais | Checkout/pedidos reais |
| Biblioteca de modelos | 3 padrões, importador local GLB | Gestão de licenças e storage |
| Painel de vendas | Métricas locais e aviso | Vendedor, permissão, tenant, dados reais |

**Telas T001–T058:** catálogo íntegro em `UX-DESIGN-AND-QA.md`. Um componente pode cobrir um fluxo ou estado, não implica 58 telas implementadas. `UI_DEMO` e `LOCAL_DEMO` não são `HOMOLOGADO`.

## Critérios para alegar 90%
Somente quando pelo menos 90% dos critérios obrigatórios de aceite estiverem **HOMOLOGADOS por evidência real** e os gates críticos de autenticação, dados, custos, segurança e produção forem atendidos. A demo atual não passa essa regra.
