import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const vazio = {
  cliente_nome: '', cpf_cnpj: '', telefone: '',
  seguradora_id: '', numero_apolice: '', numero_parcela: '',
  valor: '', data_vencimento: '',
}

function Campo({ label, erro, children }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </Label>
      {children}
      {erro && <p className="text-xs text-[var(--status-error)]">Campo obrigatório</p>}
    </div>
  )
}

export default function NovaParcelaSheet({ aberto, onFechar, seguradoras, onSalvar }) {
  const [form, setForm] = useState(vazio)
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
    if (erros[campo]) setErros(e => ({ ...e, [campo]: null }))
  }

  function validar() {
    const e = {}
    if (!form.cliente_nome.trim())   e.cliente_nome   = true
    if (!form.cpf_cnpj.trim())       e.cpf_cnpj       = true
    if (!form.telefone.trim())       e.telefone       = true
    if (!form.seguradora_id)         e.seguradora_id  = true
    if (!form.numero_apolice.trim()) e.numero_apolice = true
    if (!form.numero_parcela)        e.numero_parcela = true
    if (!form.valor)                 e.valor          = true
    if (!form.data_vencimento)       e.data_vencimento= true
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
    setForm(vazio)
    setErros({})
    onFechar()
  }

  return (
    <Sheet open={aberto} onOpenChange={v => { if (!v) { setForm(vazio); setErros({}); onFechar() } }}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display text-lg">Nova Parcela</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-3">
          <Campo label="Nome do cliente" erro={erros.cliente_nome}>
            <Input placeholder="Nome completo" value={form.cliente_nome}
              onChange={e => set('cliente_nome', e.target.value)} autoFocus />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="CPF / CNPJ" erro={erros.cpf_cnpj}>
              <Input placeholder="000.000.000-00" value={form.cpf_cnpj}
                onChange={e => set('cpf_cnpj', e.target.value)} />
            </Campo>
            <Campo label="WhatsApp" erro={erros.telefone}>
              <Input placeholder="(31) 99999-9999" value={form.telefone}
                onChange={e => set('telefone', e.target.value)} />
            </Campo>
          </div>

          <Campo label="Seguradora" erro={erros.seguradora_id}>
            <Select value={form.seguradora_id} onValueChange={v => set('seguradora_id', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {seguradoras.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Nº Apólice" erro={erros.numero_apolice}>
              <Input placeholder="Ex: HDI-001" value={form.numero_apolice}
                onChange={e => set('numero_apolice', e.target.value)} />
            </Campo>
            <Campo label="Nº Parcela" erro={erros.numero_parcela}>
              <Input type="number" min="1" placeholder="1" value={form.numero_parcela}
                onChange={e => set('numero_parcela', e.target.value)} />
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Valor (R$)" erro={erros.valor}>
              <Input type="number" min="0" step="0.01" placeholder="0,00" value={form.valor}
                onChange={e => set('valor', e.target.value)} />
            </Campo>
            <Campo label="Vencimento" erro={erros.data_vencimento}>
              <Input type="date" value={form.data_vencimento}
                onChange={e => set('data_vencimento', e.target.value)} />
            </Campo>
          </div>
        </div>

        {/* Botão fixo no rodapé */}
        <div className="sticky bottom-0 pt-4 pb-2 bg-white mt-4">
          <Button className="w-full" disabled={salvando}
            style={{ backgroundColor: 'var(--brand)', color: 'white' }}
            onClick={handleSalvar}>
            {salvando ? 'Salvando…' : 'Salvar Parcela'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
