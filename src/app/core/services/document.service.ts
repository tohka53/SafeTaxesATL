import { Injectable } from '@angular/core';

import { SupabaseService } from './supabase.service';
import { TaxDocument } from '@core/models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly bucket = 'tax-documents';
  private readonly table = 'documents';

  constructor(private readonly sb: SupabaseService) {}

  async listByUser(userId: string): Promise<TaxDocument[]> {
    const { data, error } = await this.sb.client
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .order('tax_year', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    return (data ?? []) as TaxDocument[];
  }

  /** Uploads a finished tax document to Storage and indexes it in the DB. */
  async upload(
    userId: string,
    taxYear: number,
    file: File,
    uploadedBy: string | null
  ): Promise<TaxDocument> {
    const safeName = file.name.replace(/[^\w.\-]+/g, '_');
    const path = `${userId}/${taxYear}/${Date.now()}_${safeName}`;

    const { error: upErr } = await this.sb.client.storage
      .from(this.bucket)
      .upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) {
      throw upErr;
    }

    const row: TaxDocument = {
      user_id: userId,
      tax_year: taxYear,
      file_name: file.name,
      storage_path: path,
      mime_type: file.type || null,
      size_bytes: file.size,
      uploaded_by: uploadedBy
    };
    const { data, error } = await this.sb.client
      .from(this.table)
      .insert(row)
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as TaxDocument;
  }

  /** Time-limited URL the client can use to view/download a finished return. */
  async getSignedUrl(storagePath: string, expiresInSec = 3600): Promise<string> {
    const { data, error } = await this.sb.client.storage
      .from(this.bucket)
      .createSignedUrl(storagePath, expiresInSec);
    if (error) {
      throw error;
    }
    return data.signedUrl;
  }

  async remove(doc: TaxDocument): Promise<void> {
    if (doc.storage_path) {
      await this.sb.client.storage.from(this.bucket).remove([doc.storage_path]);
    }
    if (doc.id) {
      await this.sb.client.from(this.table).delete().eq('id', doc.id);
    }
  }
}
