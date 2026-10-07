import { test, expect } from '@playwright/test'
import { login, limparParcelas, criarClienteTeste, registrarEnvioWhatsAppTeste } from './helpers/setup'

test.beforeEach(async ({ page }) => {
  await limparParcelas()
  await login(page)
})

// ─── Estrutura da página ──────────────────────────────────────────────────────

test('TA1 — acessa /tarefas e vê o título "Tarefas do dia"', async ({ page }) => {
  await page.goto('/tarefas')
  await expect(page.getByRole('heading', { name: 'Tarefas do dia' })).toBeVisible()
})

test('TA2 — sem parcelas pendentes exibe EmptyState "Tudo em dia!"', async ({ page }) => {
  await page.goto('/tarefas')
  await expect(page.getByText('Tudo em dia!')).toBeVisible()
})

// ─── Com parcela pendente ─────────────────────────────────────────────────────

test('TA3 — card exibe nome do cliente e botões de ação', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await expect(page.getByText('João da Silva Teste')).toBeVisible()
  await expect(page.getByRole('button', { name: /Cobrar de novo/i }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Marcar paga/i }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Escalar/i }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Desconsiderar/i }).first()).toBeVisible()
})

test('TA4 — clicar no nome do cliente navega para o detalhe da parcela', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByText('João da Silva Teste').click()

  await expect(page).toHaveURL(/\/parcelas\//)
  await expect(page.getByText('Dados da parcela')).toBeVisible()
})

test('TA5 — clicar em "Escalar" exibe toast e remove o card da lista', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Escalar/i }).first().click()

  await expect(page.getByText('Escalada para o vendedor.').first()).toBeVisible()
  await expect(page.getByText('João da Silva Teste')).not.toBeVisible()
})

test('TA6 — clicar em "Marcar paga" exibe toast e remove o card da lista', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Marcar paga/i }).first().click()

  await expect(page.getByText('Marcada como paga!').first()).toBeVisible()
  await expect(page.getByText('João da Silva Teste')).not.toBeVisible()
})

test('TA7 — clicar em "Desconsiderar" exibe toast e remove o card da lista', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Desconsiderar/i }).first().click()

  await expect(page.getByText('Parcela desconsiderada.').first()).toBeVisible()
  await expect(page.getByText('João da Silva Teste')).not.toBeVisible()
})

// ─── Dialog "Cobrar de novo" ──────────────────────────────────────────────────

test('TA8 — clicar em "Cobrar de novo" abre dialog com aviso de boleto obrigatório', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Cobrar de novo/i }).first().click()

  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('O template exige um boleto anexado.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enviar' })).toBeDisabled()
})

test('TA9 — cancelar o dialog de cobrança fecha sem disparar envio', async ({ page }) => {
  await criarClienteTeste()
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Cobrar de novo/i }).first().click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('button', { name: 'Cancelar' }).click()

  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByText('João da Silva Teste')).toBeVisible()
})

// ─── Busca e filtros rápidos ──────────────────────────────────────────────────

async function duasParcelas() {
  await criarClienteTeste()
  return criarClienteTeste(undefined, { nome: 'Márcia Pereira Teste', telefone: '5537988887777', cpf_cnpj: '390.533.447-05', numero_apolice: 'TEST-AUTO-002' })
}

test('TA10 — busca por nome sem acento encontra o cliente e esconde os outros', async ({ page }) => {
  await duasParcelas()
  await page.goto('/tarefas')
  await expect(page.getByText('João da Silva Teste')).toBeVisible()

  await page.getByRole('searchbox', { name: 'Buscar nas tarefas' }).fill('marcia')

  await expect(page.getByText('Márcia Pereira Teste')).toBeVisible()
  await expect(page.getByText('João da Silva Teste')).not.toBeVisible()
  await expect(page.getByText(/1 de 2 parcelas/)).toBeVisible()
})

test('TA11 — busca por telefone e por CPF (só dígitos ou com máscara)', async ({ page }) => {
  await duasParcelas()
  await page.goto('/tarefas')
  const busca = page.getByRole('searchbox', { name: 'Buscar nas tarefas' })

  await busca.fill('98888-7777')
  await expect(page.getByText('Márcia Pereira Teste')).toBeVisible()
  await expect(page.getByText('João da Silva Teste')).not.toBeVisible()

  await busca.fill('529.982')
  await expect(page.getByText('João da Silva Teste')).toBeVisible()
  await expect(page.getByText('Márcia Pereira Teste')).not.toBeVisible()
})

test('TA12 — busca sem resultado mostra aviso e "Limpar" traz tudo de volta', async ({ page }) => {
  await duasParcelas()
  await page.goto('/tarefas')

  await page.getByRole('searchbox', { name: 'Buscar nas tarefas' }).fill('ninguém com esse nome')
  await expect(page.getByText('Nenhuma parcela encontrada')).toBeVisible()

  await page.getByRole('button', { name: 'Limpar busca e filtros' }).click()
  await expect(page.getByText('João da Silva Teste')).toBeVisible()
  await expect(page.getByText('Márcia Pereira Teste')).toBeVisible()
})

test('TA13 — busca fica na URL e sobrevive a abrir o detalhe e voltar', async ({ page }) => {
  await duasParcelas()
  await page.goto('/tarefas')

  await page.getByRole('searchbox', { name: 'Buscar nas tarefas' }).fill('marcia')
  await expect(page).toHaveURL(/q=marcia/)

  await page.getByText('Márcia Pereira Teste').click()
  await expect(page).toHaveURL(/\/parcelas\//)
  await page.goBack()

  await expect(page.getByRole('searchbox', { name: 'Buscar nas tarefas' })).toHaveValue('marcia')
  await expect(page.getByText('João da Silva Teste')).not.toBeVisible()
})

test('TA14 — filtro "Não entregue" mostra só a parcela cuja última mensagem falhou', async ({ page }) => {
  const { clienteId, parcelaId } = await duasParcelas()
  await registrarEnvioWhatsAppTeste(parcelaId, clienteId, {
    status_envio: 'falhou', erro_entrega: '131026 | Message undeliverable',
  })
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Não entregue/ }).click()

  await expect(page.getByText('Márcia Pereira Teste')).toBeVisible()
  await expect(page.getByText('João da Silva Teste')).not.toBeVisible()
  await expect(page.getByTestId('alerta-falha-entrega')).toBeVisible()
})

test('TA15 — filtro "Nunca contatadas" esconde quem já recebeu mensagem', async ({ page }) => {
  const { clienteId, parcelaId } = await duasParcelas()
  await registrarEnvioWhatsAppTeste(parcelaId, clienteId, { status_envio: 'entregue' })
  await page.goto('/tarefas')

  await page.getByRole('button', { name: /Nunca contatadas/ }).click()

  await expect(page.getByText('João da Silva Teste')).toBeVisible()
  await expect(page.getByText('Márcia Pereira Teste')).not.toBeVisible()
})
