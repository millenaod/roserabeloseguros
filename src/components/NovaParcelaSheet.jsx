import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mascararTelefone, mascararMoeda, telefoneCompleto, telefoneValido, moedaParaNumero } from '@/utils/mascaras'
import { TIPOS_PAGAMENTO } from '@/utils/pagamento'
import { Paperclip } from 'lucide-react'

const vazio = {
  cliente_nome: '', telefone: '',
  seguradora_id: '', numero_apolice: '', numero_parcela: '',
  valor: '', data_vencimento: '',
  tipo_pagamento: '', boletoFile: null,
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
    if (!form.telefone.trim() || !telefoneValido(form.telefone)) e.telefone = true
    if (!form.seguradora_id)         e.seguradora_id  = true
    if (!form.numero_apolice.trim()) e.numero_apolice = true
    if (!form.numero_parcela)        e.numero_parcela = true
    if (!form.valor)                 e.valor          = true
    if (!form.data_vencimento)       e.data_vencimento= true
    if (!form.tipo_pagamento)        e.tipo_pagamento = true
    if (!form.boletoFile)            e.boletoFile     = true
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleSalvar() {
    if (!validar()) return
    setSalvando(true)
    await onSalvar({
      cliente_nome:    form.cliente_nome.trim(),
      telefone:        telefoneCompleto(form.telefone),
      seguradora_id:   form.seguradora_id,
      numero_apolice:  form.numero_apolice.trim(),
      numero_parcela:  Number(form.numero_parcela),
      valor:           moedaParaNumero(form.valor),
      data_vencimento: form.data_vencimento,
      tipo_pagamento:  form.tipo_pagamento,
      boletoFile:      form.boletoFile,
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
          <SheetTitle className="font-display text-xl font-bold">Nova Parcela</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-3">
          <Campo label="Nome do cliente" erro={erros.cliente_nome}>
            <Input placeholder="Nome completo" value={form.cliente_nome}
              onChange={e => set('cliente_nome', e.target.value)} autoFocus />
          </Campo>

          <Campo label="WhatsApp" erro={erros.telefone}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] pointer-events-none">+55</span>
              <Input className="pl-12" inputMode="numeric" placeholder="(31) 99999-9999" value={form.telefone}
                onChange={e => set('telefone', mascararTelefone(e.target.value))} />
            </div>
          </Campo>

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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] pointer-events-none">R$</span>
                <Input className="pl-9" inputMode="numeric" placeholder="0,00" value={form.valor}
                  onChange={e => set('valor', mascararMoeda(e.target.value))} />
              </div>
            </Campo>
            <Campo label="Vencimento" erro={erros.data_vencimento}>
              <Input type="date" value={form.data_vencimento}
                onChange={e => set('data_vencimento', e.target.value)} />
            </Campo>
          </div>

          <Campo label="Tipo de pagamento" erro={erros.tipo_pagamento}>
            <Select value={form.tipo_pagamento} onValueChange={v => set('tipo_pagamento', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {TIPOS_PAGAMENTO.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo label="Boleto (PDF ou imagem)" erro={erros.boletoFile}>
            <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-raised)] cursor-pointer hover:border-[var(--brand)] transition-colors">
              <Paperclip className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              <span className="text-sm text-[var(--text-secondary)] truncate">
                {form.boletoFile ? form.boletoFile.name : 'Selecionar arquivo…'}
              </span>
              <input type="file" accept="application/pdf,image/*" className="hidden"
                onChange={e => set('boletoFile', e.target.files?.[0] ?? null)} />
            </label>
          </Campo>
        </div>

        {/* Botão fixo no rodapé */}
        <div className="sticky bottom-0 pt-4 pb-2 bg-[var(--surface)] mt-4">
          <Button variant="primary" className="w-full" disabled={salvando}
            onClick={handleSalvar}>
            {salvando ? 'Salvando…' : 'Salvar Parcela'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
