import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { buscarPerfil, logout } from '@/services/auth'

export function useAuth() {
  const [usuario, setUsuario]       = useState(undefined)
  const [perfil, setPerfil]         = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!ativo) return

        if (session?.user) {
          setUsuario(session.user)
          setCarregando(false) // libera a tela imediatamente
          const { data } = await buscarPerfil(session.user.id)
          if (ativo) setPerfil(data)
        } else {
          setUsuario(null)
          setCarregando(false)
        }
      })
      .catch(() => {
        if (ativo) { setUsuario(null); setCarregando(false) }
      })

    // IMPORTANTE: o callback do onAuthStateChange roda segurando um lock interno
    // da auth do Supabase. Chamar (com await) outra função do Supabase aqui dentro
    // — como buscarPerfil — causa DEADLOCK: o lock nunca solta e toda query seguinte
    // trava pra sempre ("para de carregar" depois de ~1h, quando o token renova).
    // Por isso o callback NÃO é async e a busca do perfil é adiada com setTimeout(0),
    // saindo de dentro do lock. (Recomendação oficial da doc do Supabase.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!ativo) return
      if (session?.user) {
        setUsuario(session.user)
        setCarregando(false)
        setTimeout(async () => {
          const { data } = await buscarPerfil(session.user.id)
          if (ativo) setPerfil(data)
        }, 0)
      } else {
        setUsuario(null)
        setPerfil(null)
        setCarregando(false)
      }
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  async function sair() {
    await logout()
    setUsuario(null)
    setPerfil(null)
  }

  return { usuario, perfil, carregando, sair }
}
