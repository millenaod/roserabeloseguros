// Tipos de pagamento que a Thainá escolhe ao cadastrar a parcela.
// Cada um define um modelo de mensagem diferente (ver utils/whatsapp.js).
// Todos enviam o boleto em anexo, independente do tipo.
export const TIPOS_PAGAMENTO = [
  { value: 'boleto',            label: 'Boleto' },
  { value: 'debito_automatico', label: 'Débito automático' },
  { value: 'cartao_credito',    label: 'Cartão de crédito' },
]

export function labelTipoPagamento(valor) {
  return TIPOS_PAGAMENTO.find(t => t.value === valor)?.label ?? null
}
