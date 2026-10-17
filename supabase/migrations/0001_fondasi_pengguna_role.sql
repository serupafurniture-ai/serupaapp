-- Fase 1 · Fondasi: pengguna, role, notifikasi, activity log.
-- DRAF untuk direview sebelum dijalankan (Blueprint §9, §14, §15 Fase 1).
-- Prinsip: UUID, waktu timestamptz (ditampilkan WIB), soft delete, created_by/updated_by.

create type app_role as enum (
  'owner','marketing','ppic','purchasing','gudang','produksi','qc','ekspedisi','keuangan','viewer'
);

create table public.employees (
  id          uuid primary key references auth.users(id) on delete restrict,
  full_name   text not null,
  phone       text unique,
  is_active   boolean not null default true,
  is_tukang   boolean not null default false,
  is_driver   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  updated_by  uuid references auth.users(id),
  deleted_at  timestamptz
);

create table public.user_roles (
  user_id    uuid not null references public.employees(id) on delete cascade,
  role       app_role not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  primary key (user_id, role)
);

-- Helper izin: dipakai di semua policy modul berikutnya.
create or replace function public.has_role(r app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.employees e on e.id = ur.user_id
    where ur.user_id = auth.uid() and ur.role = r and e.is_active and e.deleted_at is null
  );
$$;

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  recipient   uuid not null references public.employees(id) on delete cascade,
  kind        text not null check (kind in ('order','produksi','qc','stok','approval','pembayaran','pesan','pengiriman')),
  title       text not null,
  body        text not null,
  action_required boolean not null default false,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index notifications_recipient_created_idx on public.notifications (recipient, created_at desc);

create table public.notification_settings (
  user_id uuid not null references public.employees(id) on delete cascade,
  role    app_role not null,
  kind    text not null,
  enabled boolean not null default true,
  primary key (user_id, role, kind)
);

-- Activity log: hanya bisa ditambah, tidak bisa diubah/dihapus (Blueprint §14).
create table public.activity_log (
  id          bigint generated always as identity primary key,
  actor       uuid references auth.users(id),
  action      text not null,
  entity      text not null,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  reason      text,
  created_at  timestamptz not null default now()
);

alter table public.employees             enable row level security;
alter table public.user_roles            enable row level security;
alter table public.notifications         enable row level security;
alter table public.notification_settings enable row level security;
alter table public.activity_log          enable row level security;

-- Karyawan: lihat diri sendiri; Owner lihat & kelola semua.
create policy employees_self_read  on public.employees for select using (id = auth.uid() or public.has_role('owner'));
create policy employees_owner_write on public.employees for all using (public.has_role('owner')) with check (public.has_role('owner'));

create policy user_roles_self_read   on public.user_roles for select using (user_id = auth.uid() or public.has_role('owner'));
create policy user_roles_owner_write on public.user_roles for all using (public.has_role('owner')) with check (public.has_role('owner'));

-- Notifikasi: hanya penerimanya.
create policy notifications_own on public.notifications for select using (recipient = auth.uid());
create policy notifications_mark_read on public.notifications for update using (recipient = auth.uid()) with check (recipient = auth.uid());

create policy notif_settings_own on public.notification_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Log: semua pengguna aktif boleh menambah atas namanya sendiri; hanya Owner yang membaca. Tidak ada policy update/delete.
create policy activity_log_insert on public.activity_log for insert with check (actor = auth.uid());
create policy activity_log_owner_read on public.activity_log for select using (public.has_role('owner'));
