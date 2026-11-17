import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/** Verification badges — only shown when the Khet Se team has actually verified them. */
export function FarmerBadges({ organic, profile, issuer }: { organic: boolean; profile: boolean; issuer?: string }) {
  if (!organic && !profile) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {organic && (
        <Badge tone="green" className="border-0 bg-leaf text-white" >
          <ShieldCheck className="h-3 w-3" aria-hidden />
          Organic verified{issuer ? ` · ${issuer}` : ''}
        </Badge>
      )}
      {profile && (
        <Badge tone="neutral">
          <BadgeCheck className="h-3 w-3 text-leaf" aria-hidden /> Verified farmer
        </Badge>
      )}
    </div>
  );
}
