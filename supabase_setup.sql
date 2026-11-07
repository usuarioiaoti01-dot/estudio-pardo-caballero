-- ============================================================
-- CONFIGURACIÓN SUPABASE — Pardo Caballero Estudio Jurídico
-- Ejecutar UNA VEZ en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Tabla que guarda TODOS los datos compartidos (documento único)
create table if not exists public.estudio_data (
  id          text primary key,
  data        jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

-- 2) Fila principal (una sola, compartida por todos los usuarios)
insert into public.estudio_data (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

-- 3) Seguridad a nivel de fila: SOLO usuarios autenticados pueden ver/editar
alter table public.estudio_data enable row level security;

drop policy if exists "leer_autenticados"  on public.estudio_data;
drop policy if exists "escribir_autenticados" on public.estudio_data;

create policy "leer_autenticados"
  on public.estudio_data
  for select
  to authenticated
  using (true);

create policy "escribir_autenticados"
  on public.estudio_data
  for all
  to authenticated
  using (true)
  with check (true);

-- 4) Habilitar Realtime (para que los cambios de un usuario se vean en los demás)
--    Este bloque NO falla si la tabla ya estaba habilitada.
do $$
begin
  alter publication supabase_realtime add table public.estudio_data;
exception
  when duplicate_object then null;  -- ya estaba habilitada, todo bien
end $$;

-- ============================================================
-- IMPORTANTE (hacer en el panel de Supabase, NO aquí):
-- Authentication → Providers → Email: mantener habilitado.
-- Authentication → Sign In / Providers → DESACTIVAR "Allow new users to sign up"
--   (así SOLO los usuarios que ya creaste pueden entrar; nadie se registra solo).
-- ============================================================
