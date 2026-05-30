import { supabase } from '@/lib/supabase'

export async function listarSeguradoras() {
  const { data, error } = await supabase
    .from('seguradoras')
    .select('id, nome')
    .order('nome')

  if (error) console.error('listarSeguradoras:', error)
  return { data, error }
}
