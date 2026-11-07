// ============================================================
// EDGE FUNCTION: admin-users  (Consultorias Integrales)
// Gestiona usuarios de Supabase Auth de forma SEGURA.
// La clave de administrador (service_role) NUNCA sale del servidor:
// Supabase la inyecta como variable de entorno SUPABASE_SERVICE_ROLE_KEY.
//
// CÓMO DESPLEGARLA (una sola vez):
//  1) Supabase → menú "Edge Functions" → "Deploy a new function" / "Create function".
//  2) Nombre EXACTO: admin-users
//  3) Pega TODO este archivo como el código de la función y pulsa Deploy.
//  4) No necesitas configurar secretos: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
//     ya vienen disponibles automáticamente en las Edge Functions.
//  5) Verifica que martin.montoya@gmail.com exista como usuario (será el Administrador).
// ============================================================

import { createClient } from 'jsr:@supabase/supabase-js@2'

const ADMIN_EMAIL = 'martin.montoya@gmail.com'
const ROLES = ['Administrador', 'Administrativo', 'Abogado', 'Abogado Externo']

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

    // 1) Verificar que quien llama esté autenticado
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '')
    if (!token) return json({ error: 'No autenticado' }, 401)
    const { data: uData, error: uErr } = await admin.auth.getUser(token)
    if (uErr || !uData?.user) return json({ error: 'Sesión inválida' }, 401)
    const caller = uData.user
    const callerRole = (caller.user_metadata as any)?.role || ''
    const isAdmin = (caller.email || '').toLowerCase() === ADMIN_EMAIL || callerRole === 'Administrador'
    if (!isAdmin) return json({ error: 'Solo el Administrador puede gestionar usuarios' }, 403)

    const body = await req.json().catch(() => ({}))
    const action = body.action

    if (action === 'list') {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 })
      if (error) return json({ error: error.message }, 400)
      const users = data.users.map((u: any) => ({
        id: u.id, email: u.email,
        nombre: u.user_metadata?.nombre || '',
        role: u.user_metadata?.role || '',
        mustChange: !!u.user_metadata?.mustChange,
        confirmed: !!u.email_confirmed_at,
        lastSignIn: u.last_sign_in_at || null,
      }))
      return json({ users })
    }

    if (action === 'create') {
      const email = String(body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      const nombre = String(body.nombre || '').trim()
      const role = ROLES.includes(body.role) ? body.role : 'Abogado'
      if (!email || password.length < 6) return json({ error: 'Correo válido y clave de 6+ caracteres requeridos' }, 400)
      const { data, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { nombre, role, mustChange: true },
      })
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true, user: { id: data.user.id, email: data.user.email } })
    }

    if (action === 'setRole') {
      const id = String(body.id || '')
      const role = ROLES.includes(body.role) ? body.role : 'Abogado'
      if (!id) return json({ error: 'Falta id' }, 400)
      const { data: cur } = await admin.auth.admin.getUserById(id)
      const meta = { ...(cur?.user?.user_metadata || {}), role }
      const { error } = await admin.auth.admin.updateUserById(id, { user_metadata: meta })
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }

    if (action === 'resetPassword') {
      const id = String(body.id || '')
      const password = String(body.password || '')
      if (!id || password.length < 6) return json({ error: 'Clave de 6+ caracteres requerida' }, 400)
      const { data: cur } = await admin.auth.admin.getUserById(id)
      const meta = { ...(cur?.user?.user_metadata || {}), mustChange: true }
      const { error } = await admin.auth.admin.updateUserById(id, { password, user_metadata: meta })
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }

    if (action === 'delete') {
      const id = String(body.id || '')
      if (!id) return json({ error: 'Falta id' }, 400)
      if ((body.email || '').toLowerCase() === ADMIN_EMAIL) return json({ error: 'No se puede eliminar al Administrador' }, 400)
      const { error } = await admin.auth.admin.deleteUser(id)
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }

    return json({ error: 'Acción no reconocida' }, 400)
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
