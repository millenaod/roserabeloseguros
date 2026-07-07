import { useState } from 'react'
import { useNovaParcela } from '@/hooks/useNovaParcela'
import { useToast } from '@/hooks/use-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { parcelasDeHoje } from '@/services/parcelas'
import { Toaster } from '@/components/ui/toaster'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatarMoeda, formatarData } from '@/utils/format'
import { mascararTelefone, mascararMoeda, mascararCpfCnpj } from '@/utils/mascaras'
import { TIPOS_PAGAMENTO } from '@/utils/pagamento'
import { Paperclip, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'

function LinhaRevisao({ label, valor }) {
  if (!valor) return null
  return (
    <div className="flex justify-between items-start gap-4 py-1.5 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--text-secondary)] shrink-0">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)] text-right">{valor}</span>
    </div>
  )
}

function CampoErro({ mensagem }) {
  if (!mensagem) return null
  return <p data-erro="true" className="text-xs text-[var(--status-error)] mt-1">{mensagem}</p>
}

// Mostra o telefone do banco (55 + DDD + número) como (DD) XXXXX-XXXX.
function exibirTelefone(valor) {
  const d = String(valor ?? '').replace(/\D/g, '')
  const semDdi = d.startsWith('55') && d.length > 11 ? d.slice(2) : d
  return semDdi ? mascararTelefone(semDdi) : '—'
}

