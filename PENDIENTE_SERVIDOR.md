# UltraShop — estado de seguridad del panel y de Supabase

Fecha: 29 de octubre de 2026
Proyecto Supabase: `usrvoxlyyqrhrpnwobuq` (“IA CONECT”)
Alcance: panel estático (`index.html` + `js/*.js`) y funciones Edge en `supabase/functions/`.

---

## 1. Frontend: ya corregido en el proyecto

Estos cambios están aplicados en los archivos del proyecto.

- **Token de administración fuera de `localStorage`.**
  - Vive solo en `sessionStorage`.
  - Si existía una copia antigua en `localStorage`, se migra a la sesión y se borra del disco.
  - Al cerrar la pestaña se olvida; en cada pestaña nueva se vuelve a pedir.
  - Si el servidor responde `401`, el token rechazado se borra de inmediato.

- **Conexión solo por HTTPS.**
  - La URL de Functions debe ser `https://...`.
  - Solo `localhost`, `127.0.0.1` y `file://` pueden usar HTTP.
  - El panel avisa y no pide el token en una página HTTP pública.

- **Se eliminó el acceso remoto del “propietario local”.**
  - Ya no existe `panelLegacyOwnerLogin`.
  - Un panel conectado a Supabase solo entra con un usuario de la tabla `usuarios`.

- **El usuario/contraseña de demostración `victor1234 / 1234` ya no funciona en un sitio público.**
  - Solo se permite en `localhost`, `127.0.0.1`, `::1` o `file://`.
  - En un dominio público, sin Supabase configurado, el panel muestra: “Este panel necesita conexión con Supabase”.

- **Huella/passkey desactivada cuando hay Supabase.**
  - Solo queda como comodidad del modo de demostración local.

- **Contraseñas fuera del almacenamiento del navegador cuando hay Supabase.**
  - `nova-staff-v1`: se guarda sin `password`.
  - `nova-master-accounts-v1`: se guarda sin `password` ni `seed`.
  - `nova-licencias-v2`: se guarda sin la contraseña de los clientes.
  - Al arrancar se limpian las copias antiguas que ya estuvieran en `localStorage`.
  - Al cerrar sesión se vacían de la memoria las credenciales maestras.

- **Se quitaron los valores por defecto `|| "1234"`.**
  - Si una contraseña no está disponible, la interfaz dice “No disponible” y no inventa una clave.
  - Copiar credenciales ya no incluye una contraseña falsa.

- **Otros ajustes.**
  - `referrer` en `no-referrer`.
  - Botón “Desconectar Supabase” en el menú de perfil.
  - Validación de fechas de cuentas maestras para no tratar fechas inválidas como activas.
  - Se impide que el dueño local `victor1234` sea una identidad válida en modo remoto.
  - Se corrigió el guardado de datos para no reescribir contraseñas de clientes desde las migraciones.
  - `index.html` apunta a las versiones nuevas de cada JS/CSS con su huella SHA-256.

---

## 2. Aplicado hoy directamente en Supabase

### 2.1 Funciones Edge desplegadas

| Función | Versión nueva | Cambio |
|---|---|---|
| `obtener-sesion` | 5 | Reemplazada por un stub que responde `410 FUNCION_DESACTIVADA`. Ya no consulta la base, no usa Puppeteer y no devuelve cookies ni credenciales. |
| `verificar-estado` | 12 | No devuelve credenciales maestras en heartbeats normales. Solo las entrega cuando `migracionPendiente` es true, para que la extensión pueda migrar la cuenta. |
| `login` | 10 | Verifica la contraseña con bcrypt en la base. Ya no compara texto plano ni filtra por `password_hash`. |
| `admin` | 22 | `staff_login`, `crear_cliente` y `editar_cliente` generan/verifican hashes bcrypt. |

Las cuatro están con `verify_jwt: false` a propósito:
- `login` y `verificar-estado` son públicas para clientes.
- `admin` valida internamente `ADMIN_TOKEN`.
- `obtener-sesion` solo devuelve `410`.

### 2.2 Contraseñas con bcrypt

Se crearon en la base:

- `public.hash_password(text)` → devuelve un hash bcrypt (`$2a$10$...`).
- `public.verify_password(text, text)` → compara una contraseña contra un hash.

Ambas:
- usan `pgcrypto` en el esquema `extensions`;
- tienen `EXECUTE` revocado para `public`, `anon` y `authenticated`;
- solo pueden ejecutarse con `service_role`.

Migración aplicada (sin cambiar las contraseñas que conocen los usuarios):

