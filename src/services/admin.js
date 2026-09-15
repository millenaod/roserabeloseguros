import { supabase } from '@/lib/supabase'

// Operações do painel super-admin. A RPC admin_list_orgs (SECURITY DEFINER) checa
// is_super_admin() no banco — o gate do front é só UX, a autorização real é no banco.
export async function listarEmpresas() {
  const { data, error } = await supabase.rpc('admin_list_orgs')
  if (error) console.error('listarEmpresas:', error)
  return { data: data ?? [], error }
}

// Cria uma nova empresa e convida o dono por e-mail (edge function admin-org-create,
// que valida super_admin no servidor). Devolve { error: mensagem } amigável em caso de falha.
export async function criarEmpresa({ nomeEmpresa, emailDono, nomeDono }) {
  const { data, error } = await supabase.functions.invoke('admin-org-create', {
    body: {
      nomeEmpresa,
      emailDono,
      nomeDono,
      redirectTo: `${window.location.origin}/redefinir-senha`,
    },
  })

  if (error) {
    let msg = 'Não foi possível criar a empresa.'
    try {
      const corpo = await error.context?.json?.()
      if (corpo?.error) msg = corpo.error
    } catch { /* mantém msg genérica */ }
    return { error: msg }
  }
  if (data?.error) return { error: data.error }
  return { data }
}
