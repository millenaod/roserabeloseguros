import { supabase } from '@/lib/supabase'

export async function listarLotesPendentes() {
  const { data, error } = await supabase
    .from('contatos')
    .select('*, parcelas(valor, apolices(numero, clientes(nome), seguradoras(nome)))')
    .eq('status_aprovacao', 'pendente')
    .order('created_at', { ascending: false })

  if (error) console.error('listarLotesPendentes:', error)
  return { data, error }
}

export async function aprovarLote(id, motivo) {
  const { data, error } = await supabase
    .from('contatos')
    .update({ status_aprovacao: 'aprovado', motivo_aprovacao: motivo ?? null })
    .eq('id', id)
    .select('id')
    .single()

  if (error) console.error('aprovarLote:', error)
  return { data, error }
}

export async function bloquearLote(id, motivo) {
  const { data, error } = await supabase
    .from('contatos')
    .update({ status_aprovacao: 'bloqueado', motivo_aprovacao: motivo ?? null })
    .eq('id', id)
    .select('id')
    .single()

  if (error) console.error('bloquearLote:', error)
  return { data, error }
}
