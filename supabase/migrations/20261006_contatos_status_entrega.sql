-- Rastreio de entrega do WhatsApp (Meta Cloud API).
-- O Fluxo 1 do n8n grava o wamid devolvido pela Meta em wa_message_id;
-- o fluxo "Status de entrega WhatsApp (Meta)" recebe os webhooks de status
-- (sent/delivered/read/failed) e atualiza status_envio/erro_entrega pelo wamid.

alter table public.contatos
  add column if not exists wa_message_id        text,
  add column if not exists erro_entrega         text,
  add column if not exists status_atualizado_em timestamptz;

create index if not exists contatos_wa_message_id_idx
  on public.contatos (wa_message_id)
  where wa_message_id is not null;

-- v_parcelas_ui ganha o status da última mensagem (para alertar falha na lista/kanban).
create or replace view public.v_parcelas_ui
with (security_invoker = true) as
 SELECT p.id AS parcela_id,
    p.numero_parcela,
    p.valor,
    p.data_vencimento,
    p.status,
    p.kanban_coluna,
    p.boleto_url,
    p.pausado,
    GREATEST(0, CURRENT_DATE - p.data_vencimento) AS dias_atraso,
    a.id AS apolice_id,
    a.numero_apolice,
    a.tipo_seguro,
    c.id AS cliente_id,
    c.nome AS cliente_nome,
    c.cpf_cnpj AS cliente_cpf,
    c.telefone AS cliente_telefone,
    c.email AS cliente_email,
    c.vip AS cliente_vip,
    s.id AS seguradora_id,
    s.nome AS seguradora_nome,
    s.codigo AS seguradora_codigo,
    COALESCE(ct_agg.total, 0::bigint) AS total_contatos,
    ct_agg.ultimo_em AS ultimo_contato_em,
    p.numero_parcela = 1 AS eh_primeira_parcela,
    (CURRENT_DATE - p.data_vencimento) >= 15 AS cobertura_em_risco,
    p.tipo_pagamento,
    p.criado_em,
    p.org_id,
    ult.status_envio AS ultimo_status_envio,
    ult.erro_entrega AS ultimo_erro_entrega
   FROM parcelas p
     JOIN apolices a ON a.id = p.apolice_id
     JOIN clientes c ON c.id = a.cliente_id
     JOIN seguradoras s ON s.id = a.seguradora_id
     LEFT JOIN ( SELECT contatos.parcela_id,
            count(*) AS total,
            max(contatos.enviado_em) AS ultimo_em
           FROM contatos
          GROUP BY contatos.parcela_id) ct_agg ON ct_agg.parcela_id = p.id
     LEFT JOIN LATERAL ( SELECT ct.status_envio, ct.erro_entrega
           FROM contatos ct
          WHERE ct.parcela_id = p.id AND ct.canal = 'whatsapp'
          ORDER BY ct.enviado_em DESC NULLS LAST
         LIMIT 1) ult ON true
  WHERE a.ativa = true;
