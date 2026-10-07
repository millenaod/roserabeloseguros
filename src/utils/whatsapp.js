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
function corpoTemplate(tipo, nome, seguradora) {
  const saud = nome ? `Olá, ${nome}!` : 'Olá!'
  // "parcela do seguro Porto Seguro" com nome; "parcela do seu seguro" sem.
  const parcSeg = seguradora ? `parcela do seguro ${seguradora}` : 'parcela do seu seguro'
  switch (tipo) {
    case 'debito_automatico': // regularizacao_debito (API OFICIAL)
      return `${saud} Tudo bem?\n\n` +
        `Aqui é ${ATENDENTE}, da Rose Rabelo Seguros.\n\n` +
        `Ao verificar em sistema, identificamos que o débito programado referente à ${parcSeg} não foi concluído. Para regularização, a seguradora disponibilizou um boleto com novo vencimento.\n\n` +
        `Na sequência, envio o boleto para sua conferência.\nRose Rabelo Seguros`
    case 'cartao_credito': // recusa_cartao (API OFICIAL)
      return `${saud} Tudo bem?\n\n` +
        `Aqui é ${ATENDENTE}, da Rose Seguros.\n\n` +
        `Ao verificar em sistema, identificamos que a ${parcSeg} não foi autorizada pela operadora do cartão de crédito. Para evitar qualquer interrupção, a seguradora disponibilizou um boleto para regularização.\n\n` +
        `Na sequência, envio o boleto para sua conferência.\nRose Rabelo Seguros`
    case 'boleto': // cobranca_de_boleto (API OFICIAL)
    default:
      return `${saud}\n` +
        `Aqui é ${ATENDENTE}, da Rose Rabelo Seguros. Tudo bem?\n\n` +
        `Identificamos em nosso sistema que a ${parcSeg} consta como em aberto. Poderia, por gentileza, nos confirmar se o pagamento já foi realizado?\n` +
        `Caso tenha sido pago gentileza desconsiderar esse anexo.`
  }
}

// Mensagem pronta para revisar e enviar. Usa o texto oficial aprovado conforme o
// tipo de pagamento. No envio manual não dá para anexar arquivo, então o link do
// boleto é acrescentado no fim quando existir.
export function mensagemCobrancaPadrao(parcela) {
  const nome = (parcela.cliente_nome || '').replace(' (TESTE)', '').trim().split(' ')[0]
  const corpo = corpoTemplate(parcela.tipo_pagamento, nome, parcela.seguradora_nome)
  const boleto = parcela.boleto_url ? `\n\nBoleto: ${parcela.boleto_url}` : ''
  return corpo + boleto
}

// Link wa.me que abre o WhatsApp Web/App na conversa do cliente com a mensagem pronta.
export function linkWhatsApp(parcela, texto) {
  const numero = numeroWhatsApp(parcela.cliente_telefone)
  const msg = (texto ?? mensagemCobrancaPadrao(parcela))
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`
}

// Códigos de erro de entrega da Meta (webhook de status "failed") traduzidos
// para algo que a operadora consiga explicar ao cliente.
// Ref.: developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
const MOTIVOS_FALHA = {
  130472: 'A Meta segurou a mensagem para este número (experimento da plataforma). Tente pelo WhatsApp manual.',
  131000: 'Erro inesperado na Meta. Tente cobrar de novo mais tarde.',
  131021: 'O número do cliente é o mesmo número que envia as mensagens.',
  131026: 'Não foi possível entregar: o número pode não ter WhatsApp, estar com o app desatualizado ou ter bloqueado a empresa.',
  131031: 'A conta do WhatsApp da empresa está bloqueada na Meta.',
  131042: 'Problema de pagamento na conta do WhatsApp da empresa.',
  131047: 'Fora da janela de 24h: só é possível enviar template aprovado.',
  131049: 'A Meta limitou mensagens para este cliente (recebeu muitas mensagens de empresas). Tente mais tarde ou pelo WhatsApp manual.',
  131050: 'O cliente pediu para não receber mensagens de marketing.',
  131051: 'Tipo de mensagem não suportado.',
  131053: 'Falha ao anexar o boleto (arquivo inválido ou inacessível).',
  132000: 'O template foi enviado com variáveis faltando.',
  132001: 'O template não existe ou não está aprovado.',
  132015: 'O template está pausado pela Meta por baixa qualidade.',
  132016: 'O template foi desativado pela Meta.',
  133010: 'O número da empresa não está registrado no WhatsApp.',
}

// erro_entrega vem do n8n no formato "<código> | <título da Meta>".
export function motivoFalhaEntrega(erro) {
  if (!erro) return null
  const [codigo, ...resto] = String(erro).split('|')
  const traduzido = MOTIVOS_FALHA[Number(codigo.trim())]
  return traduzido ?? (resto.join('|').trim() || String(erro))
}

// Situação de entrega de uma mensagem de WhatsApp registrada em `contatos`.
// Retorna null para registros sem rastreio (observações, contatos antigos).
const ENTREGA = {
  enviado:  { status: 'enviado',  rotulo: 'Enviada' },
  na_fila:  { status: 'enviado',  rotulo: 'Enviada' },
  entregue: { status: 'entregue', rotulo: 'Entregue' },
  lido:     { status: 'lido',     rotulo: 'Lida' },
  falhou:   { status: 'falhou',   rotulo: 'Não entregue' },
}

export function entregaWhatsApp(contato) {
  if (!contato || contato.canal !== 'whatsapp' || contato.tipo === 'erro') return null
  const base = ENTREGA[contato.status_envio]
  if (!base) return null
  return {
    ...base,
    motivo: base.status === 'falhou' ? motivoFalhaEntrega(contato.erro_entrega) : null,
    atualizadoEm: contato.status_atualizado_em ?? null,
  }
}
