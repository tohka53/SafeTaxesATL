-- Módulo de Formularios dinámicos editables (Form Builder).
-- Correr en el SQL Editor de Supabase (después de schema.sql).
--
-- Antes, los 6 formularios dinámicos (Schedule C, Bienes Raíces, Business
-- Intake, DayCare, Employee, Payroll) estaban hardcodeados en
-- src/app/core/models/form-def.model.ts. Ahora viven aquí, en
-- form_definitions, y se editan desde la app (preparador/admin → Form
-- Builder): agregar/quitar secciones y campos, cambiar tipos, activar o
-- desactivar un formulario, sin desplegar código nuevo.
--
-- Lectura pública (anon + authenticated): el formulario público del landing
-- (/formulario/:type) necesita leer la definición para renderizar los campos,
-- incluso para visitantes sin cuenta. No hay datos sensibles aquí, solo
-- nombres de campo y etiquetas. Escritura: solo preparador/admin.

create table if not exists public.form_definitions (
  id          text primary key,               -- slug estable, p.ej. 'schedule_c'
  es          text not null,
  en          text not null,
  icon        text not null default '📄',
  sections    jsonb not null default '[]'::jsonb,  -- [{ es, en, fields: [{name, es, en, type, options?, full?}] }]
  is_active   boolean not null default true,  -- si es false, no se ofrece para llenar (pero sigue legible para formularios históricos)
  sort_order  int not null default 0,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_form_definitions_active on public.form_definitions(is_active, sort_order);

drop trigger if exists trg_form_definitions_updated on public.form_definitions;
create trigger trg_form_definitions_updated before update on public.form_definitions
  for each row execute function public.set_updated_at();

alter table public.form_definitions enable row level security;

drop policy if exists form_definitions_select_public on public.form_definitions;
create policy form_definitions_select_public on public.form_definitions
  for select to anon, authenticated using (true);

drop policy if exists form_definitions_write_staff on public.form_definitions;
create policy form_definitions_write_staff on public.form_definitions
  for insert to authenticated with check (public.is_staff());

drop policy if exists form_definitions_update_staff on public.form_definitions;
create policy form_definitions_update_staff on public.form_definitions
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists form_definitions_delete_staff on public.form_definitions;
create policy form_definitions_delete_staff on public.form_definitions
  for delete to authenticated using (public.is_staff());

grant select on public.form_definitions to anon, authenticated;
grant insert, update, delete on public.form_definitions to authenticated;

-- =====================================================================
--  SEED: los 6 formularios dinámicos que ya existían en el código.
--  Es seguro volver a correr esto — hace upsert por id, así que si ya
--  editaste un formulario desde la app y vuelves a correr este archivo,
--  PERDERÁS esos cambios (te los sobrescribe con el original). Solo
--  córrelo una vez, en la instalación inicial.
-- =====================================================================

insert into public.form_definitions (id, es, en, icon, sections, sort_order)
values
  ('schedule_c', 'Schedule C — Trabajo por cuenta propia', 'Schedule C — Self-employed', '💼', '[{"es": "General", "en": "General", "fields": [{"name": "taxYear", "es": "Año fiscal", "en": "Tax year", "type": "number"}, {"name": "client", "es": "Cliente", "en": "Client", "type": "text"}, {"name": "businessName", "es": "Nombre del negocio", "en": "Business name", "type": "text"}, {"name": "taxId", "es": "Tax ID / EIN", "en": "Tax ID / EIN", "type": "text"}, {"name": "email", "es": "Correo", "en": "Email", "type": "email"}, {"name": "cellPhone", "es": "Celular", "en": "Cell phone", "type": "tel"}]}, {"es": "Vehículo", "en": "Vehicle", "fields": [{"name": "vehicleName", "es": "Vehículo", "en": "Vehicle name", "type": "text"}, {"name": "vehicleType", "es": "Tipo", "en": "Type", "type": "text"}, {"name": "beginMileage", "es": "Millaje inicial", "en": "Begin mileage", "type": "number"}, {"name": "endMileage", "es": "Millaje final", "en": "End mileage", "type": "number"}]}, {"es": "Ingresos", "en": "Income", "fields": [{"name": "grossReceipts", "es": "Ingresos brutos", "en": "Gross receipts", "type": "money"}]}, {"es": "Gastos", "en": "Expenses", "fields": [{"name": "advertising", "es": "Publicidad", "en": "Advertising", "type": "money"}, {"name": "carAndTruck", "es": "Auto y camión", "en": "Car and truck", "type": "money"}, {"name": "commissions", "es": "Comisiones", "en": "Commissions", "type": "money"}, {"name": "contractLabor", "es": "Mano de obra contratada", "en": "Contract labor", "type": "money"}, {"name": "depreciation", "es": "Depreciación", "en": "Depreciation", "type": "money"}, {"name": "insurance", "es": "Seguro", "en": "Insurance", "type": "money"}, {"name": "legalProfessional", "es": "Servicios legales/prof.", "en": "Legal & professional", "type": "money"}, {"name": "licenses", "es": "Licencias", "en": "Licenses", "type": "money"}, {"name": "mealsEnt", "es": "Comidas", "en": "Meals", "type": "money"}, {"name": "mortgageInterest", "es": "Interés hipotecario", "en": "Mortgage interest", "type": "money"}, {"name": "officeExpense", "es": "Gastos de oficina", "en": "Office expense", "type": "money"}, {"name": "otherInterest", "es": "Otros intereses", "en": "Other interest", "type": "money"}, {"name": "rentLease", "es": "Renta/arrendamiento", "en": "Rent / lease", "type": "money"}, {"name": "rentVehicles", "es": "Renta vehículos", "en": "Rent vehicles", "type": "money"}, {"name": "rentOtherProperty", "es": "Renta otra propiedad", "en": "Rent other property", "type": "money"}, {"name": "repairMaintenance", "es": "Reparación/mant.", "en": "Repair & maintenance", "type": "money"}, {"name": "supplies", "es": "Suministros", "en": "Supplies", "type": "money"}, {"name": "taxes", "es": "Impuestos", "en": "Taxes", "type": "money"}, {"name": "telephone", "es": "Teléfono", "en": "Telephone", "type": "money"}, {"name": "travel", "es": "Viajes", "en": "Travel", "type": "money"}, {"name": "utilities", "es": "Servicios", "en": "Utilities", "type": "money"}, {"name": "wages", "es": "Salarios", "en": "Wages", "type": "money"}, {"name": "otherExpenses", "es": "Otros gastos", "en": "Other expenses", "type": "money"}, {"name": "totalExpenses", "es": "Gastos totales", "en": "Total expenses", "type": "money"}]}]'::jsonb, 10),
  ('real_estate', 'Propiedad de bienes raíces', 'Real Estate Property', '🏚️', '[{"es": "Propiedad", "en": "Property", "fields": [{"name": "taxYear", "es": "Año fiscal", "en": "Tax year", "type": "number"}, {"name": "propertyAddress1", "es": "Dirección de la propiedad", "en": "Property address", "type": "text", "full": true}, {"name": "propertyAddress2", "es": "Dirección (2)", "en": "Property address 2", "type": "text", "full": true}, {"name": "originalCost", "es": "Costo original", "en": "Original cost", "type": "money"}, {"name": "grossIncome", "es": "Ingreso bruto", "en": "Gross income", "type": "money"}, {"name": "email", "es": "Correo", "en": "Email", "type": "email"}]}, {"es": "Gastos", "en": "Expenses", "fields": [{"name": "advertising", "es": "Publicidad", "en": "Advertising", "type": "money"}, {"name": "autoTravel", "es": "Auto y viajes", "en": "Auto & travel", "type": "money"}, {"name": "carpentry", "es": "Carpintería", "en": "Carpentry", "type": "money"}, {"name": "cleaningMaintenance", "es": "Limpieza/mant.", "en": "Cleaning & maintenance", "type": "money"}, {"name": "commissions", "es": "Comisiones", "en": "Commissions", "type": "money"}, {"name": "condoFee", "es": "Cuota de condominio", "en": "Condo fee", "type": "money"}, {"name": "contractorLabor", "es": "Mano de obra", "en": "Contractor labor", "type": "money"}, {"name": "depreciation", "es": "Depreciación", "en": "Depreciation", "type": "money"}, {"name": "electrical", "es": "Electricidad", "en": "Electrical", "type": "money"}, {"name": "gas", "es": "Gas", "en": "Gas", "type": "money"}, {"name": "heat", "es": "Calefacción", "en": "Heat", "type": "money"}, {"name": "insurance", "es": "Seguro", "en": "Insurance", "type": "money"}, {"name": "legalFees", "es": "Honorarios legales", "en": "Legal fees", "type": "money"}, {"name": "managementFees", "es": "Administración", "en": "Management fees", "type": "money"}, {"name": "mortgageInterest", "es": "Interés hipotecario", "en": "Mortgage interest", "type": "money"}, {"name": "otherInterest", "es": "Otros intereses", "en": "Other interest", "type": "money"}, {"name": "paintingDecorating", "es": "Pintura/decoración", "en": "Painting & decorating", "type": "money"}, {"name": "plumbingHeating", "es": "Plomería/calefacción", "en": "Plumbing & heating", "type": "money"}, {"name": "realEstateTaxes", "es": "Impuestos inmobiliarios", "en": "Real estate taxes", "type": "money"}, {"name": "repair", "es": "Reparaciones", "en": "Repair", "type": "money"}, {"name": "supplies", "es": "Suministros", "en": "Supplies", "type": "money"}, {"name": "trashSnow", "es": "Basura/nieve", "en": "Trash & snow", "type": "money"}, {"name": "utilities", "es": "Servicios", "en": "Utilities", "type": "money"}, {"name": "waterSewer", "es": "Agua/alcantarillado", "en": "Water & sewer", "type": "money"}, {"name": "otherExpense", "es": "Otros gastos", "en": "Other expense", "type": "money"}, {"name": "totalExpenses", "es": "Gastos totales", "en": "Total expenses", "type": "money"}, {"name": "carryforwardLosses", "es": "Pérdidas acumuladas", "en": "Carryforward losses", "type": "money"}]}]'::jsonb, 20),
  ('business_intake', 'Registro de negocio (Business Intake)', 'Business Intake', '🏢', '[{"es": "Negocio", "en": "Business", "fields": [{"name": "businessName", "es": "Nombre del negocio", "en": "Business name", "type": "text"}, {"name": "businessFid", "es": "FID / EIN", "en": "FID / EIN", "type": "text"}, {"name": "cid", "es": "CID", "en": "CID", "type": "text"}, {"name": "businessAddress", "es": "Dirección", "en": "Address", "type": "text", "full": true}, {"name": "state", "es": "Estado", "en": "State", "type": "state"}, {"name": "city", "es": "Ciudad", "en": "City", "type": "city"}, {"name": "zip", "es": "Código postal", "en": "ZIP", "type": "text"}, {"name": "website", "es": "Sitio web", "en": "Website", "type": "text"}]}, {"es": "Contacto", "en": "Contact", "fields": [{"name": "contactName", "es": "Nombre de contacto", "en": "Contact name", "type": "text"}, {"name": "contactPhone", "es": "Tel. contacto", "en": "Contact phone", "type": "tel"}, {"name": "contactCell", "es": "Celular contacto", "en": "Contact cell", "type": "tel"}, {"name": "bizPhone", "es": "Tel. negocio", "en": "Business phone", "type": "tel"}, {"name": "bizCell", "es": "Celular negocio", "en": "Business cell", "type": "tel"}, {"name": "bizEmail", "es": "Correo del negocio", "en": "Business email", "type": "email"}]}, {"es": "Banco", "en": "Bank", "fields": [{"name": "bankName", "es": "Nombre del banco", "en": "Bank name", "type": "bank"}, {"name": "accountNumber", "es": "Número de cuenta", "en": "Account number", "type": "text"}, {"name": "rtn", "es": "Número de ruta", "en": "Routing number", "type": "text"}, {"name": "duaAcct", "es": "Cuenta DUA", "en": "DUA account", "type": "text"}, {"name": "additionalBankInfo", "es": "Info bancaria adicional", "en": "Additional bank info", "type": "textarea", "full": true}]}, {"es": "Empleados y nómina", "en": "Employees & payroll", "fields": [{"name": "employees", "es": "Empleados", "en": "Employees", "type": "number"}, {"name": "fullTime", "es": "Tiempo completo", "en": "Full time", "type": "number"}, {"name": "partTime", "es": "Medio tiempo", "en": "Part time", "type": "number"}, {"name": "contractors", "es": "Contratistas", "en": "Contractors", "type": "number"}, {"name": "hasPayroll", "es": "¿Tiene nómina?", "en": "Has payroll?", "type": "yesno"}, {"name": "bookkeeping", "es": "¿Lleva contabilidad?", "en": "Bookkeeping?", "type": "yesno"}]}, {"es": "Accesos", "en": "Credentials", "fields": [{"name": "username", "es": "Usuario", "en": "Username", "type": "text"}, {"name": "pin", "es": "PIN", "en": "PIN", "type": "text"}, {"name": "securityQuestion", "es": "Pregunta de seguridad", "en": "Security question", "type": "text", "full": true}]}]'::jsonb, 30),
  ('daycare', 'Guardería (DayCare)', 'DayCare', '🧸', '[{"es": "General", "en": "General", "fields": [{"name": "taxYear", "es": "Año fiscal", "en": "Tax year", "type": "number"}, {"name": "businessName", "es": "Nombre del negocio", "en": "Business name", "type": "text"}, {"name": "providerId", "es": "ID del proveedor", "en": "Provider ID", "type": "text"}, {"name": "clientName", "es": "Nombre del cliente", "en": "Client name", "type": "text"}, {"name": "email", "es": "Correo", "en": "Email", "type": "email"}]}, {"es": "Pagos", "en": "Payments", "fields": [{"name": "amountPaid", "es": "Monto pagado", "en": "Amount paid", "type": "money"}, {"name": "childrenInfo", "es": "Niños (nombre, fecha nac., monto)", "en": "Children (name, DOB, amount)", "type": "textarea", "full": true}]}]'::jsonb, 40),
  ('employee', 'Empleado (alta)', 'Employee (onboarding)', '👔', '[{"es": "Datos del empleado", "en": "Employee data", "fields": [{"name": "firstName", "es": "Nombre", "en": "First name", "type": "text"}, {"name": "lastName", "es": "Apellido", "en": "Last name", "type": "text"}, {"name": "companyName", "es": "Empresa", "en": "Company name", "type": "text"}, {"name": "dob", "es": "Fecha de nacimiento", "en": "Date of birth", "type": "date"}, {"name": "ssn", "es": "SSN", "en": "SSN", "type": "text"}, {"name": "email", "es": "Correo", "en": "Email", "type": "email"}, {"name": "hireDate", "es": "Fecha de contratación", "en": "Hire date", "type": "date"}, {"name": "address", "es": "Dirección", "en": "Address", "type": "text", "full": true}, {"name": "state", "es": "Estado", "en": "State", "type": "state"}, {"name": "city", "es": "Ciudad", "en": "City", "type": "city"}, {"name": "zip", "es": "Código postal", "en": "ZIP", "type": "text"}]}]'::jsonb, 50),
  ('payroll', 'Nómina (configuración)', 'Payroll (setup)', '💵', '[{"es": "General", "en": "General", "fields": [{"name": "email", "es": "Correo", "en": "Email", "type": "email"}, {"name": "startDate", "es": "Fecha inicio", "en": "Start date", "type": "date"}, {"name": "endDate", "es": "Fecha fin", "en": "End date", "type": "date"}, {"name": "firstCheckDate", "es": "Primer cheque", "en": "First check date", "type": "date"}, {"name": "state", "es": "Estado", "en": "State", "type": "text"}, {"name": "suiRate", "es": "Tasa SUI", "en": "SUI rate", "type": "text"}]}, {"es": "Empleados", "en": "Employees", "fields": [{"name": "employeesInfo", "es": "Empleados (nombre, SSN por línea)", "en": "Employees (name, SSN per line)", "type": "textarea", "full": true}]}]'::jsonb, 60)
on conflict (id) do update set
  es         = excluded.es,
  en         = excluded.en,
  icon       = excluded.icon,
  sections   = excluded.sections,
  sort_order = excluded.sort_order,
  updated_at = now();

grant select, insert, update, delete on public.form_definitions to authenticated;
