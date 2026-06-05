// Número no formato internacional, só dígitos, garantindo o 55 do Brasil.
export function numeroWhatsApp(telefone) {
  let d = String(telefone || '').replace(/\D/g, '')
  if (!d) return ''
  if (!d.startsWith('55')) d = '55' + d
  return d
}

// Nome da atendente que assina as mensagens.
// Preenche a variável {{usuario}}/{{nome_usuario}} dos templates oficiais.
const ATENDENTE = 'Thainá'

// Reproduz o texto EXATO dos templates já aprovados na WhatsApp Business API,
// por tipo de pagamento (ver utils/pagamento.js para os nomes oficiais).
// Mantém paridade entre o envio manual (wa.me) e o disparo oficial via n8n.
function corpoTemplate(tipo, nome) {
  const saud = nome ? `Olá, ${nome}!` : 'Olá!'
  switch (tipo) {
    case 'debito_automatico': // FIN/DÉBITO EM CONTA (API OFICIAL)
      return `${saud} Tudo bem?\n\n` +
        `Aqui é ${ATENDENTE}, da Rose Rabelo Seguros.\n\n` +
        `Ao verificar em sistema, identificamos que o débito programado referente à parcela do seguro não foi concluído. Para regularização, a seguradora disponibilizou um boleto com novo vencimento.\n\n` +
        `Na sequência, envio o boleto para sua conferência.\nRose Rabelo Seguros`
    case 'cartao_credito': // fin/envio de boleto recusa cartao (API OFICIAL) - Modelo
      return `${saud} Tudo bem?\n\n` +
        `Aqui é ${ATENDENTE}, da Rose Seguros.\n\n` +
        `Ao verificar em sistema, identificamos que a parcela do seu seguro não foi autorizada pela operadora do cartão de crédito. Para evitar qualquer interrupção, a seguradora disponibilizou um boleto para regularização.\n\n` +
        `Na sequência, envio o boleto para sua conferência.\nRose Rabelo Seguros`
    case 'boleto': // FIN/COBRANCA COM BOLETO (API OFICIAL)
    default:
      return `${saud}\n` +
        `Aqui é ${ATENDENTE}, da Rose Rabelo Seguros. Tudo bem?\n\n` +
        `Identificamos em nosso sistema que a parcela do seu seguro consta como em aberto. Poderia, por gentileza, nos confirmar se o pagamento já foi realizado?\n` +
        `Caso tenha sido pago gentileza desconsiderar esse anexo.`
  }
}

// Mensagem pronta para revisar e enviar. Usa o texto oficial aprovado conforme o
// tipo de pagamento. No envio manual não dá para anexar arquivo, então o link do
// boleto é acrescentado no fim quando existir.
export function mensagemCobrancaPadrao(parcela) {
  const nome = (parcela.cliente_nome || '').replace(' (TESTE)', '').trim().split(' ')[0]
  const corpo = corpoTemplate(parcela.tipo_pagamento, nome)
  const boleto = parcela.boleto_url ? `\n\nBoleto: ${parcela.boleto_url}` : ''
  return corpo + boleto
}

// Link wa.me que abre o WhatsApp Web/App na conversa do cliente com a mensagem pronta.
export function linkWhatsApp(parcela, texto) {
  const numero = numeroWhatsApp(parcela.cliente_telefone)
  const msg = (texto ?? mensagemCobrancaPadrao(parcela))
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`
}
