/**
 * Config-driven form definitions. Each form type is described by sections of
 * fields and rendered by DynamicFormComponent, so adding/adjusting a form is
 * a data change — no new component.
 *
 * The 6 default form types below (`DEFAULT_FORM_DEFINITIONS`) are seed data
 * only, used to populate the `form_definitions` Supabase table on first
 * install (see supabase/migration-form-definitions.sql). At runtime the app
 * NEVER reads this constant — it reads from Supabase via FormDefService
 * (src/app/core/services/form-def.service.ts), so preparer/admin can add,
 * edit or remove forms and fields from the Form Builder UI without a code
 * deploy. This constant only documents the original shape / acts as a
 * reference if you ever need to re-run the seed migration.
 */
export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'date'
  | 'number'
  | 'money'
  | 'yesno'
  | 'textarea'
  | 'select'
  | 'state'
  | 'city'
  | 'bank';

export interface FieldDef {
  name: string;
  es: string;
  en: string;
  type?: FieldType; // default 'text'
  options?: { value: string; es: string; en: string }[];
  full?: boolean; // span full width
}

export interface SectionDef {
  es: string;
  en: string;
  fields: FieldDef[];
}

export interface FormDef {
  id: string;
  es: string;
  en: string;
  icon: string;
  /** true → rendered by the dedicated ClientProfileFormComponent instead of DynamicFormComponent. */
  custom?: boolean;
  /** Hidden from "start a new form" pickers when false, but existing submissions still render. */
  is_active?: boolean;
  sort_order?: number;
  sections: SectionDef[];
}

/**
 * The rich "Client Profile" intake form is intentionally NOT in
 * form_definitions / the Form Builder — it's rendered by the dedicated
 * ClientProfileFormComponent (nested groups, dependents array, signatures,
 * its own PDF layout) instead of DynamicFormComponent, so its fields aren't
 * add/remove-editable from the UI. This constant is how the rest of the app
 * (the "start a new form" picker, form-type labels) still knows its id/title
 * without a form_definitions row.
 */
export const CLIENT_PROFILE_FORM_DEF: FormDef = {
  id: 'client_profile',
  es: 'Formulario de perfil del cliente (Intake)',
  en: 'Client Profile (Intake)',
  icon: '🧾',
  custom: true,
  sections: []
};

