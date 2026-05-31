import { useState, useRef, useEffect } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, X } from 'lucide-react'

const vazio = {
  cliente_nome: '', cpf_cnpj: '', telefone: '',
  seguradora_id: '', numero_apolice: '', numero_parcela: '',
  valor: '', data_vencimento: '',
}

export default function NovaParcelaInline({ seguradoras, onSalvar, onCancelar }) {
  const [form, setForm] = useState(vazio)
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const primeiroInputRef = useRef(null)

  useEffect(() => { primeiroInputRef.current?.focus() }, [])

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
    if (erros[campo]) setErros(e => ({ ...e, [campo]: null }))
  }

  function validar() {
    const e = {}
    if (!form.cliente_nome.trim())  e.cliente_nome  = true
    if (!form.cpf_cnpj.trim())      e.cpf_cnpj      = true
    if (!form.telefone.trim())      e.telefone      = true
    if (!form.seguradora_id)        e.seguradora_id = true
    if (!form.numero_apolice.trim())e.numero_apolice= true
    if (!form.numero_parcela)       e.numero_parcela= true
    if (!form.valor)                e.valor         = true
    if (!form.data_vencimento)      e.data_vencimento= true
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleSalvar() {
    if (!validar()) return
    setSalvando(true)
    await onSalvar({
      cliente_nome:    form.cliente_nome.trim(),
      cpf_cnpj:        form.cpf_cnpj.trim(),
      telefone:        form.telefone.trim(),
      seguradora_id:   form.seguradora_id,
      numero_apolice:  form.numero_apolice.trim(),
      numero_parcela:  Number(form.numero_parcela),
      valor:           Number(form.valor),
      data_vencimento: form.data_vencimento,
    })
    setSalvando(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onCancelar()
  }

  function inputClass(campo) {
    return `h-8 text-xs ${erros[campo] ? 'border-red-400 focus-visible:ring-red-300' : ''}`
  }

  return (
    <TableRow className="bg-[var(--brand-light)]" onKeyDown={handleKeyDown}>
      <TableCell className="p-1.5">
        <Input ref={primeiroInputRef} placeholder="Nome*" value={form.cliente_nome}
          onChange={e => set('cliente_nome', e.target.value)} className={inputClass('cliente_nome')} />
      </TableCell>
      <TableCell className="p-1.5">
        <Input placeholder="Seguradora*" className="hidden" />
        <Select value={form.seguradora_id} onValueChange={v => set('seguradora_id', v)}>
          <SelectTrigger className={`h-8 text-xs ${erros.seguradora_id ? 'border-red-400' : ''}`}>
            <SelectValue placeholder="Seguradora*" />
          </SelectTrigger>
          <SelectContent>
            {seguradoras.map(s => (
              <SelectItem key={s.id} value={String(s.id)} className="text-xs">{s.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="p-1.5">
        <Input placeholder="Apólice*" value={form.numero_apolice}
          onChange={e => set('numero_apolice', e.target.value)} className={inputClass('numero_apolice')} />
      </TableCell>
      <TableCell className="p-1.5">
        <Input type="number" min="1" placeholder="Nº*" value={form.numero_parcela}
          onChange={e => set('numero_parcela', e.target.value)} className={inputClass('numero_parcela')} />
      </TableCell>
      <TableCell className="p-1.5">
        <Input type="number" min="0" step="0.01" placeholder="R$*" value={form.valor}
          onChange={e => set('valor', e.target.value)} className={inputClass('valor')} />
      </TableCell>
      <TableCell className="p-1.5">
        <Input type="date" value={form.data_vencimento}
          onChange={e => set('data_vencimento', e.target.value)} className={inputClass('data_vencimento')} />
      </TableCell>
      <TableCell className="p-1.5" colSpan={2}>
        <div className="flex items-center gap-1">
          <Button size="sm" className="h-8 px-2 text-xs gap-1" disabled={salvando}
            style={{ backgroundColor: 'var(--brand)', color: 'white' }} onClick={handleSalvar}>
            <Check className="w-3.5 h-3.5" /> {salvando ? 'Salvando…' : 'Salvar'}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={onCancelar}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
