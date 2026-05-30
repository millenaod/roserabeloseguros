import { supabase } from '@/lib/supabase'

export async function buscarClientes(query) {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nome, telefone')
    .ilike('nome', `%${query}%`)
    .limit(10)

  if (error) console.error('buscarClientes:', error)
  return { data, error }
}

export async function criarCliente(dados) {
  const { data, error } = await supabase
    .from('clientes')
    .insert(dados)
    .select('id, nome, telefone')
    .single()

  if (error) console.error('criarCliente:', error)
  return { data, error }
}
