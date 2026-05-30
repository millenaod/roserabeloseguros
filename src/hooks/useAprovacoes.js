import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarLotesPendentes, aprovarLote, bloquearLote } from '@/services/aprovacoes'

export function useAprovacoes() {
  const queryClient = useQueryClient()

  const { data: lotes = [], isLoading } = useQuery({
    queryKey: ['aprovacoes'],
    queryFn: () => listarLotesPendentes().then(r => r.data ?? []),
  })

  const { mutateAsync: executar, isPending: executando } = useMutation({
    mutationFn: ({ id, acao, motivo }) =>
      acao === 'aprovar' ? aprovarLote(id, motivo) : bloquearLote(id, motivo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aprovacoes'] }),
  })

  return {
    lotes, isLoading, executando,
    aprovar: (id, motivo) => executar({ id, acao: 'aprovar', motivo }),
    bloquear: (id, motivo) => executar({ id, acao: 'bloquear', motivo }),
  }
}
