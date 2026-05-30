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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!ativo) return
      if (session?.user) {
        setUsuario(session.user)
        setCarregando(false)
        const { data } = await buscarPerfil(session.user.id)
        if (ativo) setPerfil(data)
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
