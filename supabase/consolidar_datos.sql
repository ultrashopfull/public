-- ============================================================
-- UltraShop / GPT Asistente
-- Unifica los registros creados en las tablas NUEVAS hacia las
-- tablas ANTIGUAS que lee la extension (clientes, suscripciones,
-- cuentas_maestras, productos, pagos, logs_acceso).
-- Ejecutar UNA vez en el SQL Editor de Supabase.
-- ============================================================

BEGIN;

-- 1) Normalizar estados de cuentas maestras al valor que usa el login
UPDATE public.cuentas_maestras SET estado = 'activa' WHERE lower(estado) IN ('disponible','active');
UPDATE public.cuentas_maestras SET estado = 'baneada' WHERE lower(estado) IN ('baneada','banned');

-- 2) Crear productos que solo existen como licenses
INSERT INTO public.productos (nombre)
SELECT DISTINCT lower(l.name)
FROM public.licenses l
WHERE NOT EXISTS (
  SELECT 1 FROM public.productos p WHERE lower(p.nombre) = lower(l.name)
);

-- 3) clients -> clientes
INSERT INTO public.clientes
  (usuario, password_hash, email, telefono, nombre_completo, estado,
   creado_en, actualizado_en, device_id, device_label, device_last_seen,
   revoke_nonce, migration_nonce)
SELECT
  c.username, c.password, c.email, c.phone, c.full_name,
  CASE c.status
    WHEN 'active' THEN 'activo'
    WHEN 'expired' THEN 'vencido'
    WHEN 'suspended' THEN 'suspendido'
    WHEN 'cancelled' THEN 'cancelado'
    ELSE 'activo'
  END,
  c.created_at, c.updated_at, c.device_id, c.device_label, c.device_last_seen,
  c.revoke_nonce, c.migration_nonce
FROM public.clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.clientes x WHERE x.usuario = c.username
);

-- 4) master_accounts -> cuentas_maestras
INSERT INTO public.cuentas_maestras
  (producto_id, email, password, totp_seed, estado, fecha_alta, notas)
SELECT
  p.id, m.email, m.password, m.totp_seed,
  CASE m.status WHEN 'active' THEN 'activa' WHEN 'banned' THEN 'baneada' ELSE 'activa' END,
  m.created_at, m.notes
FROM public.master_accounts m
JOIN public.licenses l ON l.id = m.license_id
JOIN public.productos p ON lower(p.nombre) = lower(l.name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.cuentas_maestras x
  WHERE x.email = m.email AND x.producto_id = p.id
);

-- 5) client_licenses -> suscripciones
INSERT INTO public.suscripciones
  (cliente_id, cuenta_asignada_id, cuenta_maestra_id, producto, estado,
   dias_restantes, dias_totales, activo, fecha_creacion, fecha_vencimiento)
SELECT
  cli.id,
  cm.id,
  cm.id,
  lower(l.name),
  CASE cl.status
    WHEN 'active' THEN 'activa'
    WHEN 'expired' THEN 'vencida'
    WHEN 'suspended' THEN 'cancelada'
    WHEN 'cancelled' THEN 'cancelada'
    ELSE 'activa'
  END,
  GREATEST(0, (cl.expires_at - CURRENT_DATE)),
  COALESCE(cl.duration_days, 30),
  (cl.status = 'active' AND cl.expires_at >= CURRENT_DATE),
  cl.created_at,
  cl.expires_at
FROM public.client_licenses cl
JOIN public.clients c ON c.id = cl.client_id
JOIN public.clientes cli ON cli.usuario = c.username
JOIN public.licenses l ON l.id = cl.license_id
LEFT JOIN public.master_accounts m ON m.id = cl.master_id
LEFT JOIN public.cuentas_maestras cm ON cm.email = m.email
WHERE NOT EXISTS (
  SELECT 1 FROM public.suscripciones s
  WHERE s.cliente_id = cli.id AND lower(s.producto) = lower(l.name)
);

-- 6) payments -> pagos
INSERT INTO public.pagos
  (cliente_id, monto, moneda, metodo, referencia, fecha_pago, notas)
SELECT
  cli.id,
  p.amount,
  COALESCE(p.currency, 'BOB'),
  CASE lower(COALESCE(p.method, 'efectivo'))
    WHEN 'efectivo' THEN 'efectivo'
    WHEN 'transferencia' THEN 'transferencia'
    WHEN 'qr' THEN 'qr'
    ELSE 'otro'
  END,
  p.reference,
  p.created_at,
  p.notes
FROM public.payments p
JOIN public.clients c ON c.id = p.client_id
JOIN public.clientes cli ON cli.usuario = c.username
WHERE NOT EXISTS (
  SELECT 1 FROM public.pagos x
  WHERE x.cliente_id = cli.id
    AND x.fecha_pago = p.created_at
    AND x.monto = p.amount
);

-- 7) activity_logs -> logs_acceso  (opcional, historial)
INSERT INTO public.logs_acceso
  (cliente_id, accion, resultado, ip, user_agent, fecha)
SELECT
  cli.id,
  CASE lower(COALESCE(al.action, 'verificacion'))
    WHEN 'login' THEN 'login'
    WHEN 'logout' THEN 'logout'
    WHEN 'revoke' THEN 'revocacion'
    WHEN 'revocacion' THEN 'revocacion'
    WHEN 'migration' THEN 'migracion'
    WHEN 'migracion' THEN 'migracion'
    ELSE 'verificacion'
  END,
  CASE lower(COALESCE(al.result, 'exitoso'))
    WHEN 'success' THEN 'exitoso'
    WHEN 'failed' THEN 'fallido'
    WHEN 'blocked' THEN 'bloqueado'
    ELSE 'exitoso'
  END,
  al.ip, al.user_agent, al.created_at
FROM public.activity_logs al
JOIN public.clients c ON c.id = al.client_id
JOIN public.clientes cli ON cli.usuario = c.username
WHERE NOT EXISTS (
  SELECT 1 FROM public.logs_acceso x
  WHERE x.cliente_id = cli.id
    AND x.fecha = al.created_at
    AND x.accion = al.action
);

-- 8) Normalizar productos y vencimientos en suscripciones
UPDATE public.suscripciones
SET producto = lower(producto)
WHERE producto IS NOT NULL AND producto <> lower(producto);

UPDATE public.suscripciones
SET dias_restantes = GREATEST(0, (fecha_vencimiento - CURRENT_DATE)),
    estado = CASE WHEN fecha_vencimiento < CURRENT_DATE THEN 'vencida' ELSE estado END,
    activo = CASE WHEN fecha_vencimiento < CURRENT_DATE THEN false ELSE activo END
WHERE fecha_vencimiento IS NOT NULL;

COMMIT;

-- Verificacion rapida
-- SELECT usuario, estado FROM public.clientes ORDER BY id DESC LIMIT 10;
-- SELECT cliente_id, producto, estado, fecha_vencimiento FROM public.suscripciones ORDER BY id DESC LIMIT 10;
-- SELECT id, email, estado FROM public.cuentas_maestras ORDER BY id DESC LIMIT 10;