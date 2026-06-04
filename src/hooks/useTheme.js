import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'rose-theme'

function lerInicial() {
  if (typeof window === 'undefined') return 'light'
  const salvo = localStorage.getItem(STORAGE_KEY)
  if (salvo === 'light' || salvo === 'dark') return salvo
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

let tema = lerInicial()
const ouvintes = new Set()

function aplicar(t) {
  document.documentElement.classList.toggle('dark', t === 'dark')
}

// Garante que a classe esteja em sincronia já no carregamento do módulo
aplicar(tema)

function definir(t) {
  if (t !== 'light' && t !== 'dark') return
  tema = t
  localStorage.setItem(STORAGE_KEY, t)
  aplicar(t)
  ouvintes.forEach(fn => fn())
}

function subscribe(fn) {
  ouvintes.add(fn)
  return () => ouvintes.delete(fn)
}

function getSnapshot() {
  return tema
}

export function useTheme() {
  const atual = useSyncExternalStore(subscribe, getSnapshot, () => 'light')
  return {
    tema: atual,
    escuro: atual === 'dark',
    alternar: () => definir(atual === 'dark' ? 'light' : 'dark'),
    definir,
  }
}
