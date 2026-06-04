import { useNovaParcela } from '@/hooks/useNovaParcela'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatarMoeda, formatarData } from '@/utils/format'

function CampoErro({ mensagem }) {
  if (!mensagem) return null
  return <p className="text-xs text-[var(--status-error)] mt-1">{mensagem}</p>
}

export default function NovaParcela() {
  const { toast } = useToast()

  const { form, erros, salvando, seguradoras, atualizar, salvar } = useNovaParcela()

  async function handleSalvar() {
    const resultado = await salvar()
    if (resultado.sucesso) {
      toast({ title: 'Parcela cadastrada!', description: 'A parcela foi salva com sucesso.' })
    } else {
      toast({ title: 'Erro ao salvar', description: 'Verifique os campos e tente novamente.', variant: 'destructive' })
    }
  }

  const valorNumerico = parseFloat(form.valor) || 0

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
            <Input
              placeholder="WhatsApp com DDD"
              value={form.clienteWhatsapp}
              onChange={e => atualizar('clienteWhatsapp', e.target.value)}
            />
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

          {/* Apólice + Parcela */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Nº Apólice</Label>
              <Input placeholder="Ex: 123456" value={form.numero_apolice} onChange={e => atualizar('numero_apolice', e.target.value)} />
              <CampoErro mensagem={erros.numero_apolice} />
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
              <Input type="number" min="0" step="0.01" placeholder="0,00" value={form.valor} onChange={e => atualizar('valor', e.target.value)} />
              <CampoErro mensagem={erros.valor} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Vencimento</Label>
              <Input type="date" value={form.data_vencimento} onChange={e => atualizar('data_vencimento', e.target.value)} />
              <CampoErro mensagem={erros.data_vencimento} />
            </div>
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
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? 'Salvando…' : 'Salvar Parcela'}
          </Button>
        </div>

        {/* Resumo — 1/3 da tela no desktop */}
        <div className="hidden lg:block">
          <Card className="border-[var(--border)] sticky top-6">
            <CardContent className="p-5 flex flex-col gap-3">
              <h2 className="font-semibold text-sm text-[var(--text-primary)]">Resumo</h2>
              <Separator />
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--text-secondary)]">Cliente</dt>
                  <dd className="font-medium text-right text-[var(--text-primary)] max-w-[60%] truncate">
                    {form.clienteNome || '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--text-secondary)]">Seguradora</dt>
                  <dd className="font-medium text-[var(--text-primary)]">
                    {seguradoras.find(s => String(s.id) === form.seguradora_id)?.nome || '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--text-secondary)]">Apólice</dt>
                  <dd className="font-medium text-[var(--text-primary)]">{form.numero_apolice || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--text-secondary)]">Parcela</dt>
                  <dd className="font-medium text-[var(--text-primary)]">{form.numero_parcela ? `Nº ${form.numero_parcela}` : '—'}</dd>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <dt className="text-[var(--text-secondary)]">Valor</dt>
                  <dd className="font-display font-bold text-base text-[var(--text-primary)]">
                    {valorNumerico > 0 ? formatarMoeda(valorNumerico) : '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--text-secondary)]">Vencimento</dt>
                  <dd className="font-medium text-[var(--text-primary)]">
                    {form.data_vencimento ? formatarData(form.data_vencimento) : '—'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botão mobile fixo no rodapé */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-[var(--surface)] border-t border-[var(--border)]">
        <Button
          className="w-full"
          style={{ backgroundColor: 'var(--brand)', color: 'white' }}
          onClick={handleSalvar}
          disabled={salvando}
        >
          {salvando ? 'Salvando…' : 'Salvar Parcela'}
        </Button>
      </div>
    </div>
  )
}
