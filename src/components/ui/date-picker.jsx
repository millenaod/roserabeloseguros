import { useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { mascararData, dataParaISO, isoParaData } from '@/utils/mascaras'
import 'react-day-picker/style.css'

// value: 'YYYY-MM-DD' | ''
// onChange: (iso: string) => void
export function DatePicker({ value = '', onChange, placeholder = 'DD/MM/AAAA', className }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(() => value ? isoParaData(value) : '')

  useEffect(() => {
    setText(value ? isoParaData(value) : '')
  }, [value])

  const selected = value ? new Date(value + 'T00:00:00') : undefined

  function handleCalendarSelect(date) {
    if (!date) return
    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  function handleTextChange(masked) {
    setText(masked)
    if (masked.length === 10) {
      const iso = dataParaISO(masked)
      if (iso) onChange(iso)
    } else if (masked === '') {
      onChange('')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={`w-full justify-start font-normal ${!value ? 'text-[var(--text-secondary)]' : ''} ${className ?? ''}`}
        >
          <CalendarDays className="w-4 h-4 mr-2 shrink-0" />
          <span>{value ? isoParaData(value) : placeholder}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-0 bg-[var(--surface)] border-[var(--border)] shadow-lg"
      >
        <div className="px-3 pt-3 pb-2 border-b border-[var(--border)]">
          <input
            className="w-full text-sm border border-[var(--border)] rounded-md px-2.5 py-1.5 bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="DD/MM/AAAA"
            inputMode="numeric"
            value={text}
            onChange={e => handleTextChange(mascararData(e.target.value))}
          />
        </div>

        <div style={{ '--rdp-accent-color': 'var(--brand)', '--rdp-background-color': 'color-mix(in oklch, var(--brand) 15%, transparent)' }}>
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleCalendarSelect}
            locale={ptBR}
            className="p-3 pt-2 text-[var(--text-primary)]"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