export default function NovaParcela() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { form, erros, salvando, seguradoras, atualizar, validar, salvar } = useNovaParcela()
  const [conflito, setConflito] = useState(null)
  const [revisao, setRevisao]   = useState(false)

  const { data: historico = [] } = useQuery({
    queryKey: ['parcelas-hoje'],
    queryFn: () => parcelasDeHoje().then(r => r.data),
  })

  function abrirRevisao() {
    const e = validar()
    if (Object.keys(e).length > 0) {
      document.querySelector('[data-erro="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setRevisao(true)
  }

  async function handleSalvar(decisaoCliente) {
    const resultado = await salvar(decisaoCliente)
    if (resultado.sucesso) {
      setConflito(null)
      toast({ title: 'Parcela cadastrada!', description: 'A parcela foi salva com sucesso.' })
      queryClient.invalidateQueries({ queryKey: ['parcelas-hoje'] })
      queryClient.invalidateQueries({ queryKey: ['parcelas'] })
    } else if (resultado.motivo === 'conflito') {
      // Mesmo CPF com nome/telefone diferentes: abre o aviso pra operadora decidir.
      setConflito(resultado.conflito)
    } else if (resultado.motivo === 'validacao') {
      // Não é erro de sistema: faltam campos. Nomeia quais e rola até o primeiro destacado.
      toast({
        title: 'Faltam preencher',
        description: `Confira: ${resultado.campos.join(', ')}.`,
        variant: 'destructive',
      })
      document.querySelector('[data-erro="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      toast({
        title: 'Não foi possível salvar',
        description: resultado.erro?.message || 'Falha de conexão. Tente de novo em instantes.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      <Toaster />

      {/* Cabeçalho */}
      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="font-display font-semibold text-2xl text-[var(--text-primary)]">Nova Parcela</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Cadastre uma parcela vencida para cobrança</p>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">

        {/* Formulário — 2/3 da tela no desktop */}
        <div className="lg:col-span-2 flex flex-col gap-5 h-fit bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 md:p-6">

          {/* Cliente */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Cliente
            </Label>
            <Input
              placeholder="Nome completo"
              value={form.clienteNome}
              onChange={e => atualizar('clienteNome', e.target.value)}
              autoFocus
            />
            <CampoErro mensagem={erros.clienteNome} />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] pointer-events-none">+55</span>
              <Input
                className="pl-12"
                inputMode="numeric"
                placeholder="(31) 99999-9999"
                value={form.clienteWhatsapp}
                onChange={e => atualizar('clienteWhatsapp', mascararTelefone(e.target.value))}
              />
            </div>
            <CampoErro mensagem={erros.clienteWhatsapp} />
          </div>

          {/* Seguradora */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Seguradora</Label>
            <Select value={form.seguradora_id} onValueChange={v => atualizar('seguradora_id', v)}>
              <SelectTrigger className={!form.seguradora_id ? 'text-[var(--text-muted)]' : ''}>
                <SelectValue placeholder="Selecione a seguradora" />
              </SelectTrigger>
              <SelectContent>
                {seguradoras.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CampoErro mensagem={erros.seguradora_id} />
          </div>

          {/* CPF + Parcela */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">CPF / CNPJ do cliente</Label>
              <Input inputMode="numeric" placeholder="CPF ou CNPJ" value={form.cpf} onChange={e => atualizar('cpf', mascararCpfCnpj(e.target.value))} />
              <CampoErro mensagem={erros.cpf} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Nº Parcela</Label>
              <Input type="number" min="1" placeholder="Ex: 3" value={form.numero_parcela} onChange={e => atualizar('numero_parcela', e.target.value)} />
              <CampoErro mensagem={erros.numero_parcela} />
            </div>
          </div>

          {/* Valor + Vencimento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Valor (R$)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] pointer-events-none">R$</span>
                <Input className="pl-9" inputMode="numeric" placeholder="0,00" value={form.valor} onChange={e => atualizar('valor', mascararMoeda(e.target.value))} />
              </div>
              <CampoErro mensagem={erros.valor} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Vencimento</Label>
              <Input type="date" value={form.data_vencimento} onChange={e => atualizar('data_vencimento', e.target.value)} />
              <CampoErro mensagem={erros.data_vencimento} />
            </div>
          </div>

          {/* Tipo de pagamento */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Tipo de pagamento</Label>
            <Select value={form.tipo_pagamento} onValueChange={v => atualizar('tipo_pagamento', v)}>
              <SelectTrigger className={!form.tipo_pagamento ? 'text-[var(--text-muted)]' : ''}>
                <SelectValue placeholder="Selecione o tipo de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_PAGAMENTO.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CampoErro mensagem={erros.tipo_pagamento} />
          </div>

          {/* Anexo do boleto */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Boleto (PDF ou imagem)</Label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-raised)] cursor-pointer hover:border-[var(--brand)] transition-colors">
              <Paperclip className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              <span className="text-sm text-[var(--text-secondary)] truncate">
                {form.boletoFile ? form.boletoFile.name : 'Selecionar arquivo do boleto…'}
              </span>
              <input
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={e => atualizar('boletoFile', e.target.files?.[0] ?? null)}
              />
            </label>
            <CampoErro mensagem={erros.boletoFile} />
          </div>

          {/* Observação */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              Observação <span className="normal-case font-normal">(opcional)</span>
            </Label>
            <Textarea
              placeholder="Informações adicionais sobre esta parcela…"
              rows={3}
              value={form.observacao}
              onChange={e => atualizar('observacao', e.target.value)}
            />
          </div>

          {/* Botão desktop */}
          <Button
            className="hidden md:flex w-full mt-2"
            style={{ backgroundColor: 'var(--brand)', color: 'white' }}
            onClick={abrirRevisao}
            disabled={salvando}
          >
            {salvando ? 'Salvando…' : 'Salvar Parcela'}
          </Button>
        </div>

        {/* Histórico — parcelas cadastradas hoje */}
        <div className="hidden lg:block">
          <Card className="border-[var(--border)] sticky top-6">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                <h2 className="font-semibold text-sm text-[var(--text-primary)]">Cadastradas hoje</h2>
                {historico.length > 0 && (
                  <span className="ml-auto text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface-raised)] rounded-full px-2 py-0.5">
                    {historico.length}
                  </span>
                )}
              </div>
              <Separator />
              {historico.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] py-6 text-center leading-relaxed">
                  As parcelas que você cadastrar hoje<br />vão aparecendo aqui.
                </p>
              ) : (
                <ul className="flex flex-col gap-2 max-h-[60vh] overflow-auto -mr-2 pr-2">
                  {historico.map(h => (
                    <li key={h.parcela_id} className="flex items-start gap-2 text-sm border-b border-[var(--border)] pb-2 last:border-0">
                      <CheckCircle2 className="w-4 h-4 text-[var(--status-paid)] shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[var(--text-primary)] truncate">{h.cliente_nome}</p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">
                          {h.seguradora_nome} · Parcela {h.numero_parcela}
                        </p>
                      </div>
                      <span className="font-medium text-[var(--text-primary)] shrink-0">{formatarMoeda(h.valor)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botão mobile fixo no rodapé */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-[var(--surface)] border-t border-[var(--border)]">
        <Button
          className="w-full"
          style={{ backgroundColor: 'var(--brand)', color: 'white' }}
          onClick={abrirRevisao}
          disabled={salvando}
        >
          {salvando ? 'Salvando…' : 'Salvar Parcela'}
        </Button>
      </div>

      {/* Revisão antes de salvar */}
      <Dialog open={revisao} onOpenChange={v => { if (!v) setRevisao(false) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Revise antes de enviar</DialogTitle>
            <DialogDescription>Confirme os dados abaixo antes de cadastrar a parcela.</DialogDescription>
          </DialogHeader>
          <div className="py-1">
            <LinhaRevisao label="Cliente"    valor={form.clienteNome} />
            <LinhaRevisao label="WhatsApp"   valor={form.clienteWhatsapp} />
            <LinhaRevisao label="CPF"        valor={form.cpf} />
            <LinhaRevisao label="Seguradora" valor={seguradoras.find(s => String(s.id) === form.seguradora_id)?.nome} />
            <LinhaRevisao label="Parcela"    valor={form.numero_parcela ? `Nº ${form.numero_parcela}` : null} />
            <LinhaRevisao label="Valor"      valor={form.valor ? `R$ ${form.valor}` : null} />
            <LinhaRevisao label="Vencimento" valor={formatarData(form.data_vencimento)} />
            <LinhaRevisao label="Pagamento"  valor={TIPOS_PAGAMENTO.find(t => t.value === form.tipo_pagamento)?.label} />
            <LinhaRevisao label="Boleto"     valor={form.boletoFile?.name} />
            <LinhaRevisao label="Observação" valor={form.observacao || null} />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setRevisao(false)}>Voltar e editar</Button>
            <Button onClick={() => { setRevisao(false); handleSalvar() }} disabled={salvando}
              style={{ backgroundColor: 'var(--brand)', color: 'white' }}>
              {salvando ? 'Salvando…' : 'Confirmar e salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={() => handleSalvar('atualizar')}>
              {salvando ? 'Salvando…' : 'Atualizar com os dados novos'}
            </Button>
            <Button variant="outline" className="w-full" disabled={salvando}
              onClick={() => handleSalvar('usar_existente')}>
              Usar o cadastro existente
            </Button>
            <Button variant="ghost" className="w-full" disabled={salvando}
              onClick={() => setConflito(null)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