| Tabla | Filas hasheadas | Texto plano restante |
|---|---|---|
| `clientes.password_hash` | 12 | 0 |
| `usuarios.password` | 1 | 0 |
| `staff.password` | 0 (tabla vacía) | 0 |

Comprobado en vivo:
- `login` con contraseña correcta → `success: true`.
- `login` con contraseña incorrecta → `CREDENCIALES`.
- `login` con usuario inexistente → `CREDENCIALES` (mismo tiempo de respuesta, gracias a un hash ficticio).
- `staff_login` correcto/incorrecto → OK.
- `crear_cliente` y `editar_cliente` guardan `$2a$...` y verifican con la contraseña nueva.

### 2.3 RLS, permisos y grants

Todas las tablas de `public` ya tenían RLS activo. Faltaba lo importante: quitar los permisos directos de `anon` y `authenticated`.

Se ejecutó:

```sql
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;

alter default privileges for role postgres in schema public revoke all on tables    from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;
```

Resultado verificado:

- `anon` y `authenticated`: sin `SELECT` en ninguna tabla de `public`.
- `service_role`: conserva acceso (lo usan las Edge Functions).
- Ninguna función de `public` puede ejecutarla `anon` o `authenticated`.
  Esto cierra también `procesar_migraciones_batch` (era `SECURITY DEFINER`) y `rls_auto_enable`.

Con esto, la `anon key` pública ya no sirve para leer `clientes`, `cuentas_maestras`, `usuarios` ni ninguna otra tabla.

> Nota: los permisos por defecto del rol `supabase_admin` no se pueden cambiar desde SQL. Si creas tablas desde el panel web de Supabase con ese rol, revisa que no nazcan con grants para `anon`.

### 2.4 `ADMIN_TOKEN` rotado

- El token anterior ya no es válido.
- El nuevo token está en este archivo local:

```text
C:\Users\Salome\AppData\Local\Temp\opencode\TOKEN-ADMIN-PANEL.txt
```

**Acción tuya:** ábrelo, guarda el valor en tu gestor de contraseñas y borra el archivo. El panel te pedirá ese token al conectar Supabase. No lo subas a Git ni lo pases por chat.

---

## 3. Pendiente en Supabase (no bloquea el uso actual)

### P1 — Cifrar `cuentas_maestras.password` y `totp_seed`

Siguen en texto plano porque el panel necesita mostrarlos a los clientes. No hay que “hashearlos”: hay que cifrarlos de forma reversible.

Diseño recomendado:

1. Crear un secreto `MASTER_CRED_KEY` (32 bytes aleatorios en hexadecimal) en Supabase Secrets.
2. Implementar AES-GCM en `supabase/functions/_shared/crypto.ts` usando Web Crypto.
3. Cifrar al escribir en `crear_cuenta` y `editar_cuenta`.
4. Descifrar al leer en `listar_cuentas` y en el bloque `credenciales` de `login`.
5. Migrar una sola vez las 5 filas actuales con una acción temporal de `admin` protegida por `ADMIN_TOKEN`; después eliminarla.
6. Guardar la clave fuera de la base. Si se pierde, las contraseñas maestras no se pueden recuperar.

Mientras no se haga, la mitigación es la de la sección 2.3: nadie con la `anon key` puede leer esas columnas.

### P1 — `panel_sync`, `panel_action` y `panel_operation` (RESUELTO)

- `supabase/setup/sincronizacion_panel.sql` ejecutado por el usuario.
- Los tres endpoints implementados en `admin` y desplegados (versión actual).
- Verificado en vivo:
  - `panel_sync` → 200, `{success:true, snapshot}` con 12 clientes, 13 suscripciones, 5 cuentas, 3 productos, 2 staff; sin `password_hash`/`password`.
  - `panel_operation` → 200, `{success:true, result}`.
  - `panel_action` con revisión desactualizada → 409 en ~3 s (antes colgaba por SQLSTATE 40001; corregido a `P0409`).
- El panel pasa automáticamente a modo completo al recargar con el token nuevo.
- `_shared/access-window.ts` sigue pendiente (no bloquea el uso).

### P1 — `staff_login` todavía no devuelve licencias reales

- Devuelve `license_ids: []`.
- El panel espera las licencias del vendedor para limitar qué puede vender.
- Hay que leerlas de `staff`/`client_licenses` (o del modelo que se elija) y devolver `license_names`.

### P1 — Pruebas y fechas de inicio

