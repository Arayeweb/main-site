-- مسیریاب اسنپ و OpenStreetMap روی کارت ویزیت (/b/[slug])
alter table public.bizcards add column if not exists snap_url text;
alter table public.bizcards add column if not exists osm_url text;
