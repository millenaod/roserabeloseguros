import { supabase } from '@/lib/supabase'

export async function login(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) console.error('login:', error)
  return { data, error }
}

// Signup self-service (nova corretora). O metadata nome_empresa/nome_usuario é lido
// pelo trigger handle_new_user, que cria a organização + o usuário dono (perfil 'rose').
export async function criarConta({ email, senha, nomeEmpresa, nomeUsuario }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome_empresa: nomeEmpresa, nome_usuario: nomeUsuario } },
  })
  if (error) console.error('criarConta:', error)
  return { data, error }
}

export async function resetarSenha(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  })
  if (error) console.error('resetarSenha:', error)
  return { data, error }
}

export async function atualizarSenha(novaSenha) {
  const { data, error } = await supabase.auth.updateUser({ password: novaSenha })
  if (error) console.error('atualizarSenha:', error)
  return { data, error }
}

// Troca de senha do usuário logado: confirma a senha atual antes de salvar a nova.
export async function trocarSenha(senhaAtual, novaSenha) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: { message: 'Sua sessão expirou. Entre novamente.' } }

  // valida a senha atual reautenticando
  const { error: erroLogin } = await supabase.auth.signInWithPassword({ email: user.email, password: senhaAtual })
  if (erroLogin) return { error: { message: 'A senha atual está incorreta.' } }

  const { error } = await supabase.auth.updateUser({ password: novaSenha })
  if (error) { console.error('trocarSenha:', error); return { error: { message: 'Não foi possível salvar a nova senha. Tente novamente.' } } }
  return { error: null }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('logout:', error)
  return { error }
}

export async function buscarPerfil(userId) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, perfil, org_id, organizacoes(nome)')
    .eq('id', userId)
    .single()

  if (error) console.error('buscarPerfil:', error)
  return { data, error }
}
