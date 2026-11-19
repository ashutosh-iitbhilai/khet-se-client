import { api } from '@/lib/api';

export type UploadKind = 'farm' | 'product' | 'certificate';

/**
 * Response of POST /uploads/sign: the upload URL, API key and signature, plus every signed
 * Cloudinary parameter (folder, timestamp, transformation, allowed_formats, …). All signed
 * parameters must be sent back unchanged or Cloudinary rejects the signature.
 */
interface SignedParams {
  uploadUrl: string;
  apiKey: string;
  signature: string;
  [param: string]: string | number;
}

export const uploadService = {
  config: () => api<{ enabled: boolean }>('/uploads/config'),

  /** Signed direct upload to Cloudinary; returns the hosted https URL. */
  async upload(file: File, kind: UploadKind): Promise<string> {
    const { uploadUrl, apiKey, signature, ...signedParams } = await api<SignedParams>('/uploads/sign', { method: 'POST', body: { kind } });
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', apiKey);
    form.append('signature', signature);
    for (const [k, v] of Object.entries(signedParams)) form.append(k, String(v));

    const res = await fetch(uploadUrl, { method: 'POST', body: form });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.secure_url) throw new Error(json?.error?.message ?? 'Upload failed. Please try again.');
    return json.secure_url as string;
  },
};
