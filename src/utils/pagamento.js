// Tipos de pagamento que a Thainá escolhe ao cadastrar a parcela.
// Cada um define um modelo de mensagem diferente (ver utils/whatsapp.js).
// Todos enviam o boleto em anexo, independente do tipo.
//
// `template` = nome EXATO do modelo já aprovado na WhatsApp Business API oficial.
// Na API oficial o primeiro contato precisa usar um template aprovado pelo nome;
// o n8n usa esse nome ao disparar a cobrança automática de cada parcela.
export const TIPOS_PAGAMENTO = [
  { value: 'boleto',            label: 'Boleto',            template: 'FIN/COBRANCA COM BOLETO (API OFICIAL)' },
  { value: 'debito_automatico', label: 'Débito automático', template: 'FIN/DÉBITO EM CONTA (API OFICIAL)' },
  { value: 'cartao_credito',    label: 'Cartão de crédito', template: 'fin/envio de boleto recusa cartao (API OFICIAL) - Modelo' },
]

export function labelTipoPagamento(valor) {
  return TIPOS_PAGAMENTO.find(t => t.value === valor)?.label ?? null
}

// Nome do template oficial do WhatsApp para um tipo de pagamento.
export function templateWhatsApp(valor) {
  return TIPOS_PAGAMENTO.find(t => t.value === valor)?.template ?? null
}
