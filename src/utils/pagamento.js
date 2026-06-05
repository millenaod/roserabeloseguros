// Tipos de pagamento que a Thainá escolhe ao cadastrar a parcela.
// Cada um define um modelo de mensagem diferente (ver utils/whatsapp.js).
//
// `template` = nome TÉCNICO do modelo aprovado na WhatsApp Business API (via GTchat).
// `anexaBoleto` = se o template tem cabeçalho de documento (o boleto vai anexado).
// `variaveisCorpo` = variáveis posicionais do corpo do template, na ordem.
//
// Estrutura confirmada por teste real no GTchat (cada template é diferente):
//   boleto            -> lembrete_boleto    : anexa boleto, 0 variáveis
//   debito_automatico -> autorizacao_debito : SEM anexo, 0 variáveis (boleto iria em msg separada)
//   cartao_credito    -> recusa_cartao      : anexa boleto, 2 variáveis (cliente, atendente)
export const TIPOS_PAGAMENTO = [
  { value: 'boleto',            label: 'Boleto',            template: 'lembrete_boleto',    anexaBoleto: true,  variaveisCorpo: [] },
  { value: 'debito_automatico', label: 'Débito automático', template: 'autorizacao_debito', anexaBoleto: false, variaveisCorpo: [] },
  { value: 'cartao_credito',    label: 'Cartão de crédito', template: 'recusa_cartao',      anexaBoleto: true,  variaveisCorpo: ['primeiro_nome', 'nome_usuario'] },
]

export function labelTipoPagamento(valor) {
  return TIPOS_PAGAMENTO.find(t => t.value === valor)?.label ?? null
}

// Nome do template oficial do WhatsApp para um tipo de pagamento.
export function templateWhatsApp(valor) {
  return TIPOS_PAGAMENTO.find(t => t.value === valor)?.template ?? null
}
