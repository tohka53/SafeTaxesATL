/** A CRM contact/client — may be linked to an existing profile by phone. */
export interface CrmContact {
  id?: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  linked_profile_id: string | null;
  last_communication: string | null;
  last_update?: string;
  created_by?: string | null;
  created_at?: string;
}
