import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Painel super-admin: cria uma nova empresa (org) e convida o dono por e-mail
// (ele define a própria senha pelo link). Só super-admin pode chamar.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function slugify(nome: string): string {
  const base = nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return base || "org";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não suportado" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ error: "Não autenticado" }, 401);

  const asCaller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: userErr } = await asCaller.auth.getUser();
  if (userErr || !user) return json({ error: "Sessão inválida" }, 401);

  const admin = createClient(url, serviceKey);
  const { data: perfilRow } = await admin.from("usuarios").select("super_admin").eq("id", user.id).single();
  if (!perfilRow?.super_admin) return json({ error: "Apenas o super-admin pode criar empresas" }, 403);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Corpo inválido" }, 400); }

  const nomeEmpresa = String(body.nomeEmpresa ?? "").trim();
  const emailDono = String(body.emailDono ?? "").trim().toLowerCase();
  const nomeDono = String(body.nomeDono ?? "").trim();
  const plano = String(body.plano ?? "free").trim() || "free";
  const redirectTo = body.redirectTo ? String(body.redirectTo) : undefined;

  if (!nomeEmpresa) return json({ error: "Informe o nome da empresa" }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailDono)) return json({ error: "E-mail do dono inválido" }, 400);

  let slug = slugify(nomeEmpresa);
  const { data: existe } = await admin.from("organizacoes").select("id").eq("slug", slug).maybeSingle();
  if (existe) slug = `${slug}-${crypto.randomUUID().slice(0, 6)}`;

  const { data: org, error: orgErr } = await admin.from("organizacoes")
    .insert({ nome: nomeEmpresa, slug, plano }).select("id").single();
  if (orgErr || !org) return json({ error: "Falha ao criar empresa: " + (orgErr?.message ?? "") }, 400);

  // Convida o dono (cria o auth user + envia e-mail com link p/ definir senha).
  // Sem nome_empresa no metadata → o trigger handle_new_user NÃO provisiona; nós
  // vinculamos manualmente à org recém-criada.
  const { data: invited, error: invErr } = await admin.auth.admin.inviteUserByEmail(emailDono, {
    data: { nome_usuario: nomeDono },
    redirectTo,
  });
  if (invErr || !invited?.user) {
    await admin.from("organizacoes").delete().eq("id", org.id); // não deixa org órfã
    const m = invErr?.message ?? "";
    const amigavel = /registered|already|exists/i.test(m) ? "Já existe um usuário com esse e-mail" : (m || "Falha ao convidar o dono");
    return json({ error: amigavel }, 400);
  }

  const { error: upErr } = await admin.from("usuarios")
    .upsert({ id: invited.user.id, nome: nomeDono || nomeEmpresa, perfil: "rose", org_id: org.id });
  if (upErr) {
    await admin.from("organizacoes").delete().eq("id", org.id);
    await admin.auth.admin.deleteUser(invited.user.id);
    return json({ error: "Falha ao vincular o dono: " + upErr.message }, 400);
  }

  return json({ ok: true, org_id: org.id, slug, user_id: invited.user.id });
});
