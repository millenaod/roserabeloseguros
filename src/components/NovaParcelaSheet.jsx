import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mascararTelefone, mascararMoeda, telefoneCompleto, telefoneValido, moedaParaNumero, mascararCpfCnpj, cpfCnpjValido, dataParaISO } from '@/utils/mascaras'
import { TIPOS_PAGAMENTO } from '@/utils/pagamento'
import { DatePicker } from '@/components/ui/date-picker'
import { Paperclip, AlertTriangle } from 'lucide-react'

function LinhaRevisao({ label, valor }) {
  if (!valor) return null
  return (
    <div className="flex justify-between items-start gap-4 py-1.5 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--text-secondary)] shrink-0">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)] text-right break-all min-w-0">{valor}</span>
    </div>
  )
}

// Mostra o telefone do banco (55 + DDD + número) como (DD) XXXXX-XXXX.
function exibirTelefone(valor) {
  const d = String(valor ?? '').replace(/\D/g, '')
  const semDdi = d.startsWith('55') && d.length > 11 ? d.slice(2) : d
  return semDdi ? mascararTelefone(semDdi) : '—'
}

const vazio = {
  cliente_nome: '', telefone: '', cpf: '',
  seguradora_id: '', numero_parcela: '',
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
  const [conflito, setConflito] = useState(null)
  const [revisao, setRevisao]   = useState(false)

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
    if (erros[campo]) setErros(e => ({ ...e, [campo]: null }))
  }

  function validar() {
    const e = {}
    if (!form.cliente_nome.trim())   e.cliente_nome   = true
    if (!form.telefone.trim() || !telefoneValido(form.telefone)) e.telefone = true
    if (!form.cpf.trim() || !cpfCnpjValido(form.cpf)) e.cpf = true
    if (!form.seguradora_id)         e.seguradora_id  = true
    if (!form.numero_parcela)        e.numero_parcela = true
    if (!form.valor)                 e.valor          = true
    if (!form.data_vencimento)               e.data_vencimento= true
    if (!form.tipo_pagamento)        e.tipo_pagamento = true
    if (!form.boletoFile)            e.boletoFile     = true
    setErros(e)
    return Object.keys(e).length === 0
  }

  function montarPayload(decisaoCliente) {
    return {
      cliente_nome:    form.cliente_nome.trim(),
      telefone:        telefoneCompleto(form.telefone),
      cpf:             form.cpf.trim(),
      seguradora_id:   form.seguradora_id,
      numero_parcela:  Number(form.numero_parcela),
      valor:           moedaParaNumero(form.valor),
      data_vencimento: form.data_vencimento,
      tipo_pagamento:  form.tipo_pagamento,
      boletoFile:      form.boletoFile,
      decisaoCliente,
    }
  }

  // decisaoCliente: undefined na 1ª tentativa; 'usar_existente'/'atualizar' ao resolver o conflito.
  async function enviar(decisaoCliente) {
    setSalvando(true)
    const res = await onSalvar(montarPayload(decisaoCliente))
    setSalvando(false)

    // Mesmo CPF com nome/telefone diferentes: abre o aviso e mantém a Sheet aberta.
    if (res?.conflito) { setConflito(res.conflito); return }
    if (res?.error) return  // erro já avisado pelo pai; deixa a operadora corrigir

    setForm(vazio)
    setErros({})
    setConflito(null)
    setRevisao(false)
    onFechar()
  }

  function handleSalvar() {
    if (!validar()) return
    setRevisao(true)
  }

  return (
    <Sheet open={aberto} onOpenChange={v => { if (!v) { setForm(vazio); setErros({}); setRevisao(false); onFechar() } }}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display text-xl font-bold">
            {revisao ? 'Revise antes de enviar' : 'Nova Parcela'}
          </SheetTitle>
        </SheetHeader>

        {revisao ? (
          <div className="flex flex-col">
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Confirme os dados abaixo antes de cadastrar a parcela.
            </p>
            <div className="py-1">
              <LinhaRevisao label="Cliente"    valor={form.cliente_nome} />
              <LinhaRevisao label="WhatsApp"   valor={form.telefone} />
              <LinhaRevisao label="CPF/CNPJ"   valor={form.cpf} />
              <LinhaRevisao label="Seguradora" valor={seguradoras.find(s => String(s.id) === form.seguradora_id)?.nome} />
              <LinhaRevisao label="Parcela"    valor={form.numero_parcela ? `Nº ${form.numero_parcela}` : null} />
              <LinhaRevisao label="Valor"      valor={form.valor ? `R$ ${form.valor}` : null} />
              <LinhaRevisao label="Vencimento" valor={form.data_vencimento || '—'} />
              <LinhaRevisao label="Pagamento"  valor={TIPOS_PAGAMENTO.find(t => t.value === form.tipo_pagamento)?.label} />
              <LinhaRevisao label="Boleto"     valor={form.boletoFile?.name} />
            </div>
            <div className="sticky bottom-0 pt-4 pb-2 bg-[hsl(var(--background))] mt-4 flex flex-col gap-2">
              <Button variant="primary" className="w-full" disabled={salvando}
                onClick={() => enviar(undefined)}>
                {salvando ? 'Salvando…' : 'Confirmar e salvar'}
              </Button>
              <Button variant="ghost" className="w-full" disabled={salvando}
                onClick={() => setRevisao(false)}>
                Voltar e editar
              </Button>
            </div>
          </div>
        ) : (
        <>
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
            <Campo label="CPF / CNPJ" erro={erros.cpf}>
              <Input inputMode="numeric" placeholder="CPF ou CNPJ" value={form.cpf}
                onChange={e => set('cpf', mascararCpfCnpj(e.target.value))} />
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
              <DatePicker
                value={form.data_vencimento}
                onChange={v => set('data_vencimento', v)}
              />
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
        <div className="sticky bottom-0 pt-4 pb-2 bg-[hsl(var(--background))] mt-4">
          <Button variant="primary" className="w-full" disabled={salvando}
            onClick={handleSalvar}>
            {salvando ? 'Salvando…' : 'Salvar Parcela'}
          </Button>
        </div>
        </>
        )}
      </SheetContent>

      {/* Aviso de CPF já cadastrado com nome/telefone diferente */}
      <Dialog open={!!conflito} onOpenChange={v => { if (!v) setConflito(null) }}>
        <DialogContent className="bg-[var(--surface)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[var(--status-warning,#B45309)]" />
              CPF já cadastrado
            </DialogTitle>
            <DialogDescription>
              Esse CPF já existe no sistema com dados diferentes dos que você digitou.
              Confira se é a mesma pessoa antes de continuar.
            </DialogDescription>
          </DialogHeader>

          {conflito && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-[var(--border)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1">No sistema</p>
                <p className="font-medium">{conflito.existente.nome || '—'}</p>
                <p className="text-[var(--text-secondary)]">{exibirTelefone(conflito.existente.telefone)}</p>
              </div>
              <div className="rounded-md border border-[var(--brand)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1">Você digitou</p>
                <p className="font-medium">{conflito.digitado.nome || '—'}</p>
                <p className="text-[var(--text-secondary)]">{exibirTelefone(conflito.digitado.telefone)}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button variant="primary" className="w-full" disabled={salvando}
              onClick={() => enviar('atualizar')}>
              {salvando ? 'Salvando…' : 'Atualizar com os dados novos'}
            </Button>
            <Button variant="outline" className="w-full" disabled={salvando}
              onClick={() => enviar('usar_existente')}>
              Usar o cadastro existente
            </Button>
            <Button variant="ghost" className="w-full" disabled={salvando}
              onClick={() => setConflito(null)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
