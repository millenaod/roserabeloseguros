// Máscaras de entrada do cadastro. O "+55" é fixo na UI; o usuário digita só DDD+número.

// Exibe o telefone como (DD) XXXXX-XXXX (sem o +55, que é fixo no campo).
// Aceita 10 (fixo) ou 11 (celular) dígitos.
export function mascararTelefone(valor) {
  const d = soDigitos(valor).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

// Telefone pronto para o banco/GTchat: 55 + DDD + número, só dígitos.
export function telefoneCompleto(valor) {
  const d = soDigitos(valor).slice(0, 11)
  return d ? '55' + d : ''
}

// Quantos dígitos (DDD+número) o usuário já digitou — usado na validação.
export function telefoneValido(valor) {
  const n = soDigitos(valor).length
  return n === 10 || n === 11
}

// Exibe o valor como moeda enquanto digita, interpretando os dígitos como centavos.
export function mascararMoeda(valor) {
  const d = soDigitos(valor)
  if (!d) return ''
  return (Number(d) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Valor numérico (em reais) a partir do texto mascarado.
export function moedaParaNumero(valor) {
  const d = soDigitos(valor)
  return d ? Number(d) / 100 : 0
}

// Exibe o CPF como 000.000.000-00 enquanto digita.
export function mascararCpf(valor) {
  const d = soDigitos(valor).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// CPF completo tem 11 dígitos.
export function cpfValido(valor) {
  return soDigitos(valor).length === 11
}

function soDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '')
}
