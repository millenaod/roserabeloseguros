import { supabase } from '@/lib/supabase'

// Operações do painel super-admin. A RPC admin_list_orgs (SECURITY DEFINER) checa
// is_super_admin() no banco — o gate do front é só UX, a autorização real é no banco.
export async function listarEmpresas() {
  const { data, error } = await supabase.rpc('admin_list_orgs')
  if (error) console.error('listarEmpresas:', error)
  return { data: data ?? [], error }
}
