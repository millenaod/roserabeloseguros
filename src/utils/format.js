import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarData(data) {
  if (!data) return '—'
  const date = typeof data === 'string' ? parseISO(data) : data
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatarDataCurta(data) {
  if (!data) return '—'
  const date = typeof data === 'string' ? parseISO(data) : data
  return format(date, 'dd/MM', { locale: ptBR })
}
