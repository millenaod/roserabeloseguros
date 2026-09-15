// Marca CobraAI — monograma "C" em quadrado arredondado (placeholder até arte final).
// `wordmark` mostra o nome ao lado. `light` inverte as cores para fundos escuros.
export default function CobraLogo({ size = 40, wordmark = false, light = false, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`rounded-xl flex items-center justify-center shrink-0 ${
          light ? 'bg-white/15 ring-1 ring-white/30' : 'bg-cobra-ink'
        }`}
        style={{ width: size, height: size }}
      >
        <span
          className="font-bold leading-none"
          style={{ fontSize: size * 0.5, color: light ? '#fff' : '#fff' }}
        >
          C
        </span>
      </div>
      {wordmark && (
        <span
          className={`font-bold leading-none ${light ? 'text-white' : 'text-cobra-ink'}`}
          style={{ fontSize: size * 0.45 }}
        >
          CobraAI
        </span>
      )}
    </div>
  )
}
