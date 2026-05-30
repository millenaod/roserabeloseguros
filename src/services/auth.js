import { supabase } from '@/lib/supabase'

export async function login(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) console.error('login:', error)
  return { data, error }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('logout:', error)
  return { error }
}

export async function buscarPerfil(userId) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, perfil')
    .eq('id', userId)
    .single()

  if (error) console.error('buscarPerfil:', error)
  return { data, error }
}
