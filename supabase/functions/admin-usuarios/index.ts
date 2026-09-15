import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Gerente (perfil 'rose') cria/lista usuários da PRÓPRIA empresa (multi-tenant:
// insere com o org_id do gerente e o GET filtra pela org dele).
const PERFIS_VALIDOS = ["rose", "thaina", "vendedor"];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ error: "Não autenticado" }, 401);

  const asCaller = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await asCaller.auth.getUser();
  if (userErr || !user) return json({ error: "Sessão inválida" }, 401);

  const admin = createClient(url, serviceKey);
  const { data: perfilRow } = await admin
    .from("usuarios").select("perfil, org_id").eq("id", user.id).single();
  if (perfilRow?.perfil !== "rose") {
    return json({ error: "Apenas o gerente pode gerenciar usuários" }, 403);
  }
  const orgId = perfilRow.org_id;

  if (req.method === "GET") {
    const { data: usuarios } = await admin
      .from("usuarios").select("id, nome, perfil, created_at")
      .eq("org_id", orgId).order("created_at");
    const { data: authList } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const emailPorId = new Map((authList?.users ?? []).map((u) => [u.id, u.email]));
    const lista = (usuarios ?? []).map((u) => ({ ...u, email: emailPorId.get(u.id) ?? null }));
    return json({ usuarios: lista });
  }

  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return json({ error: "Corpo inválido" }, 400); }

    const nome = String(body.nome ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const senha = String(body.senha ?? "");
    const perfil = String(body.perfil ?? "");

    if (!nome) return json({ error: "Informe o nome" }, 400);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "E-mail inválido" }, 400);
    if (senha.length < 6) return json({ error: "A senha deve ter ao menos 6 caracteres" }, 400);
    if (!PERFIS_VALIDOS.includes(perfil)) return json({ error: "Perfil inválido" }, 400);

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password: senha, email_confirm: true, user_metadata: { nome },
    });
    if (createErr || !created?.user) {
      const m = createErr?.message ?? "";
      const amigavel = /registered|already|exists/i.test(m) ? "Já existe um usuário com esse e-mail" : (m || "Falha ao criar usuário");
      return json({ error: amigavel }, 400);
    }

    const { error: insErr } = await admin.from("usuarios")
      .insert({ id: created.user.id, nome, perfil, org_id: orgId });
    if (insErr) {
      await admin.auth.admin.deleteUser(created.user.id); // evita órfão no Auth
      return json({ error: "Falha ao gravar o perfil: " + insErr.message }, 400);
    }

    return json({ ok: true, id: created.user.id });
  }

  return json({ error: "Método não suportado" }, 405);
});
