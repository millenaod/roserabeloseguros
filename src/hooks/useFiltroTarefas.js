import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

// Filtros rápidos da tela Tarefas do dia. A chave vai para a URL (?filtro=).
export const FILTROS_TAREFAS = [
  { value: '',              label: 'Todas',              testa: () => true },
  { value: 'risco',         label: 'Cobertura em risco', testa: p => !!p.cobertura_em_risco },
  { value: 'sem_contato',   label: 'Nunca contatadas',   testa: p => !p.total_contatos },
  { value: 'nao_entregue',  label: 'Não entregue',       testa: p => p.ultimo_status_envio === 'falhou' },
]

// Minúsculas e sem acento: "joão" encontra "JOAO".
function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

// Busca por nome/seguradora (texto) ou por CPF/telefone (só dígitos).
export function filtrarTarefas(parcelas, { busca = '', filtro = '' } = {}) {
  const regra = FILTROS_TAREFAS.find(f => f.value === filtro) ?? FILTROS_TAREFAS[0]
  const termo = normalizar(busca.trim())
  const digitos = busca.replace(/\D/g, '')

  return parcelas.filter(p => {
    if (!regra.testa(p)) return false
    if (!termo) return true
    if (normalizar(p.cliente_nome).includes(termo)) return true
    if (normalizar(p.seguradora_nome).includes(termo)) return true
    if (digitos.length >= 3) {
      if (String(p.cliente_cpf ?? '').replace(/\D/g, '').includes(digitos)) return true
      if (String(p.cliente_telefone ?? '').replace(/\D/g, '').includes(digitos)) return true
    }
    return false
  })
}

// Busca e filtro ficam na URL para sobreviver ao "abrir detalhe → voltar".
export function useFiltroTarefas(parcelas) {
  const [params, setParams] = useSearchParams()
  const busca = params.get('q') ?? ''
  const filtro = params.get('filtro') ?? ''

  function atualizar(chave, valor) {
    setParams(atual => {
      const novo = new URLSearchParams(atual)
      if (valor) novo.set(chave, valor)
      else novo.delete(chave)
      return novo
    }, { replace: true })
  }

  const filtradas = useMemo(() => filtrarTarefas(parcelas, { busca, filtro }), [parcelas, busca, filtro])

  const contagens = useMemo(
    () => Object.fromEntries(FILTROS_TAREFAS.map(f => [f.value, parcelas.filter(f.testa).length])),
    [parcelas],
  )

  return {
    busca,
    setBusca: v => atualizar('q', v),
    filtro,
    setFiltro: v => atualizar('filtro', v),
    limpar: () => setParams({}, { replace: true }),
    temFiltro: !!(busca || filtro),
    filtradas,
    contagens,
  }
}
