// DESACTIVADA POR SEGURIDAD.
//
// La versión anterior de esta función:
// - no autenticaba al solicitante,
// - recibía solo el nombre de usuario,
// - devolvía credenciales y cookies de sesión de una cuenta maestra,
// - usaba Puppeteer, que no funciona en Supabase Edge Functions.
//
// Cualquier persona que conociera un usuario podía pedir el acceso completo.
// No vuelvas a desplegar la versión anterior. Si en el futuro se necesita
// abrir una sesión automatizada, debe hacerse con autenticación de cliente,
// sin devolver contraseñas, semillas TOTP ni cookies al navegador.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(
    JSON.stringify({
      success: false,
      motivo: "FUNCION_DESACTIVADA",
      mensaje: "Esta función fue desactivada por seguridad. Usa el inicio de sesión normal.",
    }),
    {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
