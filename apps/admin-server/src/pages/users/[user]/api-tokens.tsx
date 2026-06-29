import { ApiTokenStatusBadge } from '@/components/api-token-status-badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useApiTokens, { ApiToken } from '@/hooks/use-api-tokens';
import useUser from '@/hooks/use-user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import * as z from 'zod';

const NO_EXPIRY = 'none';

const formSchema = z.object({
  months: z.string().min(1, 'Kies een geldigheidsperiode'),
  name: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function maskToken(token: ApiToken) {
  return `${token.tokenPrefix}...${token.lastFour}`;
}

function formatExpiry(iso: string | null) {
  if (!iso) return 'Geen einddatum';
  return new Date(iso).toLocaleDateString('nl-NL');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL');
}

export default function UserApiTokens() {
  const { data } = useUser();
  const user = Array.isArray(data) ? data[0] : data;

  const {
    data: tokens,
    error,
    isLoading,
    createToken,
    revokeToken,
  } = useApiTokens(user?.projectId, user?.id);

  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { months: NO_EXPIRY, name: '' },
  });

  const selectedMonths = form.watch('months');

  async function onSubmit(values: FormValues) {
    try {
      const created = await createToken({
        months:
          values.months && values.months !== NO_EXPIRY
            ? parseInt(values.months, 10)
            : undefined,
        name: values.name || undefined,
      });
      if (created.token) {
        setNewToken(created.token);
        setCopied(false);
      }
      form.reset();
      toast.success('API-token aangemaakt');
    } catch {
      toast.error('Aanmaken van token mislukt');
    }
  }

  async function handleRevoke(tokenId: number) {
    if (!confirm('Weet je zeker dat je dit token wilt intrekken?')) return;
    try {
      await revokeToken(tokenId);
      toast.success('Token ingetrokken');
    } catch {
      toast.error('Intrekken van token mislukt');
    }
  }

  async function handleCopy() {
    if (!newToken) return;
    try {
      await navigator.clipboard.writeText(newToken);
      setCopied(true);
    } catch {
      toast.error('Kopiëren mislukt');
    }
  }

  if (!user?.id) return null;

  return (
    <div className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        API-tokens
      </Heading>
      <p className="text-sm text-muted-foreground mb-6">
        Genereer een token zodat externe tools zoals Power BI authenticatie
        kunnen uitvoeren via een Bearer-header.
      </p>

      {newToken && (
        <div className="mb-6 p-4 border border-yellow-400 bg-yellow-50 rounded-md">
          <p className="text-sm font-semibold text-yellow-800 mb-2">
            Dit token wordt maar één keer getoond. Kopieer het nu.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 block bg-white border rounded px-3 py-2 text-sm font-mono break-all">
              {newToken}
            </code>
            <Button type="button" variant="outline" onClick={handleCopy}>
              {copied ? 'Gekopieerd!' : 'Kopieer'}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 text-xs"
            onClick={() => setNewToken(null)}>
            Verberg token
          </Button>
        </div>
      )}

      <Heading size="lg" className="mb-4">
        Nieuw token aanmaken
      </Heading>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Geldigheidsperiode</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies een periode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NO_EXPIRY}>Geen einddatum</SelectItem>
                    <SelectItem value="1">1 maand</SelectItem>
                    <SelectItem value="3">3 maanden</SelectItem>
                    <SelectItem value="12">12 maanden</SelectItem>
                  </SelectContent>
                </Select>
                {selectedMonths === NO_EXPIRY && (
                  <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1 mt-1">
                    Let op: dit token verloopt <strong>nooit</strong> en blijft
                    geldig totdat het handmatig wordt ingetrokken.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Naam (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="bijv. Power BI rapport" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Token aanmaken</Button>
        </form>
      </Form>

      <Separator className="my-6" />

      <Heading size="lg" className="mb-4">
        Bestaande tokens
      </Heading>

      {error ? (
        <p className="text-sm text-red-700">
          Tokens konden niet worden geladen. Probeer het later opnieuw.
        </p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Tokens laden…</p>
      ) : !tokens || tokens.length === 0 ? (
        <p className="text-sm text-muted-foreground">Geen tokens gevonden.</p>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.id}
              className={`flex items-center justify-between p-3 border rounded-md ${
                token.status !== 'active' ? 'opacity-60' : ''
              }`}>
              <div className="text-sm">
                <p className="font-mono font-medium flex items-center gap-2">
                  {maskToken(token)}
                  <ApiTokenStatusBadge status={token.status} />
                </p>
                {token.name && (
                  <p className="text-muted-foreground">{token.name}</p>
                )}
                <p className="text-muted-foreground text-xs mt-1">
                  Verloopt: {formatExpiry(token.expiresAt)}
                  {token.lastUsedAt &&
                    ` · Laatst gebruikt: ${formatDate(token.lastUsedAt)}`}
                </p>
              </div>
              {token.status !== 'revoked' && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRevoke(token.id)}>
                  Intrekken
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
