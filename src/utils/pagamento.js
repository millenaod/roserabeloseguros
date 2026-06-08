// Tipos de pagamento que a Thainá escolhe ao cadastrar a parcela.
// Cada um define um modelo de mensagem diferente (ver utils/whatsapp.js).
//
// `template` = nome TÉCNICO do modelo aprovado na WhatsApp Business API (via GTchat).
// `anexaBoleto` = se o template tem cabeçalho de documento (o boleto vai anexado).
// `variaveisCorpo` = variáveis posicionais do corpo do template, na ordem.
//
// Estrutura confirmada por teste real contra a Meta (07/06): os 3 templates têm cabeçalho
// Documento (boleto anexado) e 2 variáveis no corpo = (1) primeiro nome do cliente, (2) atendente.
// O nome de cada variável muda por template (named params), por isso a lista guarda os nomes reais:
//   boleto            -> cobranca_de_boleto   : anexa boleto | vars: nome, usuario
//   debito_automatico -> regularizacao_debito : anexa boleto | vars: nome, nome_usuario
//   cartao_credito    -> recusa_cartao        : anexa boleto | vars: primeiro_nome, nome_usuario
export const TIPOS_PAGAMENTO = [
  { value: 'boleto',            label: 'Boleto',            template: 'cobranca_de_boleto',   anexaBoleto: true, variaveisCorpo: ['nome', 'usuario'] },
  { value: 'debito_automatico', label: 'Débito automático', template: 'regularizacao_debito', anexaBoleto: true, variaveisCorpo: ['nome', 'nome_usuario'] },
  { value: 'cartao_credito',    label: 'Cartão de crédito', template: 'recusa_cartao',        anexaBoleto: true, variaveisCorpo: ['primeiro_nome', 'nome_usuario'] },
]

export function labelTipoPagamento(valor) {
  return TIPOS_PAGAMENTO.find(t => t.value === valor)?.label ?? null
}

// Nome do template oficial do WhatsApp para um tipo de pagamento.
export function templateWhatsApp(valor) {
  return TIPOS_PAGAMENTO.find(t => t.value === valor)?.template ?? null
}
