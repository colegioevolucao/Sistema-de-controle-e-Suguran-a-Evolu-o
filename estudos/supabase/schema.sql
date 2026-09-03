-- Evolução | Painel de Estudos
-- Estrutura sugerida para persistir os registros do aluno e permitir a visão de gestão.
-- IMPORTANTE: adapte os vínculos com a tabela de alunos/usuários já existente no Acesso Seguro.

create extension if not exists pgcrypto;

create table if not exists public.study_daily_records (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  student_name text not null,
  class_name text not null,
  study_date date not null,
  other_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, study_date)
);

create table if not exists public.study_items (
  id uuid primary key default gen_random_uuid(),
  daily_record_id uuid not null references public.study_daily_records(id) on delete cascade,
  area text not null check (area in ('Natureza','Humanas','Linguagens','Matemática')),
  discipline text not null,
  subject text not null,
  position smallint not null default 1 check (position between 1 and 3)
);

create table if not exists public.study_methods (
  id uuid primary key default gen_random_uuid(),
  daily_record_id uuid not null references public.study_daily_records(id) on delete cascade,
  method text not null check (method in ('Aula/Videoaula','Leitura','Resolução de questões','Outro')),
  unique(daily_record_id, method)
);

create table if not exists public.study_question_records (
  id uuid primary key default gen_random_uuid(),
  daily_record_id uuid not null references public.study_daily_records(id) on delete cascade,
  discipline text not null,
  questions integer not null check (questions >= 0),
  correct integer not null check (correct >= 0 and correct <= questions)
);

create index if not exists idx_study_daily_records_date on public.study_daily_records(study_date);
create index if not exists idx_study_daily_records_student on public.study_daily_records(student_id, study_date desc);
create index if not exists idx_study_daily_records_class on public.study_daily_records(class_name, study_date desc);

-- A tabela de tempo abaixo é apenas uma interface de referência.
-- Se o Acesso Seguro já possui uma tabela de entradas/saídas do Espaço Evoluir,
-- NÃO duplique os dados: substitua esta tabela por uma VIEW apontando para a fonte oficial.
create table if not exists public.space_evoluir_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  student_name text not null,
  class_name text not null,
  session_date date not null,
  entered_at timestamptz not null,
  exited_at timestamptz,
  effective_minutes integer not null default 0 check (effective_minutes >= 0)
);

create index if not exists idx_space_sessions_date on public.space_evoluir_sessions(session_date);
create index if not exists idx_space_sessions_student on public.space_evoluir_sessions(student_id, session_date desc);

-- Visão pronta para o painel diário da gestão.
create or replace view public.study_management_daily as
select
  s.student_id,
  s.student_name,
  s.class_name,
  s.session_date,
  s.effective_minutes,
  (r.id is not null) as registered,
  coalesce((select count(*) from public.study_items i where i.daily_record_id = r.id), 0) as study_items_count,
  coalesce((select sum(q.questions) from public.study_question_records q where q.daily_record_id = r.id), 0) as total_questions,
  nullif(trim(coalesce(r.notes, '')), '') is not null as has_notes
from public.space_evoluir_sessions s
left join public.study_daily_records r
  on r.student_id = s.student_id
 and r.study_date = s.session_date;

-- Relatório detalhado por disciplina/questões.
create or replace view public.study_question_performance as
select
  r.student_id,
  r.student_name,
  r.class_name,
  r.study_date,
  q.discipline,
  q.questions,
  q.correct,
  case when q.questions > 0 then round((q.correct::numeric / q.questions::numeric) * 100, 1) else 0 end as performance_percent
from public.study_daily_records r
join public.study_question_records q on q.daily_record_id = r.id;

-- Trigger simples de updated_at.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_study_daily_records_updated_at on public.study_daily_records;
create trigger trg_study_daily_records_updated_at
before update on public.study_daily_records
for each row execute function public.set_updated_at();

-- Segurança: habilite RLS e ajuste as policies ao modelo de autenticação já usado pela escola.
alter table public.study_daily_records enable row level security;
alter table public.study_items enable row level security;
alter table public.study_methods enable row level security;
alter table public.study_question_records enable row level security;
alter table public.space_evoluir_sessions enable row level security;

-- EXEMPLO (NÃO ATIVE SEM ADAPTAR):
-- O ideal é que student_id seja ligado ao auth.uid() por uma tabela de perfis.
-- A gestão deve receber acesso por role/claim institucional, nunca por regra aberta.
