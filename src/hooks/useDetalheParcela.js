import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buscarParcelaPorId, atualizarStatus } from '@/services/parcelas'
import { supabase } from '@/lib/supabase'

export function useDetalheParcela(id) {
  const queryClient = useQueryClient()

  const { data: parcela, isLoading } = useQuery({
    queryKey: ['parcela', id],
    queryFn: () => buscarParcelaPorId(id).then(r => r.data),
    enabled: !!id,
  })

  const { data: contatos = [], isLoading: carregandoContatos } = useQuery({
    queryKey: ['contatos', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('contatos')
        .select('*')
        .eq('parcela_id', id)
        .order('data_contato', { ascending: true })
      return data ?? []
    },
    enabled: !!id,
  })

  const { mutateAsync: executarAcao, isPending: executando } = useMutation({
    mutationFn: ({ status }) => atualizarStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcela', id] })
      queryClient.invalidateQueries({ queryKey: ['parcelas'] })
    },
  })

  async function remarcar(novaData) {
    const { error } = await supabase
      .from('parcelas')
      .update({ data_vencimento: novaData, status: 'remarcado' })
      .eq('id', id)
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['parcela', id] })
      queryClient.invalidateQueries({ queryKey: ['parcelas'] })
    }
    return { error }
  }

  async function enviarMensagem(texto) {
    const { error } = await supabase.from('contatos').insert({
      parcela_id: id,
      tipo: 'manual',
      canal: 'manual',
      mensagem_enviada: texto,
      enviado_em: new Date().toISOString(),
    })
    if (!error) queryClient.invalidateQueries({ queryKey: ['contatos', id] })
    return { error }
  }

  return {
    parcela, isLoading,
    contatos, carregandoContatos,
    executando,
    pagar: () => executarAcao({ status: 'pago' }),
    escalar: () => executarAcao({ status: 'escalado' }),
    remarcar,
    enviarMensagem,
  }
}
