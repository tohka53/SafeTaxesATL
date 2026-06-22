/**
 * Config-driven form definitions. Each form type is described here and rendered
 * by DynamicFormComponent, so adding/adjusting a form is a data change — no new
 * component. Ported from the QualiTech forms (rebranded Safe Taxes ATL).
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
  /** true → rendered by the dedicated ClientProfileFormComponent. */
  custom?: boolean;
  sections: SectionDef[];
}

const f = (
  name: string,
  es: string,
  en: string,
  type: FieldType = 'text',
  full = false
): FieldDef => ({ name, es, en, type, full });

const money = (name: string, es: string, en: string): FieldDef =>
  f(name, es, en, 'money');

const COMMON_ADDR: FieldDef[] = [
  f('address', 'Dirección', 'Address', 'text', true),
  f('state', 'Estado', 'State', 'state'),
  f('city', 'Ciudad', 'City', 'city'),
  f('zip', 'Código postal', 'ZIP')
];

export const FORM_DEFINITIONS: FormDef[] = [
  {
    id: 'client_profile',
    es: 'Formulario de perfil del cliente (Intake)',
    en: 'Client Profile (Intake)',
    icon: '🧾',
    custom: true,
    sections: []
  },

  {
    id: 'schedule_c',
    es: 'Schedule C — Trabajo por cuenta propia',
    en: 'Schedule C — Self-employed',
    icon: '💼',
    sections: [
      {
        es: 'General',
        en: 'General',
        fields: [
          f('taxYear', 'Año fiscal', 'Tax year', 'number'),
          f('client', 'Cliente', 'Client'),
          f('businessName', 'Nombre del negocio', 'Business name'),
          f('taxId', 'Tax ID / EIN', 'Tax ID / EIN'),
          f('email', 'Correo', 'Email', 'email'),
          f('cellPhone', 'Celular', 'Cell phone', 'tel')
        ]
      },
      {
        es: 'Vehículo',
        en: 'Vehicle',
        fields: [
          f('vehicleName', 'Vehículo', 'Vehicle name'),
          f('vehicleType', 'Tipo', 'Type'),
          f('beginMileage', 'Millaje inicial', 'Begin mileage', 'number'),
          f('endMileage', 'Millaje final', 'End mileage', 'number')
        ]
      },
      {
        es: 'Ingresos',
        en: 'Income',
        fields: [money('grossReceipts', 'Ingresos brutos', 'Gross receipts')]
      },
      {
        es: 'Gastos',
        en: 'Expenses',
        fields: [
          money('advertising', 'Publicidad', 'Advertising'),
          money('carAndTruck', 'Auto y camión', 'Car and truck'),
          money('commissions', 'Comisiones', 'Commissions'),
          money('contractLabor', 'Mano de obra contratada', 'Contract labor'),
          money('depreciation', 'Depreciación', 'Depreciation'),
          money('insurance', 'Seguro', 'Insurance'),
          money('legalProfessional', 'Servicios legales/prof.', 'Legal & professional'),
          money('licenses', 'Licencias', 'Licenses'),
          money('mealsEnt', 'Comidas', 'Meals'),
          money('mortgageInterest', 'Interés hipotecario', 'Mortgage interest'),
          money('officeExpense', 'Gastos de oficina', 'Office expense'),
          money('otherInterest', 'Otros intereses', 'Other interest'),
          money('rentLease', 'Renta/arrendamiento', 'Rent / lease'),
          money('rentVehicles', 'Renta vehículos', 'Rent vehicles'),
          money('rentOtherProperty', 'Renta otra propiedad', 'Rent other property'),
          money('repairMaintenance', 'Reparación/mant.', 'Repair & maintenance'),
          money('supplies', 'Suministros', 'Supplies'),
          money('taxes', 'Impuestos', 'Taxes'),
          money('telephone', 'Teléfono', 'Telephone'),
          money('travel', 'Viajes', 'Travel'),
          money('utilities', 'Servicios', 'Utilities'),
          money('wages', 'Salarios', 'Wages'),
          money('otherExpenses', 'Otros gastos', 'Other expenses'),
          money('totalExpenses', 'Gastos totales', 'Total expenses')
        ]
      }
    ]
  },

  {
    id: 'real_estate',
    es: 'Propiedad de bienes raíces',
    en: 'Real Estate Property',
    icon: '🏚️',
    sections: [
      {
        es: 'Propiedad',
        en: 'Property',
        fields: [
          f('taxYear', 'Año fiscal', 'Tax year', 'number'),
          f('propertyAddress1', 'Dirección de la propiedad', 'Property address', 'text', true),
          f('propertyAddress2', 'Dirección (2)', 'Property address 2', 'text', true),
          money('originalCost', 'Costo original', 'Original cost'),
          money('grossIncome', 'Ingreso bruto', 'Gross income'),
          f('email', 'Correo', 'Email', 'email')
        ]
      },
      {
        es: 'Gastos',
        en: 'Expenses',
        fields: [
          money('advertising', 'Publicidad', 'Advertising'),
          money('autoTravel', 'Auto y viajes', 'Auto & travel'),
          money('carpentry', 'Carpintería', 'Carpentry'),
          money('cleaningMaintenance', 'Limpieza/mant.', 'Cleaning & maintenance'),
          money('commissions', 'Comisiones', 'Commissions'),
          money('condoFee', 'Cuota de condominio', 'Condo fee'),
          money('contractorLabor', 'Mano de obra', 'Contractor labor'),
          money('depreciation', 'Depreciación', 'Depreciation'),
          money('electrical', 'Electricidad', 'Electrical'),
          money('gas', 'Gas', 'Gas'),
          money('heat', 'Calefacción', 'Heat'),
          money('insurance', 'Seguro', 'Insurance'),
          money('legalFees', 'Honorarios legales', 'Legal fees'),
          money('managementFees', 'Administración', 'Management fees'),
          money('mortgageInterest', 'Interés hipotecario', 'Mortgage interest'),
          money('otherInterest', 'Otros intereses', 'Other interest'),
          money('paintingDecorating', 'Pintura/decoración', 'Painting & decorating'),
          money('plumbingHeating', 'Plomería/calefacción', 'Plumbing & heating'),
          money('realEstateTaxes', 'Impuestos inmobiliarios', 'Real estate taxes'),
          money('repair', 'Reparaciones', 'Repair'),
          money('supplies', 'Suministros', 'Supplies'),
          money('trashSnow', 'Basura/nieve', 'Trash & snow'),
          money('utilities', 'Servicios', 'Utilities'),
          money('waterSewer', 'Agua/alcantarillado', 'Water & sewer'),
          money('otherExpense', 'Otros gastos', 'Other expense'),
          money('totalExpenses', 'Gastos totales', 'Total expenses'),
          money('carryforwardLosses', 'Pérdidas acumuladas', 'Carryforward losses')
        ]
      }
    ]
  },

  {
    id: 'business_intake',
    es: 'Registro de negocio (Business Intake)',
    en: 'Business Intake',
    icon: '🏢',
    sections: [
      {
        es: 'Negocio',
        en: 'Business',
        fields: [
          f('businessName', 'Nombre del negocio', 'Business name'),
          f('businessFid', 'FID / EIN', 'FID / EIN'),
          f('cid', 'CID', 'CID'),
          f('businessAddress', 'Dirección', 'Address', 'text', true),
          f('state', 'Estado', 'State', 'state'),
          f('city', 'Ciudad', 'City', 'city'),
          f('zip', 'Código postal', 'ZIP'),
          f('website', 'Sitio web', 'Website')
        ]
      },
      {
        es: 'Contacto',
        en: 'Contact',
        fields: [
          f('contactName', 'Nombre de contacto', 'Contact name'),
          f('contactPhone', 'Tel. contacto', 'Contact phone', 'tel'),
          f('contactCell', 'Celular contacto', 'Contact cell', 'tel'),
          f('bizPhone', 'Tel. negocio', 'Business phone', 'tel'),
          f('bizCell', 'Celular negocio', 'Business cell', 'tel'),
          f('bizEmail', 'Correo del negocio', 'Business email', 'email')
        ]
      },
      {
        es: 'Banco',
        en: 'Bank',
        fields: [
          f('bankName', 'Nombre del banco', 'Bank name', 'bank'),
          f('accountNumber', 'Número de cuenta', 'Account number'),
          f('rtn', 'Número de ruta', 'Routing number'),
          f('duaAcct', 'Cuenta DUA', 'DUA account'),
          f('additionalBankInfo', 'Info bancaria adicional', 'Additional bank info', 'textarea', true)
        ]
      },
      {
        es: 'Empleados y nómina',
        en: 'Employees & payroll',
        fields: [
          f('employees', 'Empleados', 'Employees', 'number'),
          f('fullTime', 'Tiempo completo', 'Full time', 'number'),
          f('partTime', 'Medio tiempo', 'Part time', 'number'),
          f('contractors', 'Contratistas', 'Contractors', 'number'),
          f('hasPayroll', '¿Tiene nómina?', 'Has payroll?', 'yesno'),
          f('bookkeeping', '¿Lleva contabilidad?', 'Bookkeeping?', 'yesno')
        ]
      },
      {
        es: 'Accesos',
        en: 'Credentials',
        fields: [
          f('username', 'Usuario', 'Username'),
          f('pin', 'PIN', 'PIN'),
          f('securityQuestion', 'Pregunta de seguridad', 'Security question', 'text', true)
        ]
      }
    ]
  },

  {
    id: 'daycare',
    es: 'Guardería (DayCare)',
    en: 'DayCare',
    icon: '🧸',
    sections: [
      {
        es: 'General',
        en: 'General',
        fields: [
          f('taxYear', 'Año fiscal', 'Tax year', 'number'),
          f('businessName', 'Nombre del negocio', 'Business name'),
          f('providerId', 'ID del proveedor', 'Provider ID'),
          f('clientName', 'Nombre del cliente', 'Client name'),
          f('email', 'Correo', 'Email', 'email')
        ]
      },
      {
        es: 'Pagos',
        en: 'Payments',
        fields: [
          money('amountPaid', 'Monto pagado', 'Amount paid'),
          f('childrenInfo', 'Niños (nombre, fecha nac., monto)', 'Children (name, DOB, amount)', 'textarea', true)
        ]
      }
    ]
  },

  {
    id: 'employee',
    es: 'Empleado (alta)',
    en: 'Employee (onboarding)',
    icon: '👔',
    sections: [
      {
        es: 'Datos del empleado',
        en: 'Employee data',
        fields: [
          f('firstName', 'Nombre', 'First name'),
          f('lastName', 'Apellido', 'Last name'),
          f('companyName', 'Empresa', 'Company name'),
          f('dob', 'Fecha de nacimiento', 'Date of birth', 'date'),
          f('ssn', 'SSN', 'SSN'),
          f('email', 'Correo', 'Email', 'email'),
          f('hireDate', 'Fecha de contratación', 'Hire date', 'date'),
          ...COMMON_ADDR
        ]
      }
    ]
  },

  {
    id: 'payroll',
    es: 'Nómina (configuración)',
    en: 'Payroll (setup)',
    icon: '💵',
    sections: [
      {
        es: 'General',
        en: 'General',
        fields: [
          f('email', 'Correo', 'Email', 'email'),
          f('startDate', 'Fecha inicio', 'Start date', 'date'),
          f('endDate', 'Fecha fin', 'End date', 'date'),
          f('firstCheckDate', 'Primer cheque', 'First check date', 'date'),
          f('state', 'Estado', 'State'),
          f('suiRate', 'Tasa SUI', 'SUI rate')
        ]
      },
      {
        es: 'Empleados',
        en: 'Employees',
        fields: [
          f('employeesInfo', 'Empleados (nombre, SSN por línea)', 'Employees (name, SSN per line)', 'textarea', true)
        ]
      }
    ]
  }
];

export function findFormDef(id: string): FormDef | undefined {
  return FORM_DEFINITIONS.find((d) => d.id === id);
}
