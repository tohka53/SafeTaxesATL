/**
 * PRODUCTION environment.
 * Replace the placeholders with your real Supabase project values.
 * The anon (public) key is safe to ship to the browser — Row Level Security
 * (see supabase/schema.sql) is what protects the data.  NEVER put the
 * service_role key in this file.
 */
export const environment = {
  production: true,
  supabaseUrl: 'https://ncjicryfnutglupcgpqt.supabase.co',
  // Publishable key — safe in the browser ONLY because RLS is enabled
  // (see supabase/schema.sql). Never put the sb_secret_... key here.
  supabaseAnonKey: 'sb_publishable_z0UV5AV6laPrGw7-I5Vd5g_1Rs4bkJt',
  defaultLang: 'en',
  // Todos los formularios nuevos se envían aquí (para pruebas/verificación).
  contactEmail: 'mecg1994@gmail.com',
  // Clave de ofuscación de IDs en la URL (no es seguridad real; ver RLS).
  idKey: 'stATL-2026-k9',
  // URL pública de la app (para los correos de confirmación, no localhost).
  siteUrl: 'https://safetaxesatl.vercel.app'
};
