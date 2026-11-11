-- UltraShop: ejecutar una vez en el SQL Editor del proyecto que ya contiene
-- clientes, suscripciones, cuentas_maestras, productos y usuarios.
-- No elimina ni sustituye las tablas existentes. Repetir es seguro.
begin;
do $$
begin
 if to_regclass('public.clientes') is null or to_regclass('public.suscripciones') is null
 or to_regclass('public.cuentas_maestras') is null or to_regclass('public.productos') is null
 or to_regclass('public.usuarios') is null then
   raise exception 'Este SQL debe ejecutarse en la base existente de UltraShop. Faltan tablas del panel.';
 end if;
end $$;
create index if not exists ultrashop_sub_client_product_id_idx
  on public.suscripciones(cliente_id,lower(producto),id desc);
create table if not exists public.ultrashop_panel_state (
  id boolean primary key default true check(id), revision bigint not null default 0,
  catalog jsonb not null default '{}', settings jsonb not null default '{}',
  master_meta jsonb not null default '{}', client_meta jsonb not null default '{}',
  staff_meta jsonb not null default '{}', jobs jsonb not null default '[]'
);
create table if not exists public.ultrashop_panel_operations (
  id uuid primary key, fingerprint text not null, result jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.ultrashop_panel_state enable row level security;
alter table public.ultrashop_panel_operations enable row level security;
revoke all on public.ultrashop_panel_state, public.ultrashop_panel_operations from public, anon, authenticated;
grant all on public.ultrashop_panel_state, public.ultrashop_panel_operations to service_role;
insert into public.ultrashop_panel_state(id,catalog)
select true, coalesce(jsonb_object_agg(lower(nombre),jsonb_build_object('name',coalesce('{"chatgpt":"ChatGPT","gemini":"Gemini","capcut":"CapCut","claude":"Claude","perplexity":"Perplexity","superprompt":"Superprompt","codex":"Codex"}'::jsonb->>lower(nombre),nombre),'hidden',false,'position',id)), '{}')
from public.productos on conflict(id) do nothing;

create or replace function public.ultrashop_panel_snapshot() returns jsonb
language sql stable security invoker set search_path = '' as $$
select jsonb_build_object('version',1,'state',to_jsonb(st),
 'clients',coalesce((select jsonb_agg(to_jsonb(c)-'password_hash' order by c.id desc) from public.clientes c),'[]'),
 'subscriptions',coalesce((select jsonb_agg(to_jsonb(s) order by s.id desc) from public.suscripciones s),'[]'),
 'accounts',coalesce((select jsonb_agg(to_jsonb(m) order by m.id) from public.cuentas_maestras m),'[]'),
 'products',coalesce((select jsonb_agg(to_jsonb(p) order by p.id) from public.productos p),'[]'),
 'staff',coalesce((select jsonb_agg(to_jsonb(u)-'password' order by u.id) from public.usuarios u),'[]'))
from public.ultrashop_panel_state st where id=true;
$$;

create or replace function public.ultrashop_panel_action(operation_id uuid, expected_revision bigint, command text, payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 st public.ultrashop_panel_state%rowtype;
 prior public.ultrashop_panel_operations%rowtype;
 cid bigint; mid bigint; pid bigint; sid bigint; uid text;
 prod text; entry jsonb; meta jsonb; job jsonb; jobs jsonb; item jsonb;
 ending timestamptz; starting timestamptz; days integer; result jsonb;
 fingerprint text := md5(command || (case when coalesce((payload->>'relativePeriod')::boolean,false) then payload-'startDate'-'endDate' else payload end)::text);
 nonce uuid := gen_random_uuid();
 ids jsonb; pending jsonb; taken integer; skipped integer; job_index integer;
begin
 select * into st from public.ultrashop_panel_state where id=true for update;
 select * into prior from public.ultrashop_panel_operations where id=operation_id;
 if found then
   if prior.fingerprint <> fingerprint then raise exception 'Identificador de operación reutilizado'; end if;
   return prior.result;
 end if;
 if expected_revision is distinct from st.revision and command<>'staff.access' then
   raise exception 'Los datos cambiaron en otra sesión. Actualiza y revisa antes de guardar.' using errcode='40001';
 end if;
 prod := lower(payload->>'product');
 cid := nullif(payload->>'clientId','')::bigint;
 mid := nullif(payload->>'masterId','')::bigint;
 uid := nullif(payload->>'staffId','');
 if prod is not null then select id into pid from public.productos where lower(nombre)=prod limit 1; end if;
 if command in ('client.create','client.assign','bulk.create') then
   if mid is null or not exists(select 1 from public.cuentas_maestras where id=mid and producto_id=pid and lower(estado) in ('activa','disponible')) then
     raise exception 'La cuenta elegida no está activa o no corresponde a esta licencia';
   end if;
   meta := coalesce(st.master_meta->mid::text,'{}');
   if (meta->>'endDate')::date < current_date or (meta->>'startDate')::date > current_date then
     raise exception 'La cuenta elegida está fuera de vigencia';
   end if;
 end if;
 if command like 'client.%' and command <> 'client.create' then
   perform 1 from public.clientes where id=cid;
   if not found then raise exception 'El cliente ya no existe'; end if;
   select id into sid from public.suscripciones where cliente_id=cid and lower(producto)=prod order by id desc limit 1;
   if sid is null then raise exception 'La suscripción ya no existe'; end if;
 end if;
 if command = 'catalog.import' then
   if st.revision<>0 then raise exception 'El catálogo ya fue inicializado'; end if;
   for item in select value from jsonb_array_elements(payload->'entries') loop
     prod:=lower(item->>'product');
     select id into pid from public.productos where lower(nombre)=prod limit 1;
     if pid is null then insert into public.productos(nombre) values(prod) returning id into pid; end if;
     st.catalog:=jsonb_set(st.catalog,array[prod],jsonb_build_object('name',item->>'name','color',item->>'color','position',item->'position','hidden',false));
   end loop;
   for item in select value from jsonb_array_elements(coalesce(payload->'removed','[]')) loop
     prod:=item#>>'{}';if st.catalog ? prod then st.catalog:=jsonb_set(st.catalog,array[prod,'hidden'],'true');end if;
   end loop;
 elsif command = 'client.create' then
   if trim(coalesce(payload->>'username',''))='' or coalesce(payload->>'password','')='' then raise exception 'Usuario y contraseña requeridos'; end if;
   insert into public.clientes(usuario,password_hash,email,telefono,nombre_completo,estado)
   values(trim(payload->>'username'),payload->>'password',trim(payload->>'username'),payload->>'phone',trim(payload->>'username'),'activo') returning id into cid;
   ending := (payload->>'endDate')::timestamptz;
   starting := coalesce((payload->>'startDate')::timestamptz,now());
   days := greatest(1,(payload->>'total')::integer);
   if ending is null or ending<=starting then raise exception 'Duración inválida'; end if;
   insert into public.suscripciones(cliente_id,producto,estado,fecha_vencimiento,dias_restantes,dias_totales,cuenta_asignada_id,cuenta_maestra_id,activo)
   values(cid,prod,'activa',ending::date,greatest(0,ceil(extract(epoch from ending-now())/86400)::integer),days,mid,mid,true) returning id into sid;
   st.client_meta := jsonb_set(st.client_meta,array[sid::text],jsonb_build_object('startDate',starting,'endDate',ending,'isTrial',coalesce((payload->>'isTrial')::boolean,false),'creator',payload->>'creator'));
 elsif command in ('client.edit','client.renew') then
   if payload ? 'username' then
     if trim(payload->>'username')='' then raise exception 'El usuario no puede quedar vacío'; end if;
     update public.clientes set usuario=trim(payload->>'username'),email=trim(payload->>'username') where id=cid;
   end if;
   if payload ? 'phone' then update public.clientes set telefono=payload->>'phone' where id=cid; end if;
   if payload ? 'endDate' then
     ending := (payload->>'endDate')::timestamptz;
     starting := coalesce((payload->>'startDate')::timestamptz,now());
     if ending is null then raise exception 'Fecha final requerida'; end if;
     days := greatest(0,coalesce((payload->>'total')::integer,ceil(extract(epoch from ending-starting)/86400)::integer));
     update public.suscripciones set fecha_vencimiento=ending::date,dias_totales=days,
       dias_restantes=greatest(0,ceil(extract(epoch from ending-now())/86400)::integer),
       estado=case when ending>now() then 'activa' else 'vencida' end,activo=ending>now() where id=sid;
     st.client_meta := jsonb_set(st.client_meta,array[sid::text],coalesce(st.client_meta->sid::text,'{}') || jsonb_build_object('startDate',starting,'endDate',ending,'isTrial',coalesce((payload->>'isTrial')::boolean,false)));
   end if;
   if command='client.renew' then update public.clientes set estado='activo' where id=cid; end if;
 elsif command='client.status' then
   update public.clientes set estado=case when (payload->>'active')::boolean then 'activo' else 'suspendido' end,
     revoke_nonce=nonce,revoke_nonce_gpt=case when command='client.status' or prod<>'gemini' then nonce else revoke_nonce_gpt end,revoke_nonce_gemini=case when command='client.status' or prod='gemini' then nonce else revoke_nonce_gemini end where id=cid;
 elsif command='client.signout' then
   update public.clientes set revoke_nonce=nonce,revoke_nonce_gpt=case when command='client.status' or prod<>'gemini' then nonce else revoke_nonce_gpt end,revoke_nonce_gemini=case when command='client.status' or prod='gemini' then nonce else revoke_nonce_gemini end where id=cid;
 elsif command='client.delete' then
   -- The panel's confirmation deletes the subscription in this license only.
   delete from public.suscripciones where cliente_id=cid and lower(producto)=prod;
   st.client_meta := st.client_meta - sid::text;
   update public.clientes set revoke_nonce=nonce,revoke_nonce_gpt=case when command='client.status' or prod<>'gemini' then nonce else revoke_nonce_gpt end,revoke_nonce_gemini=case when command='client.status' or prod='gemini' then nonce else revoke_nonce_gemini end where id=cid;
 elsif command='client.assign' then
   update public.suscripciones set cuenta_asignada_id=mid,cuenta_maestra_id=mid where id=sid;
   update public.clientes set migration_nonce=nonce,migration_nonce_gpt=case when prod<>'gemini' then nonce else migration_nonce_gpt end,migration_nonce_gemini=case when prod='gemini' then nonce else migration_nonce_gemini end where id=cid;
 elsif command='master.save' then
   if pid is null then raise exception 'La licencia no existe'; end if;
   if trim(coalesce(payload->>'email',''))='' or coalesce(payload->>'password','')='' then raise exception 'Usuario y contraseña requeridos'; end if;
   if mid is null then
     insert into public.cuentas_maestras(producto_id,email,password,totp_seed,notas,estado)
     values(pid,trim(payload->>'email'),payload->>'password',nullif(payload->>'seed',''),payload->>'note','activa') returning id into mid;
   else
     update public.cuentas_maestras set email=trim(payload->>'email'),password=payload->>'password',totp_seed=nullif(payload->>'seed',''),notas=payload->>'note' where id=mid and producto_id=pid;
     if not found then raise exception 'La cuenta ya no existe'; end if;
   end if;
   if (payload->>'endDate')::date<(payload->>'startDate')::date then raise exception 'Vigencia inválida'; end if;
   st.master_meta := jsonb_set(st.master_meta,array[mid::text],jsonb_build_object('startDate',payload->>'startDate','endDate',payload->>'endDate','duration',payload->>'duration'));
 elsif command='master.delete' then
   if mid is null or pid is null then raise exception 'Cuenta y licencia requeridas'; end if;
   -- Serialize the reference check with subscription writers, including the legacy API.
   lock table public.suscripciones in share row exclusive mode;
   perform 1 from public.cuentas_maestras where id=mid and producto_id=pid for update;
   if not found then raise exception 'La cuenta ya no existe o no corresponde a esta licencia'; end if;
   if exists(select 1 from public.suscripciones where cuenta_asignada_id=mid or cuenta_maestra_id=mid) then
     raise exception 'Esta cuenta tiene suscripciones vinculadas. Migra o retira esos accesos antes de eliminarla.';
   end if;
   if exists(select 1 from jsonb_array_elements(st.jobs) j
     where j->>'masterId'=mid::text and coalesce(j->>'status','running') not in ('completed','cancelled')) then
     raise exception 'Esta cuenta tiene una migración pendiente. Cancela o completa la migración antes de eliminarla.';
   end if;
   delete from public.cuentas_maestras where id=mid and producto_id=pid;
   st.master_meta := st.master_meta - mid::text;
 elsif command='master.status' then
   update public.cuentas_maestras set estado=case when (payload->>'active')::boolean then 'activa' else 'Baneada' end where id=mid;
   if not found then raise exception 'La cuenta ya no existe'; end if;
 elsif command='license.save' then
   if trim(coalesce(payload->>'name',''))='' then raise exception 'Nombre requerido'; end if;
   if exists(select 1 from jsonb_each(st.catalog) e where e.key<>prod and lower(e.value->>'name')=lower(trim(payload->>'name')) and not coalesce((e.value->>'hidden')::boolean,false)) then raise exception 'Esa licencia ya existe'; end if;
   if pid is null then insert into public.productos(nombre) values(prod) returning id into pid; end if;
   st.catalog := jsonb_set(st.catalog,array[prod],coalesce(st.catalog->prod,'{}') || jsonb_build_object('name',trim(payload->>'name'),'color',payload->>'color','hidden',false,'position',coalesce(st.catalog->prod->'position',to_jsonb(pid))));
 elsif command='license.delete' then
   if (select count(*) from jsonb_each(st.catalog) e where not coalesce((e.value->>'hidden')::boolean,false))<=1 then raise exception 'Debe quedar al menos una licencia'; end if;
   if not st.catalog ? prod then raise exception 'La licencia ya no existe'; end if;
   st.catalog := jsonb_set(st.catalog,array[prod,'hidden'],'true');
 elsif command='license.order' then
   for entry in select value from jsonb_array_elements(payload->'products') loop
     if st.catalog ? (entry#>>'{}') then
       st.catalog := jsonb_set(st.catalog,array[entry#>>'{}','position'],to_jsonb(coalesce(job_index,0)));
       job_index := coalesce(job_index,0)+1;
     end if;
   end loop;
 elsif command='staff.access' then
   perform 1 from public.usuarios where id::text=uid;
   if not found or coalesce((st.staff_meta->uid->>'active')::boolean,true)=false then raise exception 'Acceso no disponible';end if;
   st.staff_meta:=jsonb_set(st.staff_meta,array[uid],coalesce(st.staff_meta->uid,'{}') || jsonb_build_object('lastAccess',now()));
 elsif command in ('staff.save','profile.save') then
   if trim(coalesce(payload->>'username',''))='' then raise exception 'Usuario requerido'; end if;
   if exists(select 1 from public.usuarios where lower(regexp_replace(username,'\s','','g'))=lower(regexp_replace(payload->>'username','\s','','g')) and (uid is null or id::text<>uid)) then raise exception 'Ese usuario ya existe'; end if;
   if uid is null then
     if coalesce(payload->>'password','')='' then raise exception 'Contraseña requerida'; end if;
     insert into public.usuarios(username,password,nombre_completo,rol) values(payload->>'username',payload->>'password',coalesce(payload->>'displayName',payload->>'username'),payload->>'role') returning id::text into uid;
   else
     update public.usuarios set username=payload->>'username',nombre_completo=coalesce(payload->>'displayName',nombre_completo),rol=coalesce(payload->>'role',rol),password=coalesce(nullif(payload->>'password',''),password) where id::text=uid;
     if not found then raise exception 'El usuario ya no existe'; end if;
   end if;
   meta := coalesce(st.staff_meta->uid::text,jsonb_build_object('active',true));
   if payload ? 'licenses' then meta:=meta || jsonb_build_object('licenses',payload->'licenses'); end if;
   st.staff_meta := jsonb_set(st.staff_meta,array[uid::text],meta);
 elsif command in ('staff.status','staff.delete') then
   if uid::text=payload->>'actorId' then raise exception 'No puedes suspenderte ni eliminarte'; end if;
   perform 1 from public.usuarios where id::text=uid;
   if not found then raise exception 'El usuario ya no existe'; end if;
   if command='staff.delete' then
     delete from public.usuarios where id::text=uid;
     st.staff_meta := st.staff_meta - uid::text;
   else
     st.staff_meta := jsonb_set(st.staff_meta,array[uid::text],coalesce(st.staff_meta->uid::text,'{}') || jsonb_build_object('active',(payload->>'active')::boolean));
   end if;
 elsif command='preference.save' then
   st.settings:=jsonb_set(st.settings,array['theme:' || (payload->>'userId')],to_jsonb(payload->>'theme'));
 elsif command='settings.save' then
   st.settings := st.settings || payload;
 elsif command='bulk.create' then
   if exists(select 1 from jsonb_array_elements(st.jobs) j where j->>'product'=prod and j->>'status' in ('running','paused')) then raise exception 'Ya hay una cola activa'; end if;
   if jsonb_array_length(payload->'clientIds')=0 then raise exception 'Selecciona clientes'; end if;
   job:=jsonb_build_object('id',payload->>'id','product',prod,'masterId',mid,'mode',payload->>'mode','ownerId',payload->>'ownerId','pendingIds',payload->'clientIds','total',jsonb_array_length(payload->'clientIds'),'migrated',0,'skipped',0,'status','running','nextRunAt',floor(extract(epoch from now())*1000),'createdAt',floor(extract(epoch from now())*1000));
   st.jobs:=st.jobs || jsonb_build_array(job);
 elsif command in ('bulk.run','bulk.pause','bulk.resume','bulk.cancel') then
   if not exists(select 1 from jsonb_array_elements(st.jobs) j where j->>'id'=payload->>'id' and j->>'status' in ('running','paused')) then raise exception 'La cola ya finalizó o no existe';end if;
   jobs:='[]';
   for job in select value from jsonb_array_elements(st.jobs) loop
     if job->>'id'=payload->>'id' then
       if command='bulk.pause' then job:=job || jsonb_build_object('status','paused','remainingMs',greatest(0,(job->>'nextRunAt')::numeric-extract(epoch from now())*1000));
       elsif command='bulk.cancel' then job:=job || jsonb_build_object('status','cancelled','nextRunAt',null);
       elsif command='bulk.resume' then job:=job || jsonb_build_object('status','running','nextRunAt',floor(extract(epoch from now())*1000)+coalesce((job->>'remainingMs')::numeric,0));
       elsif job->>'status'='running' and (job->>'nextRunAt')::numeric<=extract(epoch from now())*1000 then
         mid:=(job->>'masterId')::bigint; prod:=job->>'product';
         if not exists(select 1 from public.cuentas_maestras m join public.productos p on p.id=m.producto_id where m.id=mid and lower(p.nombre)=prod and lower(m.estado) in ('activa','disponible')) then job:=job || jsonb_build_object('status','paused','reason','Destino de la cola no disponible');jobs:=jobs || jsonb_build_array(job);continue;end if;
         meta:=coalesce(st.master_meta->mid::text,'{}');
         if (meta->>'endDate')::date<current_date or (meta->>'startDate')::date>current_date then job:=job || jsonb_build_object('status','paused','reason','Destino de la cola fuera de vigencia');jobs:=jobs || jsonb_build_array(job);continue;end if;
         pending:='[]';taken:=0;skipped:=0;
         for item in select value from jsonb_array_elements(job->'pendingIds') loop
           if job->>'mode'='timer' and taken>=5 then pending:=pending || jsonb_build_array(item); continue; end if;
           cid:=(item#>>'{}')::bigint;
           update public.suscripciones set cuenta_asignada_id=mid,cuenta_maestra_id=mid where cliente_id=cid and lower(producto)=prod and cuenta_asignada_id is distinct from mid;
           if found then
             update public.clientes set migration_nonce=nonce,migration_nonce_gpt=case when prod<>'gemini' then nonce else migration_nonce_gpt end,migration_nonce_gemini=case when prod='gemini' then nonce else migration_nonce_gemini end where id=cid;
             taken:=taken+1;
           else skipped:=skipped+1; end if;
         end loop;
         job:=job || jsonb_build_object('pendingIds',pending,'migrated',(job->>'migrated')::integer+taken,'skipped',(job->>'skipped')::integer+skipped,'status',case when jsonb_array_length(pending)=0 then 'completed' else 'running' end,'nextRunAt',floor(extract(epoch from now()+interval '20 minutes')*1000));
       end if;
     end if;
     jobs:=jobs || jsonb_build_array(job);
   end loop;
   st.jobs:=jobs;
 else raise exception 'Acción desconocida: %', command;
 end if;
 st.revision:=st.revision+1;
 update public.ultrashop_panel_state set revision=st.revision,catalog=st.catalog,settings=st.settings,master_meta=st.master_meta,client_meta=st.client_meta,staff_meta=st.staff_meta,jobs=st.jobs where id=true;
 result:=jsonb_build_object('success',true,'revision',st.revision,'clientId',cid,'masterId',mid,'staffId',uid);
 insert into public.ultrashop_panel_operations(id,fingerprint,result) values(operation_id,fingerprint,result);
 return result;
end;
$$;
create or replace function public.ultrashop_access_window(kind text, record_id bigint) returns jsonb
language sql stable security invoker set search_path = '' as $$
 select case when kind='subscription' then client_meta->record_id::text
             when kind='master' then master_meta->record_id::text end
 from public.ultrashop_panel_state where id=true;
$$;
revoke all on function public.ultrashop_access_window(text,bigint) from public,anon,authenticated;
grant execute on function public.ultrashop_access_window(text,bigint) to service_role;
revoke all on function public.ultrashop_panel_snapshot() from public,anon,authenticated;
revoke all on function public.ultrashop_panel_action(uuid,bigint,text,jsonb) from public,anon,authenticated;
grant execute on function public.ultrashop_panel_snapshot() to service_role;
grant execute on function public.ultrashop_panel_action(uuid,bigint,text,jsonb) to service_role;
commit;
