import { test, expect } from '@playwright/test'
import { login, limparParcelas, criarClienteTeste, registrarEnvioWhatsAppTeste } from './helpers/setup'

// Rastreio de entrega do WhatsApp: a Thainá precisa ver se a cobrança chegou
// ao cliente (entregue/lida) ou falhou — e por quê.

let ids: { clienteId: string; parcelaId: string }

test.beforeEach(async ({ page }) => {
  await login(page)
  await limparParcelas()
  ids = await criarClienteTeste()
})

test('E1 — timeline mostra o selo de entrega de cada mensagem', async ({ page }) => {
  const base = Date.now()
  await registrarEnvioWhatsAppTeste(ids.parcelaId, ids.clienteId, {
    status_envio: 'enviado', enviado_em: new Date(base - 3 * 60_000).toISOString(),
  })
  await registrarEnvioWhatsAppTeste(ids.parcelaId, ids.clienteId, {
    status_envio: 'entregue', enviado_em: new Date(base - 2 * 60_000).toISOString(),
    status_atualizado_em: new Date(base - 2 * 60_000 + 5_000).toISOString(),
  })
  await registrarEnvioWhatsAppTeste(ids.parcelaId, ids.clienteId, {
    status_envio: 'lido', enviado_em: new Date(base - 60_000).toISOString(),
  })

  await page.goto(`/parcelas/${ids.parcelaId}`)
  await expect(page.getByText('Histórico de contatos')).toBeVisible()

  const selos = page.getByTestId('selo-entrega')
  await expect(selos).toHaveCount(3)
  await expect(selos.nth(0)).toHaveAttribute('data-status', 'enviado')
  await expect(selos.nth(0)).toContainText('Enviada')
  await expect(selos.nth(1)).toContainText('Entregue')
  await expect(selos.nth(2)).toContainText('Lida')
})

test('E2 — mensagem que falhou mostra o motivo traduzido na timeline', async ({ page }) => {
  await registrarEnvioWhatsAppTeste(ids.parcelaId, ids.clienteId, {
    status_envio: 'falhou', erro_entrega: '131049 | This message was not delivered to maintain healthy ecosystem engagement.',
  })

  await page.goto(`/parcelas/${ids.parcelaId}`)
  const selo = page.getByTestId('selo-entrega')
  await expect(selo).toHaveAttribute('data-status', 'falhou')
  await expect(selo).toContainText('Não entregue')
  await expect(selo).toContainText('A Meta limitou mensagens para este cliente')
})

test('E3 — código desconhecido mostra o texto original da Meta', async ({ page }) => {
  await registrarEnvioWhatsAppTeste(ids.parcelaId, ids.clienteId, {
    status_envio: 'falhou', erro_entrega: '999999 | Some brand new error',
  })

  await page.goto(`/parcelas/${ids.parcelaId}`)
  await expect(page.getByTestId('selo-entrega')).toContainText('Some brand new error')
})

test('E4 — tabela de parcelas alerta quando a última mensagem não foi entregue', async ({ page }) => {
  await registrarEnvioWhatsAppTeste(ids.parcelaId, ids.clienteId, {
    status_envio: 'falhou', erro_entrega: '131026 | Message undeliverable',
  })

  await page.goto('/')
  const linha = page.locator('tbody tr', { hasText: 'João da Silva Teste' })
  await expect(linha.getByTestId('alerta-falha-entrega')).toBeVisible()
})

test('E5 — sem alerta quando a última mensagem foi entregue (falha antiga superada)', async ({ page }) => {
  const base = Date.now()
  await registrarEnvioWhatsAppTeste(ids.parcelaId, ids.clienteId, {
    status_envio: 'falhou', erro_entrega: '131026 | Message undeliverable',
    enviado_em: new Date(base - 60 * 60_000).toISOString(),
  })
  await registrarEnvioWhatsAppTeste(ids.parcelaId, ids.clienteId, {
    status_envio: 'entregue', enviado_em: new Date(base).toISOString(),
  })

  await page.goto('/')
  const linha = page.locator('tbody tr', { hasText: 'João da Silva Teste' })
  await expect(linha).toBeVisible()
  await expect(linha.getByTestId('alerta-falha-entrega')).toHaveCount(0)
})
