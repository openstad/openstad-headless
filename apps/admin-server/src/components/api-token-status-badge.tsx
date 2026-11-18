import { ApiTokenStatus } from '@/hooks/use-api-tokens';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<ApiTokenStatus, string> = {
  active: 'Actief',
  expired: 'Verlopen',
  revoked: 'Ingetrokken',
};

const STATUS_CLASSES: Record<ApiTokenStatus, string> = {
  active: 'bg-green-100 text-green-800 border-green-300',
  expired: 'bg-orange-100 text-orange-800 border-orange-300',
  revoked: 'bg-red-100 text-red-800 border-red-300',
};

export function ApiTokenStatusBadge({ status }: { status: ApiTokenStatus }) {
  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 text-xs font-medium border rounded-full whitespace-nowrap',
        STATUS_CLASSES[status]
      )}>
      {STATUS_LABELS[status]}
    </span>
  );
}
