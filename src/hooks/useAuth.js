import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { buscarPerfil, logout } from '@/services/auth'

export function useAuth() {
  const [usuario, setUsuario]   = useState(undefined) // undefined = carregando
  const [perfil, setPerfil]     = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUsuario(session.user)
        const { data } = await buscarPerfil(session.user.id)
        setPerfil(data)
      } else {
        setUsuario(null)
      }
      setCarregando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUsuario(session.user)
        const { data } = await buscarPerfil(session.user.id)
        setPerfil(data)
      } else {
        setUsuario(null)
        setPerfil(null)
      }
      setCarregando(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function sair() {
    await logout()
    setUsuario(null)
    setPerfil(null)
  }

  return { usuario, perfil, carregando, sair }
}
