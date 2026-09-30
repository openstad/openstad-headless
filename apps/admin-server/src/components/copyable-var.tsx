import { Copy, Info } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * A `{{ variable }}` chip that copies its own expression on click. Moved here
 * from authentication/loginpaginas.tsx and authentication/requiredfields.tsx,
 * which had the same button defined twice; both keep working unchanged and can
 * move onto this component later.
 */
export function CopyableVar({ expression }: { expression: string }) {
  const value = `{{${expression}}}`;
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => null);
        toast('Tekst gekopieerd', {
          icon: <Info className="h-4 w-4 text-blue-500" />,
        });
      }}
      title={`Kopieer ${value}`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-copy">
      {value}
      <Copy className="h-3 w-3" />
    </button>
  );
}
