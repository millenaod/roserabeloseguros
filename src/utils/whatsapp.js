import { formatarMoeda, formatarData } from '@/utils/format'

// Número no formato internacional, só dígitos, garantindo o 55 do Brasil.
export function numeroWhatsApp(telefone) {
  let d = String(telefone || '').replace(/\D/g, '')
  if (!d) return ''
  if (!d.startsWith('55')) d = '55' + d
  return d
}

// Mensagem de cobrança padrão, personalizada — pronta para revisar e enviar.
// Identifica a corretora (Thainá), cita a apólice, dá saída pra quem já pagou
// e abre canal de retorno (diretrizes da operação).
export function mensagemCobrancaPadrao(parcela) {
  const primeiroNome = (parcela.cliente_nome || '').replace(' (TESTE)', '').trim().split(' ')[0]
  const saudacao = primeiroNome ? `Oi ${primeiroNome}` : 'Oi'
  const valor = formatarMoeda(parcela.valor)
  const venc = formatarData(parcela.data_vencimento)
  return `${saudacao}, aqui é a Thainá da Rose Rabelo Seguros! 😊\n\n` +
    `Passando para lembrar da parcela ${parcela.numero_parcela} da sua apólice ${parcela.numero_apolice} (${parcela.seguradora_nome}), ` +
    `no valor de ${valor}, com vencimento em ${venc}.\n\n` +
    `Se já efetuou o pagamento, pode desconsiderar. Qualquer dúvida, é só me responder por aqui!`
}

// Link wa.me que abre o WhatsApp Web/App na conversa do cliente com a mensagem pronta.
export function linkWhatsApp(parcela, texto) {
  const numero = numeroWhatsApp(parcela.cliente_telefone)
  const msg = (texto ?? mensagemCobrancaPadrao(parcela))
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`
}
