# Atualizar templates no Meta BM — adicionar nome da seguradora

## Como acessar

1. Acesse business.facebook.com
2. Menu lateral → **WhatsApp** → **Gerenciador de modelos de mensagem**

---

## Legenda das variáveis (igual nos 3 templates)

| Variável | O que será preenchido |
|---|---|
| `{{1}}` | Primeiro nome do cliente |
| `{{2}}` | Nome da atendente (Thainá) |
| `{{3}}` | Nome da seguradora (ex: Porto Seguro) |

---

## Template 1 — `cobranca_de_boleto`

Localize, clique em **Editar** e substitua o corpo por:

```
Olá, {{1}}!
Aqui é {{2}}, da Rose Rabelo Seguros. Tudo bem?

Identificamos em nosso sistema que a parcela do seu seguro {{3}} consta como em aberto. Poderia, por gentileza, nos confirmar se o pagamento já foi realizado?
Caso tenha sido pago gentileza desconsiderar esse anexo.
```

---

## Template 2 — `regularizacao_debito`

Localize, clique em **Editar** e substitua o corpo por:

```
Olá, {{1}}! Tudo bem?

Aqui é {{2}}, da Rose Rabelo Seguros.

Ao verificar em sistema, identificamos que o débito programado referente à parcela do seguro {{3}} não foi concluído. Para regularização, a seguradora disponibilizou um boleto com novo vencimento.

Na sequência, envio o boleto para sua conferência.
Rose Rabelo Seguros
```

---

## Template 3 — `recusa_cartao`

Localize, clique em **Editar** e substitua o corpo por:

```
Olá, {{1}}! Tudo bem?

Aqui é {{2}}, da Rose Seguros.

Ao verificar em sistema, identificamos que a parcela do seu seguro {{3}} não foi autorizada pela operadora do cartão de crédito. Para evitar qualquer interrupção, a seguradora disponibilizou um boleto para regularização.

Na sequência, envio o boleto para sua conferência.
Rose Rabelo Seguros
```

---

## Exemplos para preencher no Meta (campo obrigatório)

Quando o Meta pedir exemplos para a variável nova `{{3}}`, coloque:

- `{{1}}` → `João`
- `{{2}}` → `Thainá`
- `{{3}}` → `Porto Seguro`

---

## Depois de aprovar

Quando os 3 templates estiverem aprovados, avisar a Millena para atualizar o código e o n8n.
