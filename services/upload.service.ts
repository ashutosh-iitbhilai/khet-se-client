import { api } from '@/lib/api';

export type UploadKind = 'farm' | 'product' | 'certificate';

interface SignedParams {
  uploadUrl: string;
  apiKey: string;
  signature: string;
  timestamp: number;
  folder: string;
  transformation: string;
}

export const uploadService = {
  config: () => api<{ enabled: boolean }>('/uploads/config'),

  /** Signed direct upload to Cloudinary; returns the hosted https URL. */
  async upload(file: File, kind: UploadKind): Promise<string> {
    const signed = await api<SignedParams>('/uploads/sign', { method: 'POST', body: { kind } });
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', signed.apiKey);
    form.append('timestamp', String(signed.timestamp));
    form.append('signature', signed.signature);
    form.append('folder', signed.folder);
    form.append('transformation', signed.transformation);

    const res = await fetch(signed.uploadUrl, { method: 'POST', body: form });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.secure_url) throw new Error(json?.error?.message ?? 'Upload failed. Please try again.');
    return json.secure_url as string;
  },
};
