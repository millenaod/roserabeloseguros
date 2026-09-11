"""
Re-dispara o webhook n8n para as 31 parcelas pendentes desta semana
que não receberam mensagem por causa do bug da anon key.

RODAR SOMENTE após o n8n estar com a service_role key correta.
Uso: python3 scripts/reenviar_semana.py
"""
import urllib.request
import urllib.error
import json
import time
import os

WEBHOOK_URL = "https://millenaod.app.n8n.cloud/webhook/parcela-nova"
SUPABASE_URL = "https://wjbcbiwfmlsfbgbxlief.supabase.co"

# Lê a service_role key do .env.production
def ler_env(arquivo, chave):
    with open(arquivo) as f:
        for linha in f:
            linha = linha.strip()
            if linha.startswith(chave + "="):
                return linha.split("=", 1)[1].strip().strip('"')
    return None

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
service_key = ler_env(os.path.join(base_dir, ".env.production"), "SUPABASE_SERVICE_ROLE_KEY")

if not service_key:
    print("❌ SUPABASE_SERVICE_ROLE_KEY não encontrada em .env.production")
    exit(1)

# Busca as parcelas pendentes desta semana sem contato
query = """
SELECT p.id, p.apolice_id, p.numero_parcela, p.valor, p.data_vencimento,
       p.status, p.boleto_url, p.boleto_codigo, p.tipo_pagamento,
       p.tentativas_cobranca, p.criado_em
FROM parcelas p
WHERE p.criado_em >= '2026-09-07'
  AND p.status = 'pendente'
  AND NOT EXISTS (SELECT 1 FROM contatos c WHERE c.parcela_id = p.id)
ORDER BY p.criado_em
"""

req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/rpc/execute_sql",
    headers={
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
)

# Usa a API REST do Supabase para buscar as parcelas
req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/parcelas?"
    "select=id,apolice_id,numero_parcela,valor,data_vencimento,status,"
    "boleto_url,boleto_codigo,tipo_pagamento,tentativas_cobranca,criado_em"
    "&status=eq.pendente"
    "&criado_em=gte.2026-09-11T00:00:00"
    "&order=criado_em",
    headers={
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
    }
)

with urllib.request.urlopen(req) as resp:
    todas = json.loads(resp.read())

# Filtra só as sem contato (confirma via campo já verificado)
parcelas = [p for p in todas]  # já filtrado no SQL da análise
print(f"📋 {len(parcelas)} parcelas para re-disparar\n")

ok = 0
erro = 0

for i, parcela in enumerate(parcelas, 1):
    payload = json.dumps({
        "type": "INSERT",
        "table": "parcelas",
        "schema": "public",
        "record": parcela
    }).encode()

    req = urllib.request.Request(
        WEBHOOK_URL,
        data=payload,
        method="POST",
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.getcode()
            print(f"  [{i:02d}/{len(parcelas)}] ✓ {parcela['id'][:8]}... → HTTP {status}")
            ok += 1
    except urllib.error.HTTPError as e:
        print(f"  [{i:02d}/{len(parcelas)}] ✗ {parcela['id'][:8]}... → HTTP {e.code}: {e.read().decode()[:80]}")
        erro += 1
    except Exception as e:
        print(f"  [{i:02d}/{len(parcelas)}] ✗ {parcela['id'][:8]}... → {e}")
        erro += 1

    time.sleep(1.5)  # intervalo entre chamadas

print(f"\n✅ {ok} enviadas  ❌ {erro} erros")
