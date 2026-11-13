-- ─────────────────────────────────────────────────────────────────────────────
-- Donuts & Donuts Lyon Part-Dieu : table des demandes + stockage des images.
-- À coller UNE FOIS dans Supabase > SQL Editor > New query > Run.
-- (Le script peut être relancé sans risque.)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.demandes (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  type           text not null check (type in ('anniversaire', 'personnalisee', 'pro')),
  statut         text not null default 'nouvelle',      -- libre : nouvelle, rappelée, confirmée, annulée…
  prenom         text not null,
  nom            text not null,
  telephone      text not null,
  email          text not null,
  date_souhaitee date not null,
  message        text,
  source         text,                                   -- « Comment nous avez-vous connus ? »
  details        jsonb not null default '{}'::jsonb,     -- champs propres à chaque formulaire
  image_path     text,                                   -- image d'inspiration (bucket « inspirations »)
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  utm_term       text,
  utm_content    text,
  email_envoye   boolean not null default false
);

create index if not exists demandes_created_at_idx on public.demandes (created_at desc);
create index if not exists demandes_type_idx on public.demandes (type);

-- Sécurité : la table n'est accessible ni en lecture ni en écriture depuis Internet.
-- Seul le site (côté serveur, avec la clé secrète) peut y écrire.
alter table public.demandes enable row level security;

-- Vue lisible pour consulter les demandes dans le Table Editor
-- (supprimée puis recréée pour pouvoir ajouter des colonnes : relancer ce script est sans risque)
drop view if exists public.demandes_lisibles;
create view public.demandes_lisibles
with (security_invoker = true) as
select
  created_at at time zone 'Europe/Paris' as recue_le,
  case coalesce(details ->> 'boutique', 'lyon')
       when 'strasbourg' then 'Strasbourg' else 'Lyon' end as boutique,
  case type when 'anniversaire' then 'Anniversaire'
            when 'personnalisee' then 'Personnalisée'
            else 'Pro' end as type,
  statut,
  prenom || ' ' || nom as client,
  telephone,
  email,
  date_souhaitee,
  details ->> 'mode'          as anniv_formule,
  details ->> 'evenement'     as evenement,
  details ->> 'societe'       as societe,
  coalesce(details ->> 'nb_donuts', '') as nb_donuts,
  coalesce(details ->> 'nb_minis', '')  as nb_minis,
  message,
  source,
  utm_source,
  utm_campaign,
  email_envoye,
  details,
  id
from public.demandes
order by created_at desc;

revoke all on public.demandes_lisibles from anon, authenticated;
revoke all on public.demandes from anon, authenticated;

-- Stockage privé des images d'inspiration (5 Mo max, images uniquement)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('inspirations', 'inspirations', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do nothing;
