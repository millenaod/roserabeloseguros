import { formatarMoeda, formatarData } from './format'

export function exportarCsv(parcelas, nomeArquivo = 'relatorio') {
  const cabecalho = ['Cliente', 'Seguradora', 'Apólice', 'Parcela', 'Valor', 'Vencimento', 'Status', 'Tentativas']

  const linhas = parcelas.map(p => [
    p.nome_cliente ?? '',
    p.seguradora ?? '',
    p.numero_apolice ?? '',
    p.numero ?? '',
    formatarMoeda(p.valor ?? 0),
    formatarData(p.data_vencimento),
    p.status ?? '',
    p.tentativas ?? 0,
  ])

  const conteudo = [cabecalho, ...linhas]
    .map(linha => linha.map(cel => `"${String(cel).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `${nomeArquivo}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
