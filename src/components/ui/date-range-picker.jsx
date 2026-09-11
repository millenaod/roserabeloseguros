import { useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { mascararData, dataParaISO, isoParaData } from '@/utils/mascaras'
import 'react-day-picker/style.css'

const MESES = [
  { label: 'Mês anterior', offset: -1 },
  { label: 'Mês atual',    offset:  0 },
  { label: 'Próximo mês',  offset:  1 },
]

// value: { de: 'YYYY-MM-DD' | '', ate: 'YYYY-MM-DD' | '' }
// onChange: ({ de, ate }) => void
export function DateRangePicker({ value = { de: '', ate: '' }, onChange, className }) {
  const [open, setOpen] = useState(false)
  const [deText,  setDeText]  = useState(() => value.de  ? isoParaData(value.de)  : '')
  const [ateText, setAteText] = useState(() => value.ate ? isoParaData(value.ate) : '')

  useEffect(() => {
    setDeText(value.de  ? isoParaData(value.de)  : '')
    setAteText(value.ate ? isoParaData(value.ate) : '')
  }, [value.de, value.ate])

  const range = {
    from: value.de  ? new Date(value.de  + 'T00:00:00') : undefined,
    to:   value.ate ? new Date(value.ate + 'T00:00:00') : undefined,
  }

  function handleCalendarSelect(r) {
    const de  = r?.from ? format(r.from, 'yyyy-MM-dd') : ''
    const ate = r?.to   ? format(r.to,   'yyyy-MM-dd') : ''
    onChange({ de, ate })
  }

  function handleDeChange(masked) {
    setDeText(masked)
    if (masked.length === 10) {
      const iso = dataParaISO(masked)
      if (iso) onChange({ ...value, de: iso })
    } else if (masked === '') {
      onChange({ ...value, de: '' })
    }
  }

  function handleAteChange(masked) {
    setAteText(masked)
    if (masked.length === 10) {
      const iso = dataParaISO(masked)
      if (iso) onChange({ ...value, ate: iso })
    } else if (masked === '') {
      onChange({ ...value, ate: '' })
    }
  }

  function selecionarMes(offset) {
    const base = addMonths(new Date(), offset)
    onChange({
      de:  format(startOfMonth(base), 'yyyy-MM-dd'),
      ate: format(endOfMonth(base),   'yyyy-MM-dd'),
    })
    setOpen(false)
  }

  function limpar() {
    onChange({ de: '', ate: '' })
  }

  const temFiltro = value.de || value.ate

  function labelTrigger() {
    if (!temFiltro) return 'Período'
    if (value.de && value.ate) return `${isoParaData(value.de)} – ${isoParaData(value.ate)}`
    if (value.de)  return `A partir de ${isoParaData(value.de)}`
    return `Até ${isoParaData(value.ate)}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`justify-start font-normal min-w-[190px] ${!temFiltro ? 'text-[var(--text-secondary)]' : ''} ${className ?? ''}`}
        >
          <CalendarDays className="w-4 h-4 mr-2 shrink-0" />
          <span className="truncate">{labelTrigger()}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-0 bg-[var(--surface)] border-[var(--border)] shadow-lg"
      >
        {/* Atalhos de mês */}
        <div className="flex gap-1 p-3 pb-2 border-b border-[var(--border)]">
          {MESES.map(({ label, offset }) => (
            <button
              key={offset}
              onClick={() => selecionarMes(offset)}
              className="flex-1 text-xs py-1.5 px-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Inputs De / Até */}
        <div className="flex items-end gap-2 px-3 pt-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">De</span>
            <input
              className="w-[118px] text-sm border border-[var(--border)] rounded-md px-2.5 py-1.5 bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
              placeholder="DD/MM/AAAA"
              inputMode="numeric"
              value={deText}
              onChange={e => handleDeChange(mascararData(e.target.value))}
            />
          </div>
          <span className="pb-2 text-[var(--text-muted)] text-sm">–</span>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Até</span>
            <input
              className="w-[118px] text-sm border border-[var(--border)] rounded-md px-2.5 py-1.5 bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
              placeholder="DD/MM/AAAA"
              inputMode="numeric"
              value={ateText}
              onChange={e => handleAteChange(mascararData(e.target.value))}
            />
          </div>
        </div>

        {/* Calendário */}
        <div style={{ '--rdp-accent-color': 'var(--brand)', '--rdp-background-color': 'color-mix(in oklch, var(--brand) 15%, transparent)' }}>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleCalendarSelect}
            locale={ptBR}
            className="p-3 pt-2 text-[var(--text-primary)]"
          />
        </div>

        {/* Limpar */}
        {temFiltro && (
          <div className="px-3 pb-3 pt-1 border-t border-[var(--border)]">
            <button
              onClick={limpar}
              className="w-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1 rounded"
            >
              Limpar período
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
