/**
 * A completed tax document uploaded by a preparer for a client, stored in the
 * Supabase Storage bucket `tax-documents` and indexed by this row.
 */
export interface TaxDocument {
  id?: string;
  user_id: string;
  tax_year: number;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at?: string;
}
