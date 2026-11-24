import { brl } from './catalog';
import { COLORS, FINISHES } from './studio';
import type { DemoQuote } from './records';

/** Shareable file, never a commercial document and never transmitted by the application. */
export function quoteSummaryText(quote: DemoQuote): string {
  const header = [
    'RFB Studio — SIMULAÇÃO SEM VALIDADE COMERCIAL',
    'Este arquivo NÃO é orçamento vinculante, pagamento, pedido ou confirmação de compra.',
    'Nenhum vendedor ou fornecedor recebeu este resumo automaticamente.',
    '',
    'Identificador: ' + quote.id.slice(0, 24),
    'Data (UTC): ' + quote.createdAt.slice(0, 10),
    'Tabela ilustrativa: ' + quote.catalogVersion,
    '',
    'ITENS',
  ];
  const items = quote.lines.map((line, i) => {
    const details = [
      line.productName, 'Cor: ' + (COLORS.find(c => c.id === line.config.colorId)?.label ?? line.config.colorId),
      'Acabamento: ' + (FINISHES.find(f => f.id === line.config.finishId)?.label ?? line.config.finishId),
      'Tamanho: ' + line.sizeLabel, 'Acessório: ' + line.addonLabel,
    ];
    return [
      (i + 1) + '. ' + details.join(' · '),
      '   ' + line.config.quantity + ' × ' + brl(line.unitCents) + ' = ' + brl(line.totalCents),
    ].join('\n');
  });
  return [...header, ...items, '', 'TOTAL ILUSTRATIVO: ' + brl(quote.totalCents),
    'Frete, impostos, produção, condições e disponibilidade NÃO estão incluídos.',
    'Se o usuário decidir compartilhar este arquivo, o envio é exclusivamente manual.',
    ''].join('\n');
}
