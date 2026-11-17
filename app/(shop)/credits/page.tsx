import type { Metadata } from 'next';
import { SERVER_API_URL } from '@/lib/config';
import { SITE_IMAGE_CREDITS } from '@/lib/images';
import type { Product } from '@/types';

export const metadata: Metadata = { title: 'Photo credits' };
// Rebuild at most hourly — credits change only when the catalogue does.
export const revalidate = 3600;

async function getCatalogue(): Promise<Product[]> {
  try {
    const res = await fetch(`${SERVER_API_URL}/products?limit=100`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

/** Splits "CC BY-SA 4.0 · Wikimedia Commons · https://…" into text + link. */
function parseCredit(credit?: string) {
  if (!credit) return { text: '—', url: undefined };
  const parts = credit.split(' · ');
  const url = parts.find((p) => p.startsWith('https://'));
  return { text: parts.filter((p) => p !== url).join(' · '), url };
}

export default async function CreditsPage() {
  const products = await getCatalogue();
  const rows = [
    ...SITE_IMAGE_CREDITS.map((c) => ({ label: c.label, text: c.credit, url: c.url })),
    ...products.map((p) => ({ label: p.name, ...parseCredit(p.imageCredit) })),
  ];

  return (
    <div className="section max-w-3xl py-16">
      <h1 className="text-4xl font-semibold">Photo credits</h1>
      <p className="mt-3 text-soil-muted">
        Khet Se uses photographs shared under the Unsplash License and Creative Commons licences. Thank you to the
        photographers. Each source page names the author and the full licence terms.
      </p>
      <table className="mt-10 w-full border border-line text-left text-sm">
        <thead className="bg-cream text-xs uppercase tracking-wide text-soil-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Photo</th>
            <th className="px-4 py-3 font-semibold">Licence & source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="px-4 py-3 font-medium">{r.label}</td>
              <td className="px-4 py-3 text-soil-muted">
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-leaf hover:underline">
                    {r.text}
                  </a>
                ) : (
                  r.text
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
