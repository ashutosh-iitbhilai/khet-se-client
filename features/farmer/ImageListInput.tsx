'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFetch } from '@/hooks/useFetch';
import { uploadService, type UploadKind } from '@/services/upload.service';

interface ImageListInputProps {
  value: string[];
  onChange: (urls: string[]) => void;
  kind: UploadKind;
  max: number;
}

const MAX_FILE_MB = 8;

/**
 * Photo picker. Uploads straight to Cloudinary when the server has it configured;
 * otherwise lets the farmer paste an https image link.
 */
export function ImageListInput({ value, onChange, kind, max }: ImageListInputProps) {
  const { data: config } = useFetch(() => uploadService.config());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const full = value.length >= max;

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    try {
      const room = max - value.length;
      const picked = Array.from(files).slice(0, room);
      const tooBig = picked.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
      if (tooBig) throw new Error(`${tooBig.name} is larger than ${MAX_FILE_MB} MB`);
      const urls: string[] = [];
      for (const f of picked) urls.push(await uploadService.upload(f, kind));
      onChange([...value, ...urls]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const addUrl = () => {
    const v = url.trim();
    if (!/^https:\/\/\S+$/.test(v)) return setError('Paste a link that starts with https://');
    if (value.includes(v)) return setError('This photo is already added');
    setError(null);
    onChange([...value, v]);
    setUrl('');
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((src, i) => (
            <li key={src} className="group relative aspect-square overflow-hidden border border-line bg-sand">
              {/* Farmer-supplied URLs can be any host, so a plain <img> is used here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
              {i === 0 && (
                <span className="absolute left-0 top-0 bg-leaf px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">Cover</span>
              )}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== src))}
                className="absolute right-1 top-1 bg-white/90 p-1 text-soil hover:text-danger"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!full &&
        (config?.enabled ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}
              {busy ? 'Uploading…' : 'Add photos'}
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-muted" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addUrl();
                  }
                }}
                placeholder="Paste photo link (https://…)"
                className="pl-9"
                aria-label="Photo link"
              />
            </div>
            <Button type="button" variant="outline" onClick={addUrl}>
              Add
            </Button>
          </div>
        ))}

      <p className="text-xs text-soil-muted">
        {value.length}/{max} photos. The first photo is the cover.
        {config && !config.enabled && ' Direct photo upload is not set up on this server yet.'}
      </p>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
