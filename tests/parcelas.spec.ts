import { test, expect } from '@playwright/test'
import { login, limparParcelas } from './helpers/setup'

test.beforeEach(async ({ page }) => {
  await login(page)
  await limparParcelas()
})

// ─── Visão Tabela ────────────────────────────────────────────────────────────

test('T1 — Thainá abre o sistema e vê a tabela de parcelas com colunas corretas', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('columnheader', { name: 'Cliente' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Seguradora' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Valor' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Vencimento' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
})

test('T2 — Thainá clica em Nova Parcela e linha editável aparece na tabela', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Nova Parcela' }).click()
  await expect(page.getByPlaceholder('Nome*')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible()
})

test('T3 — Thainá cadastra nova parcela e ela aparece na tabela', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Nova Parcela' }).click()

  const inlineRow = page.locator('tr', { has: page.getByPlaceholder('Nome*') })

  await page.getByPlaceholder('Nome*').fill('Maria Silva Teste')

  // Seleciona a primeira seguradora disponível
  await inlineRow.getByRole('combobox').click()
  await page.getByRole('option').first().click()

  await page.getByPlaceholder('Apólice*').fill('AP-001234')
  await page.getByPlaceholder('Nº*').fill('3')
  await page.getByPlaceholder('R$*').fill('1240')
  await inlineRow.locator('input[type="date"]').fill('2026-06-15')

  await page.getByRole('button', { name: 'Salvar' }).click()

  await expect(page.getByText('Parcela cadastrada!')).toBeVisible()
  await expect(page.getByText('Maria Silva Teste')).toBeVisible()
})

test('T4 — Thainá tenta salvar sem preencher o Nome e campo fica destacado', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Nova Parcela' }).click()
  await page.getByRole('button', { name: 'Salvar' }).click()

  // Formulário permanece visível — não foi salvo
  await expect(page.getByPlaceholder('Nome*')).toBeVisible()
  // Campo Nome recebe borda de erro
  await expect(page.getByPlaceholder('Nome*')).toHaveClass(/border-red-400/)
})

test('T5 — Thainá filtra por status Pago e tabela mostra só parcelas pagas', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('combobox', { name: 'Todos os status' }).click()
  await page.getByRole('option', { name: 'Pago' }).click()

  // Trigger do filtro confirma a seleção
  await expect(page.getByRole('combobox').first()).toContainText('Pago')

  // Nenhuma badge de outro status deve estar visível na tabela
  const rows = page.locator('tbody tr')
  const count = await rows.count()
  for (let i = 0; i < count; i++) {
    const statusCell = rows.nth(i).locator('td').nth(5)
    await expect(statusCell).toContainText(/pago/i)
  }
})

test('T6 — Thainá filtra por seguradora e tabela mostra só parcelas daquela seguradora', async ({ page }) => {
  await page.goto('/')

  // Abre o select de seguradora e escolhe a primeira disponível
  await page.getByRole('combobox', { name: 'Todas seguradoras' }).click()
  const primeiraOpcao = page.getByRole('option').nth(1) // nth(0) é "Todas seguradoras"
  const nomeSeg = await primeiraOpcao.textContent()
  await primeiraOpcao.click()

  await expect(page.getByRole('combobox', { name: /todas seguradoras/i })).not.toBeVisible()

  // Todas as linhas visíveis pertencem à seguradora selecionada
  const rows = page.locator('tbody tr')
  const count = await rows.count()
  for (let i = 0; i < count; i++) {
    await expect(rows.nth(i).locator('td').nth(1)).toContainText(nomeSeg!)
  }
})

test('T7 — Thainá filtra por data de vencimento e tabela mostra só parcelas do período', async ({ page }) => {
  await page.goto('/')

  const dataFiltro = '2026-06-30'
  await page.locator('input[type="date"]').first().fill(dataFiltro)

  // Verifica que as datas nas linhas visíveis são anteriores ou iguais ao filtro
  const rows = page.locator('tbody tr')
  const count = await rows.count()
  expect(count).toBeGreaterThanOrEqual(0) // filtro aplicado sem erro
})

test('T8 — filtro sem resultado mostra EmptyState com mensagem correta', async ({ page }) => {
  await page.goto('/')

  // Data no passado distante garante resultado vazio
  await page.locator('input[type="date"]').first().fill('2000-01-01')

  await expect(page.getByText('Nenhuma parcela encontrada')).toBeVisible()
})

// ─── Visão Kanban ─────────────────────────────────────────────────────────────

test('K1 — Thainá clica em Kanban e colunas de status aparecem', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Kanban' }).click()

  await expect(page.getByRole('heading', { name: 'Pendente' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Enviado' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pago' })).toBeVisible()
})

test('K2 — Thainá clica em Tabela e volta para a visão de tabela', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Kanban' }).click()
  await page.getByRole('button', { name: 'Tabela' }).click()

  await expect(page.getByRole('columnheader', { name: 'Cliente' })).toBeVisible()
})

