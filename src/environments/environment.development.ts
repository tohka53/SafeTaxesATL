/**
 * DEVELOPMENT environment (used by `ng serve`).
 * Replace the placeholders with your real Supabase project values.
 *
 * MULTI-LOCATION: everything under `brand*` is the only thing you need to
 * change to deploy a new, differently-branded version of this same app for
 * another tax office / location. No other file should hardcode a brand name.
 */
export const environment = {
  production: false,
  supabaseUrl: 'https://ncjicryfnutglupcgpqt.supabase.co',
  // Publishable key — safe in the browser ONLY because RLS is enabled
  // (see supabase/schema.sql). Never put the sb_secret_... key here.
  supabaseAnonKey: 'sb_publishable_z0UV5AV6laPrGw7-I5Vd5g_1Rs4bkJt',
  defaultLang: 'en',
  // Todos los formularios nuevos se envían aquí (para pruebas/verificación).
  contactEmail: 'mecg1994@gmail.com',
  // Clave de ofuscación de IDs en la URL (no es seguridad real; ver RLS).
  idKey: 'txcrm-2026-k9',
  // URL pública de esta instancia (para los correos de confirmación, no localhost).
  // Cámbiala por el dominio real de cada despliegue/sede.
  siteUrl: 'https://safetaxesatl.vercel.app',

  // ---- Marca (edita esto por sede/versión) ----
  // Nombre visible en navbar, footer, PDFs y correos.
  brandName: 'Safe Taxes',
  // Iniciales del logo (badge cuadrado).
  brandInitials: 'ST',
  // Prefijo para nombres de archivo descargados (sin espacios/acentos).
  brandSlug: 'SafeTaxes'
};