/** Seed only — see file header. Source of truth is the `form_definitions` table. */
export const DEFAULT_FORM_DEFINITIONS: FormDef[] = [
  {
    "id": "schedule_c",
    "es": "Schedule C — Trabajo por cuenta propia",
    "en": "Schedule C — Self-employed",
    "icon": "💼",
    "sections": [
      {
        "es": "General",
        "en": "General",
        "fields": [
          {
            "name": "taxYear",
            "es": "Año fiscal",
            "en": "Tax year",
            "type": "number"
          },
          {
            "name": "client",
            "es": "Cliente",
            "en": "Client",
            "type": "text"
          },
          {
            "name": "businessName",
            "es": "Nombre del negocio",
            "en": "Business name",
            "type": "text"
          },
          {
            "name": "taxId",
            "es": "Tax ID / EIN",
            "en": "Tax ID / EIN",
            "type": "text"
          },
          {
            "name": "email",
            "es": "Correo",
            "en": "Email",
            "type": "email"
          },
          {
            "name": "cellPhone",
            "es": "Celular",
            "en": "Cell phone",
            "type": "tel"
          }
        ]
      },
      {
        "es": "Vehículo",
        "en": "Vehicle",
        "fields": [
          {
            "name": "vehicleName",
            "es": "Vehículo",
            "en": "Vehicle name",
            "type": "text"
          },
          {
            "name": "vehicleType",
            "es": "Tipo",
            "en": "Type",
            "type": "text"
          },
          {
            "name": "beginMileage",
            "es": "Millaje inicial",
            "en": "Begin mileage",
            "type": "number"
          },
          {
            "name": "endMileage",
            "es": "Millaje final",
            "en": "End mileage",
            "type": "number"
          }
        ]
      },
      {
        "es": "Ingresos",
        "en": "Income",
        "fields": [
          {
            "name": "grossReceipts",
            "es": "Ingresos brutos",
            "en": "Gross receipts",
            "type": "money"
          }
        ]
      },
      {
        "es": "Gastos",
        "en": "Expenses",
        "fields": [
          {
            "name": "advertising",
            "es": "Publicidad",
            "en": "Advertising",
            "type": "money"
          },
          {
            "name": "carAndTruck",
            "es": "Auto y camión",
            "en": "Car and truck",
            "type": "money"
          },
          {
            "name": "commissions",
            "es": "Comisiones",
            "en": "Commissions",
            "type": "money"
          },
          {
            "name": "contractLabor",
            "es": "Mano de obra contratada",
            "en": "Contract labor",
            "type": "money"
          },
          {
            "name": "depreciation",
            "es": "Depreciación",
            "en": "Depreciation",
            "type": "money"
          },
          {
            "name": "insurance",
            "es": "Seguro",
            "en": "Insurance",
            "type": "money"
          },
          {
            "name": "legalProfessional",
            "es": "Servicios legales/prof.",
            "en": "Legal & professional",
            "type": "money"
          },
          {
            "name": "licenses",
            "es": "Licencias",
            "en": "Licenses",
            "type": "money"
          },
          {
            "name": "mealsEnt",
            "es": "Comidas",
            "en": "Meals",
            "type": "money"
          },
          {
            "name": "mortgageInterest",
            "es": "Interés hipotecario",
            "en": "Mortgage interest",
            "type": "money"
          },
          {
            "name": "officeExpense",
            "es": "Gastos de oficina",
            "en": "Office expense",
            "type": "money"
          },
          {
            "name": "otherInterest",
            "es": "Otros intereses",
            "en": "Other interest",
            "type": "money"
          },
          {
            "name": "rentLease",
            "es": "Renta/arrendamiento",
            "en": "Rent / lease",
            "type": "money"
          },
          {
            "name": "rentVehicles",
            "es": "Renta vehículos",
            "en": "Rent vehicles",
            "type": "money"
          },
          {
            "name": "rentOtherProperty",
            "es": "Renta otra propiedad",
            "en": "Rent other property",
            "type": "money"
          },
          {
            "name": "repairMaintenance",
            "es": "Reparación/mant.",
            "en": "Repair & maintenance",
            "type": "money"
          },
          {
            "name": "supplies",
            "es": "Suministros",
            "en": "Supplies",
            "type": "money"
          },
          {
            "name": "taxes",
            "es": "Impuestos",
            "en": "Taxes",
            "type": "money"
          },
          {
            "name": "telephone",
            "es": "Teléfono",
            "en": "Telephone",
            "type": "money"
          },
          {
            "name": "travel",
            "es": "Viajes",
            "en": "Travel",
            "type": "money"
          },
          {
            "name": "utilities",
            "es": "Servicios",
            "en": "Utilities",
            "type": "money"
          },
          {
            "name": "wages",
            "es": "Salarios",
            "en": "Wages",
            "type": "money"
          },
          {
            "name": "otherExpenses",
            "es": "Otros gastos",
            "en": "Other expenses",
            "type": "money"
          },
          {
            "name": "totalExpenses",
            "es": "Gastos totales",
            "en": "Total expenses",
            "type": "money"
          }
        ]
      }
    ]
  },
  {
    "id": "real_estate",
    "es": "Propiedad de bienes raíces",
    "en": "Real Estate Property",
    "icon": "🏚️",
    "sections": [
      {
        "es": "Propiedad",
        "en": "Property",
        "fields": [
          {
            "name": "taxYear",
            "es": "Año fiscal",
            "en": "Tax year",
            "type": "number"
          },
          {
            "name": "propertyAddress1",
            "es": "Dirección de la propiedad",
            "en": "Property address",
            "type": "text",
            "full": true
          },
          {
            "name": "propertyAddress2",
            "es": "Dirección (2)",
            "en": "Property address 2",
            "type": "text",
            "full": true
          },
          {
            "name": "originalCost",
            "es": "Costo original",
            "en": "Original cost",
            "type": "money"
          },
          {
            "name": "grossIncome",
            "es": "Ingreso bruto",
            "en": "Gross income",
            "type": "money"
          },
          {
            "name": "email",
            "es": "Correo",
            "en": "Email",
            "type": "email"
          }
        ]
      },
      {
        "es": "Gastos",
        "en": "Expenses",
        "fields": [
          {
            "name": "advertising",
            "es": "Publicidad",
            "en": "Advertising",
            "type": "money"
          },
          {
            "name": "autoTravel",
            "es": "Auto y viajes",
            "en": "Auto & travel",
            "type": "money"
          },
          {
            "name": "carpentry",
            "es": "Carpintería",
            "en": "Carpentry",
            "type": "money"
          },
          {
            "name": "cleaningMaintenance",
            "es": "Limpieza/mant.",
            "en": "Cleaning & maintenance",
            "type": "money"
          },
          {
            "name": "commissions",
            "es": "Comisiones",
            "en": "Commissions",
            "type": "money"
          },
          {
            "name": "condoFee",
            "es": "Cuota de condominio",
            "en": "Condo fee",
            "type": "money"
          },
          {
            "name": "contractorLabor",
            "es": "Mano de obra",
            "en": "Contractor labor",
            "type": "money"
          },
          {
            "name": "depreciation",
            "es": "Depreciación",
            "en": "Depreciation",
            "type": "money"
          },
          {
            "name": "electrical",
            "es": "Electricidad",
            "en": "Electrical",
            "type": "money"
          },
          {
            "name": "gas",
            "es": "Gas",
            "en": "Gas",
            "type": "money"
          },
          {
            "name": "heat",
            "es": "Calefacción",
            "en": "Heat",
            "type": "money"
          },
          {
            "name": "insurance",
            "es": "Seguro",
            "en": "Insurance",
            "type": "money"
          },
          {
            "name": "legalFees",
            "es": "Honorarios legales",
            "en": "Legal fees",
            "type": "money"
          },
          {
            "name": "managementFees",
            "es": "Administración",
            "en": "Management fees",
            "type": "money"
          },
          {
            "name": "mortgageInterest",
            "es": "Interés hipotecario",
            "en": "Mortgage interest",
            "type": "money"
          },
          {
            "name": "otherInterest",
            "es": "Otros intereses",
            "en": "Other interest",
            "type": "money"
          },
          {
            "name": "paintingDecorating",
            "es": "Pintura/decoración",
            "en": "Painting & decorating",
            "type": "money"
          },
          {
            "name": "plumbingHeating",
            "es": "Plomería/calefacción",
            "en": "Plumbing & heating",
            "type": "money"
          },
          {
            "name": "realEstateTaxes",
            "es": "Impuestos inmobiliarios",
            "en": "Real estate taxes",
            "type": "money"
          },
          {
            "name": "repair",
            "es": "Reparaciones",
            "en": "Repair",
            "type": "money"
          },
          {
            "name": "supplies",
            "es": "Suministros",
            "en": "Supplies",
            "type": "money"
          },
          {
            "name": "trashSnow",
            "es": "Basura/nieve",
            "en": "Trash & snow",
            "type": "money"
          },
          {
            "name": "utilities",
            "es": "Servicios",
            "en": "Utilities",
            "type": "money"
          },
          {
            "name": "waterSewer",
            "es": "Agua/alcantarillado",
            "en": "Water & sewer",
            "type": "money"
          },
          {
            "name": "otherExpense",
            "es": "Otros gastos",
            "en": "Other expense",
            "type": "money"
          },
          {
            "name": "totalExpenses",
            "es": "Gastos totales",
            "en": "Total expenses",
            "type": "money"
          },
          {
            "name": "carryforwardLosses",
            "es": "Pérdidas acumuladas",
            "en": "Carryforward losses",
            "type": "money"
          }
        ]
      }
    ]
  },
  {
    "id": "business_intake",
    "es": "Registro de negocio (Business Intake)",
    "en": "Business Intake",
    "icon": "🏢",
    "sections": [
      {
        "es": "Negocio",
        "en": "Business",
        "fields": [
          {
            "name": "businessName",
            "es": "Nombre del negocio",
            "en": "Business name",
            "type": "text"
          },
          {
            "name": "businessFid",
            "es": "FID / EIN",
            "en": "FID / EIN",
            "type": "text"
          },
          {
            "name": "cid",
            "es": "CID",
            "en": "CID",
            "type": "text"
          },
          {
            "name": "businessAddress",
            "es": "Dirección",
            "en": "Address",
            "type": "text",
            "full": true
          },
          {
            "name": "state",
            "es": "Estado",
            "en": "State",
            "type": "state"
          },
          {
            "name": "city",
            "es": "Ciudad",
            "en": "City",
            "type": "city"
          },
          {
            "name": "zip",
            "es": "Código postal",
            "en": "ZIP",
            "type": "text"
          },
          {
            "name": "website",
            "es": "Sitio web",
            "en": "Website",
            "type": "text"
          }
        ]
      },
      {
        "es": "Contacto",
        "en": "Contact",
        "fields": [
          {
            "name": "contactName",
            "es": "Nombre de contacto",
            "en": "Contact name",
            "type": "text"
          },
          {
            "name": "contactPhone",
            "es": "Tel. contacto",
            "en": "Contact phone",
            "type": "tel"
          },
          {
            "name": "contactCell",
            "es": "Celular contacto",
            "en": "Contact cell",
            "type": "tel"
          },
          {
            "name": "bizPhone",
            "es": "Tel. negocio",
            "en": "Business phone",
            "type": "tel"
          },
          {
            "name": "bizCell",
            "es": "Celular negocio",
            "en": "Business cell",
            "type": "tel"
          },
          {
            "name": "bizEmail",
            "es": "Correo del negocio",
            "en": "Business email",
            "type": "email"
          }
        ]
      },
      {
        "es": "Banco",
        "en": "Bank",
        "fields": [
          {
            "name": "bankName",
            "es": "Nombre del banco",
            "en": "Bank name",
            "type": "bank"
          },
          {
            "name": "accountNumber",
            "es": "Número de cuenta",
            "en": "Account number",
            "type": "text"
          },
          {
            "name": "rtn",
            "es": "Número de ruta",
            "en": "Routing number",
            "type": "text"
          },
          {
            "name": "duaAcct",
            "es": "Cuenta DUA",
            "en": "DUA account",
            "type": "text"
          },
          {
            "name": "additionalBankInfo",
            "es": "Info bancaria adicional",
            "en": "Additional bank info",
            "type": "textarea",
            "full": true
          }
        ]
      },
      {
        "es": "Empleados y nómina",
        "en": "Employees & payroll",
        "fields": [
          {
            "name": "employees",
            "es": "Empleados",
            "en": "Employees",
            "type": "number"
          },
          {
            "name": "fullTime",
            "es": "Tiempo completo",
            "en": "Full time",
            "type": "number"
          },
          {
            "name": "partTime",
            "es": "Medio tiempo",
            "en": "Part time",
            "type": "number"
          },
          {
            "name": "contractors",
            "es": "Contratistas",
            "en": "Contractors",
            "type": "number"
          },
          {
            "name": "hasPayroll",
            "es": "¿Tiene nómina?",
            "en": "Has payroll?",
            "type": "yesno"
          },
          {
            "name": "bookkeeping",
            "es": "¿Lleva contabilidad?",
            "en": "Bookkeeping?",
            "type": "yesno"
          }
        ]
      },
      {
        "es": "Accesos",
        "en": "Credentials",
        "fields": [
          {
            "name": "username",
            "es": "Usuario",
            "en": "Username",
            "type": "text"
          },
          {
            "name": "pin",
            "es": "PIN",
            "en": "PIN",
            "type": "text"
          },
          {
            "name": "securityQuestion",
            "es": "Pregunta de seguridad",
            "en": "Security question",
            "type": "text",
            "full": true
          }
        ]
      }
    ]
  },
  {
    "id": "daycare",
    "es": "Guardería (DayCare)",
    "en": "DayCare",
    "icon": "🧸",
    "sections": [
      {
        "es": "General",
        "en": "General",
        "fields": [
          {
            "name": "taxYear",
            "es": "Año fiscal",
            "en": "Tax year",
            "type": "number"
          },
          {
            "name": "businessName",
            "es": "Nombre del negocio",
            "en": "Business name",
            "type": "text"
          },
          {
            "name": "providerId",
            "es": "ID del proveedor",
            "en": "Provider ID",
            "type": "text"
          },
          {
            "name": "clientName",
            "es": "Nombre del cliente",
            "en": "Client name",
            "type": "text"
          },
          {
            "name": "email",
            "es": "Correo",
            "en": "Email",
            "type": "email"
          }
        ]
      },
      {
        "es": "Pagos",
        "en": "Payments",
        "fields": [
          {
            "name": "amountPaid",
            "es": "Monto pagado",
            "en": "Amount paid",
            "type": "money"
          },
          {
            "name": "childrenInfo",
            "es": "Niños (nombre, fecha nac., monto)",
            "en": "Children (name, DOB, amount)",
            "type": "textarea",
            "full": true
          }
        ]
      }
    ]
  },
  {
    "id": "employee",
    "es": "Empleado (alta)",
    "en": "Employee (onboarding)",
    "icon": "👔",
    "sections": [
      {
        "es": "Datos del empleado",
        "en": "Employee data",
        "fields": [
          {
            "name": "firstName",
            "es": "Nombre",
            "en": "First name",
            "type": "text"
          },
          {
            "name": "lastName",
            "es": "Apellido",
            "en": "Last name",
            "type": "text"
          },
          {
            "name": "companyName",
            "es": "Empresa",
            "en": "Company name",
            "type": "text"
          },
          {
            "name": "dob",
            "es": "Fecha de nacimiento",
            "en": "Date of birth",
            "type": "date"
          },
          {
            "name": "ssn",
            "es": "SSN",
            "en": "SSN",
            "type": "text"
          },
          {
            "name": "email",
            "es": "Correo",
            "en": "Email",
            "type": "email"
          },
          {
            "name": "hireDate",
            "es": "Fecha de contratación",
            "en": "Hire date",
            "type": "date"
          },
          {
            "name": "address",
            "es": "Dirección",
            "en": "Address",
            "type": "text",
            "full": true
          },
          {
            "name": "state",
            "es": "Estado",
            "en": "State",
            "type": "state"
          },
          {
            "name": "city",
            "es": "Ciudad",
            "en": "City",
            "type": "city"
          },
          {
            "name": "zip",
            "es": "Código postal",
            "en": "ZIP",
            "type": "text"
          }
        ]
      }
    ]
  },
  {
    "id": "payroll",
    "es": "Nómina (configuración)",
    "en": "Payroll (setup)",
    "icon": "💵",
    "sections": [
      {
        "es": "General",
        "en": "General",
        "fields": [
          {
            "name": "email",
            "es": "Correo",
            "en": "Email",
            "type": "email"
          },
          {
            "name": "startDate",
            "es": "Fecha inicio",
            "en": "Start date",
            "type": "date"
          },
          {
            "name": "endDate",
            "es": "Fecha fin",
            "en": "End date",
            "type": "date"
          },
          {
            "name": "firstCheckDate",
            "es": "Primer cheque",
            "en": "First check date",
            "type": "date"
          },
          {
            "name": "state",
            "es": "Estado",
            "en": "State",
            "type": "text"
          },
          {
            "name": "suiRate",
            "es": "Tasa SUI",
            "en": "SUI rate",
            "type": "text"
          }
        ]
      },
      {
        "es": "Empleados",
        "en": "Employees",
        "fields": [
          {
            "name": "employeesInfo",
            "es": "Empleados (nombre, SSN por línea)",
            "en": "Employees (name, SSN per line)",
            "type": "textarea",
            "full": true
          }
        ]
      }
    ]
  }
];