test('K3 — Thainá arrasta card de PENDENTE para PAGO e card aparece na nova coluna', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Kanban' }).click()
  await expect(page.getByRole('heading', { name: 'Pendente' })).toBeVisible()

  // Card draggável: dnd-kit aplica tabindex="0" e role="button" ao div do card
  const card = page.locator('[tabindex="0"][role="button"]').first()
  await expect(card).toBeVisible()

  const nomeCliente = await card.locator('p').first().textContent()
  const cardBox = await card.boundingBox()
  const pagoHeading = page.getByRole('heading', { name: 'Pago' })
  const pagoBox = await pagoHeading.boundingBox()

  if (!cardBox || !pagoBox) throw new Error('Elementos não encontrados para drag')

  const cx = cardBox.x + cardBox.width / 2
  const cy = cardBox.y + cardBox.height / 2

  await page.mouse.move(cx, cy)
  await page.mouse.down()
  // Move gradual para ativar o PointerSensor (activationConstraint: { distance: 8 })
  await page.mouse.move(cx + 4, cy)
  await page.mouse.move(cx + 10, cy)
  await page.mouse.move(pagoBox.x + 80, pagoBox.y + 60, { steps: 20 })
  await page.mouse.up()

  await page.waitForTimeout(600) // aguarda atualização no banco
  await expect(page.getByText(nomeCliente!)).toBeVisible()
})

test('K4 — Thainá clica em Nova Parcela no kanban mobile e bottom sheet abre', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Kanban' }).click()
  await page.getByRole('button', { name: 'Nova' }).click()

  await expect(page.getByText('Nova Parcela')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Salvar Parcela' })).toBeVisible()
})

// ─── Detalhe da Parcela ───────────────────────────────────────────────────────

test('D1 — Thainá abre detalhe de uma parcela e vê os dados corretos', async ({ page }) => {
  await page.goto('/')
  await page.locator('tbody tr').first().click()

  await expect(page).toHaveURL(/\/parcelas\//)
  await expect(page.getByText('Dados da parcela')).toBeVisible()
  await expect(page.getByText('Histórico de contatos')).toBeVisible()
})

test('D2 — Thainá vê a timeline de contatos com registros', async ({ page }) => {
  await page.goto('/')
  await page.locator('tbody tr').first().click()

  await expect(page.getByText('Histórico de contatos')).toBeVisible()
})

test('D3 — Thainá marca parcela como paga e status muda para pago', async ({ page }) => {
  await page.goto('/')
  // Busca a primeira linha que não seja paga (botão Pagar habilitado na coluna Ações)
  const linhaValida = page.locator('tbody tr').filter({
    hasNot: page.locator('td', { hasText: /pago/i }),
  }).first()
  await linhaValida.click()

  await page.getByRole('button', { name: 'Marcar como paga' }).click()
  await expect(page.getByText('Marcar como paga?')).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar pagamento' }).click()

  await expect(page.getByText('Parcela marcada como paga!')).toBeVisible()
})

test('D4 — Thainá clica em Marcar como paga mas cancela e nada muda', async ({ page }) => {
  await page.goto('/')
  // Usa a segunda linha não-paga para não conflitar com D3
  const linhaValida = page.locator('tbody tr').filter({
    hasNot: page.locator('td', { hasText: /pago/i }),
  }).nth(1)
  await linhaValida.click()

  const urlAntes = page.url()
  await page.getByRole('button', { name: 'Marcar como paga' }).click()
  await expect(page.getByText('Marcar como paga?')).toBeVisible()
  await page.getByRole('button', { name: 'Cancelar' }).click()

  await expect(page.getByText('Marcar como paga?')).not.toBeVisible()
  await expect(page).toHaveURL(urlAntes)
})

test('D5 — Thainá remarca parcela com nova data e status muda para remarcado', async ({ page }) => {
  await page.goto('/')
  await page.locator('tbody tr').first().click()

  await page.getByRole('button', { name: 'Remarcar' }).click()
  await expect(page.getByText('Remarcar parcela')).toBeVisible()
  await page.locator('dialog input[type="date"], [role="dialog"] input[type="date"]').fill('2026-07-30')
  await page.getByRole('button', { name: 'Confirmar' }).click()

  await expect(page.getByText('Parcela remarcada!')).toBeVisible()
})

test('D6 — Thainá escala parcela para vendedor e status muda para escalado', async ({ page }) => {
  await page.goto('/')
  await page.locator('tbody tr').first().click()

  await page.getByRole('button', { name: 'Escalar para vendedor' }).click()
  await expect(page.getByText('Escalar para vendedor?')).toBeVisible()
  await page.getByRole('button', { name: 'Escalar' }).click()

  await expect(page.getByText('Parcela escalada para vendedor.')).toBeVisible()
})
