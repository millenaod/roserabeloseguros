import { test, expect } from '@playwright/test'
import { login, limparParcelas, criarClienteTeste, registrarEnvioWhatsAppTeste } from './helpers/setup'

test.beforeEach(async ({ page }) => {
  await login(page)
})

test('M1 — usuário em mobile vê o BottomNav e a Sidebar some', async ({ page }) => {
  await page.goto('/')

  // BottomNav está visível (md:hidden = visível até md)
  // BottomNav tem classe "fixed" — mais específico que só "nav"
  const bottomNav = page.locator('nav.fixed')
  await expect(bottomNav).toBeVisible()

  // Sidebar fica oculta (hidden md:flex = oculta abaixo de md)
  const sidebar = page.locator('aside')
  await expect(sidebar).not.toBeVisible()
})

test('M2 — usuário clica no ícone de perfil e drawer abre dentro do app', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Perfil' }).click()

  // Sheet de perfil abre — mostra o botão Sair da conta
  await expect(page.getByRole('button', { name: 'Sair da conta' })).toBeVisible()
  // Não navega para fora do app
  await expect(page).toHaveURL('/')
})

test('M3 — usuário clica em Sair dentro do drawer e faz logout', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Perfil' }).click()
  await page.getByRole('button', { name: 'Sair da conta' }).click()

  await expect(page).toHaveURL('/login')
})

test('M4 — usuário clica em Nova no mobile e bottom sheet sobe com formulário', async ({ page }) => {
  await page.goto('/')

  // Botão "Nova" do cabeçalho da página (não o do BottomNav)
  await page.getByRole('button', { name: 'Nova' }).click()

  await expect(page.getByRole('heading', { name: 'Nova Parcela' })).toBeVisible()
  await expect(page.getByText('Nome do cliente')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Salvar Parcela' })).toBeVisible()
})

test('M5 — usuário clica em Filtros e drawer de filtros abre', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Filtros' }).click()

  // Sheet de filtros abre com o título "Filtros"
  await expect(page.getByRole('heading', { name: 'Filtros' })).toBeVisible()
  // Radix SelectTrigger não tem accessible name — verifica apenas que existe ao menos um combobox
  await expect(page.getByRole('combobox').first()).toBeVisible()
})

test('M7 — perfil rose acessa a Visão Gerencial pelo drawer de perfil no mobile', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Perfil' }).click()
  // O drawer de perfil expõe os atalhos gerenciais só para o perfil rose
  await page.getByRole('button', { name: 'Visão Gerencial' }).click()

  await expect(page).toHaveURL('/dashboard-rose')
})

test('M6 — usuário navega para Kanban no mobile e colunas rolam horizontalmente', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Por status' }).click()

  // Container das colunas deve ter overflow-x-auto (colunas roláveis horizontalmente)
  const kanbanContainer = page.locator('.overflow-x-auto')
  await expect(kanbanContainer).toBeVisible()

  // Ao menos a primeira coluna está visível
  await expect(page.getByRole('heading', { name: 'A cobrar' })).toBeVisible()
})

test('M8 — no celular a Thainá vê que a cobrança não foi entregue e o motivo', async ({ page }) => {
  await limparParcelas()
  const { clienteId, parcelaId } = await criarClienteTeste()
  await registrarEnvioWhatsAppTeste(parcelaId, clienteId, {
    status_envio: 'falhou', erro_entrega: '131026 | Message undeliverable',
  })

  await page.goto(`/parcelas/${parcelaId}`)
  const selo = page.getByTestId('selo-entrega')
  await expect(selo).toBeVisible()
  await expect(selo).toContainText('Não entregue')
  await expect(selo).toContainText('o número pode não ter WhatsApp')

  // Motivo longo não pode vazar a largura da tela
  const box = await selo.boundingBox()
  const largura = page.viewportSize()!.width
  expect(box!.x + box!.width).toBeLessThanOrEqual(largura)
})

test('M9 — no celular a busca e os filtros das Tarefas cabem na tela', async ({ page }) => {
  await limparParcelas()
  await criarClienteTeste()
  await page.goto('/tarefas')

  const busca = page.getByRole('searchbox', { name: 'Buscar nas tarefas' })
  await expect(busca).toBeVisible()
  await busca.fill('joao')
  await expect(page.getByText('João da Silva Teste')).toBeVisible()

  // A página não pode rolar na horizontal (os chips rolam dentro do próprio grupo)
  const larguraDoc = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(larguraDoc).toBeLessThanOrEqual(page.viewportSize()!.width)
})
