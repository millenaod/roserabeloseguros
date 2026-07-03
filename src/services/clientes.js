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

export async function atualizarCliente(id, { nome, telefone, cpf_cnpj }) {
  const { data, error } = await supabase
    .from('clientes')
    .update({ nome, telefone, cpf_cnpj })
    .eq('id', id)
    .select('id, nome, telefone, cpf_cnpj')
    .single()

  if (error) console.error('atualizarCliente:', error)
  return { data, error }
}

export async function excluirCliente(id) {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) console.error('excluirCliente:', error)
  return { error }
}