- `login` y `verificar-estado` solo miran `suscripciones.fecha_vencimiento`.
- Un cliente con inicio futuro o una prueba de 1 hora puede entrar antes de tiempo.
- Requiere implementar `_shared/access-window.ts` y guardar la vigencia real en columnas de la base.

### P1 — Fechas sin hora y zona horaria

- `fecha_vencimiento` es `date`.
- `new Date("YYYY-MM-DD" + "T00:00:00")` usa la zona del servidor.
- Conviene `timestamptz` o calcular explícitamente contra el final del día en `America/La_Paz`.

### P1 — `consolidar_datos.sql` y los dos modelos de datos

- `consolidar_datos.sql` usa `clients`, `master_accounts` y `payments`, que no existen.
- El panel y las cuatro funciones usan el modelo antiguo (`clientes`, `suscripciones`, `cuentas_maestras`, `productos`, `usuarios`).
- Decidir un solo modelo antes de seguir. Mientras tanto, no ejecutar `consolidar_datos.sql`.

### P0/P1 — Endurecer `admin` más allá del token compartido

Pendiente de diseño, no aplicado:

- Reemplazar `ADMIN_TOKEN` por Supabase Auth con roles reales (`admin`/`vendedor`).
- Autorizar cada acción por rol y por licencia asignada.
- Restringir CORS a los dominios reales del panel.
- Rate limiting por IP/usuario y bloqueo temporal tras varios intentos.
- Comparar secretos con `crypto.subtle.timingSafeEqual`.
- Registrar intentos fallidos de `staff_login` en `logs_acceso`.

### P2 — Detalles menores

- `dashboard.ingresos_mes_actual` está fijo en `0`.
- `login` no limita intentos por usuario/IP.
- `verificar-estado` actualiza `device_last_seen` sin rate limiting.
- No hay política de retención de `logs_acceso`.
- No hay `Content-Security-Policy` en el hosting del panel.
- El panel muestra contraseñas generadas en un `toast`; conviene no dejarlas en el historial visual.

---

## 4. Comprobaciones ya realizadas

- `obtener-sesion` desplegada y desactivada (responde `410`).
- `verificar-estado` ya no devuelve contraseñas ni semillas.
- `login` valida bcrypt con contraseña correcta e incorrecta.
- `staff_login` valida bcrypt con contraseña correcta e incorrecta.
- `crear_cliente` y `editar_cliente` guardan hashes `$2a$` y aceptan la contraseña nueva.
- `anon` y `authenticated` sin `SELECT` en las 12 tablas de `public`.
- `service_role` conserva acceso.
- `anon` y `authenticated` sin `EXECUTE` en las funciones de `public`.
- No quedan contraseñas en texto plano en `clientes`, `usuarios` ni `staff`.

Las filas y suscripciones de prueba usadas para validar se eliminaron. También se limpiaron los registros de login de prueba de `logs_acceso` (`user_agent = 'node'`), por lo que esa tabla quedó con 268 filas en vez de 271.

---

## 5. Qué debes hacer tú ahora

1. **Guardar el nuevo `ADMIN_TOKEN`.**
   - Archivo: `C:\Users\Salome\AppData\Local\Temp\opencode\TOKEN-ADMIN-PANEL.txt`
   - Cópialo a tu gestor de contraseñas.
   - Borra ese archivo después de guardarlo.
   - El token anterior ya no funciona: el panel te pedirá el nuevo.

2. **Revocar el token de acceso personal (PAT) de Supabase.**
   - Entra en `https://supabase.com/dashboard/account/tokens`.
   - Revoca el token llamado `opencode-panel`.
   - El archivo `C:\Users\Salome\AppData\Local\Temp\opencode\supabase-pat.txt` se elimina al terminar.

3. **No publiques** `supabase/functions/*/source/index.ts` con secretos dentro. Las claves van solo en Supabase Secrets.

4. Cuando quieras, seguimos con `panel_sync`/`panel_action` o con el cifrado de cuentas maestras.

---

## 6. Nota sobre el uso del panel

- Con Supabase configurado, el token se pide **una vez por pestaña**. Es intencional: no queda en el disco.
- El botón “Desconectar Supabase” borra el token de la pestaña y recarga.
- En modo remoto, si una contraseña no está en memoria, la interfaz muestra “No disponible”. Se vuelve a cargar al iniciar sesión o al pulsar Actualizar.
- En un dominio público sin Supabase configurado ya no se puede entrar con `victor1234 / 1234`. Esa cuenta solo queda para pruebas en `localhost` o abriendo el archivo directamente.
