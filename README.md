# Safe Taxes ATL — CRM

CRM y portal de clientes para preparación de impuestos (USA). Landing pública
bilingüe (ES/EN), formularios de intake con descarga de PDF + envío por correo +
registro en base de datos, autenticación por roles, y un área interna donde el
preparador gestiona clientes, formularios por año (carpetas) y documentos.

**Stack:** Angular 18 (NgModules) · Tailwind CSS 3 + Flowbite · Supabase
(Auth + Postgres + Storage) · ngx-translate · jsPDF.

---

## 1. Requisitos

- Node.js 18+ (probado con Node 22)
- npm 9+

## 2. Instalación

```bash
npm install
```

> El proyecto se entregó **sin** `node_modules`. Este paso los instala.

## 3. Configurar Supabase

1. Las llaves ya están en `src/environments/environment*.ts`
   (URL + **publishable key**). La `sb_secret_...` **nunca** va en el frontend.
2. Ejecuta el esquema: copia [`supabase/schema.sql`](./supabase/schema.sql) en
   el **SQL Editor** de Supabase y córrelo (crea tablas, RLS, bucket y triggers).
3. (Opcional) Despliega la función de correo — ver [`supabase/README.md`](./supabase/README.md).
4. Regístrate en la app, luego conviértete en preparador:
   ```sql
   update public.profiles set role = 'preparer' where email = 'tu@correo.com';
   ```

## 4. Ejecutar

```bash
npm start          # ng serve  → http://localhost:4200
npm run build      # build de producción → dist/
```

---

## 5. Estructura

```
src/app/
├─ core/                # modelos, servicios (Supabase, auth, forms, docs, pdf, email), guards
├─ shared/              # SharedModule: navbar, footer, language-switcher,
│                       #   tax-form (reutilizable) y process-stepper
└─ features/
   ├─ landing/          # home (hero + servicios + intake público) y contacto
   ├─ auth/             # login y registro
   ├─ client/           # dashboard, perfil, mis formularios, editor, estado
   └─ preparer/         # clientes, detalle (carpetas por año + carga), leads
supabase/
├─ schema.sql           # tablas + RLS + storage
├─ functions/send-tax-email/   # Edge Function de correo (Resend)
└─ README.md
src/assets/i18n/        # es.json / en.json
```

## 6. Funcionalidades implementadas

- **Landing bilingüe** con servicios, pasos y formulario de intake público.
- **Intake público** → descarga PDF + **guarda el prospecto en `leads`** +
  correo (cuando la Edge Function está desplegada).
- **Auth + roles** (cliente / preparador / admin) con guards de ruta.
- **Cliente:** perfil editable (incl. SSN/banco), formularios por año, editor
  (auto-rellena desde el perfil; editable hasta enviar), estado del proceso.
- **Preparador:** lista de clientes con búsqueda, detalle con **datos
  personales**, **formularios por año en carpetas (clic para abrir)**,
  **carga de documentos finales** a Storage, control del paso del proceso, y
  bandeja de **leads** del landing.
- **PDF** estilo escritorio (jsPDF) reutilizado para descarga y adjunto de correo.

## 7. Seguridad (importante)

La app maneja **SSN y datos bancarios de EE. UU.** RLS limita las lecturas al
dueño y al staff. Para producción:

- Cifra columnas sensibles (Supabase Vault / pgsodium).
- Revisa IRS Pub. 4557 y la FTC Safeguards Rule.
- Considera **no** pedir SSN/banco en el formulario público anónimo.
- Si compartiste la `sb_secret_...` en algún chat, **regenérala** en Supabase.

## 8. Pendiente / próximos pasos

- **Carpeta `formquali`**: no llegó en la subida. Vuelve a compartirla y migro
  esos formularios (quitando la marca *QualiTech*) a este proyecto.
- Cifrado de columnas sensibles.
- Notificaciones por correo en cambios de estado del proceso.
- Tests unitarios (Karma/Jasmine ya configurado).
