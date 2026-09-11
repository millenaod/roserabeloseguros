import { defineConfig, devices } from '@playwright/test'
import { readFileSync } from 'fs'

try {
  readFileSync('.env.test', 'utf-8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .forEach(l => {
      const [k, ...v] = l.split('=')
      if (k?.trim()) process.env[k.trim()] = v.join('=').trim()
    })
} catch {
  // .env.test não encontrado — use variáveis de ambiente do sistema
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  webServer: {
    command: 'npm run dev -- --mode test --port 5174',
    url: 'http://localhost:5174',
    reuseExistingServer: false,
    timeout: 30_000,
  },
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/mobile.spec.ts'],
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
      testMatch: ['**/mobile.spec.ts', '**/autenticacao.spec.ts'],
    },
  ],
})
