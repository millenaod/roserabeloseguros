// Marca CobraAI — monograma "C" em quadrado escuro arredondado (estilo referência
// Osko). Placeholder até a arte final. `wordmark` mostra o nome ao lado.
export default function CobraLogo({ size = 40, wordmark = false, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="rounded-xl bg-cobra-ink flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <span className="text-white font-bold leading-none" style={{ fontSize: size * 0.5 }}>
          C
        </span>
      </div>
      {wordmark && (
        <span className="font-bold text-cobra-ink leading-none" style={{ fontSize: size * 0.45 }}>
          CobraAI
        </span>
      )}
    </div>
  )
}
