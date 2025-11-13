import { ResetResourceDialog } from '@/components/dialog-resource-reset';
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
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useUser from '@/hooks/use-user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Geen geldig e-mailadres').optional(),
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  password: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
});

export default function CreateUserGeneral() {
  /* edit user: users are linked through idpUdser.identifier + idpUdser.provider
   * normal fields of linked users are all updated by the API if one of them is
   * updated, so editing one of these linked users suffices
   */

  const { data, updateUser } = useUser();
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  let user = data;
  if (Array.isArray(data)) user = data[0];

  const defaults = useCallback(
    () => ({
      email: user?.email || '',
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
      city: user?.city || '',
      postcode: user?.postcode || '',
      password: user?.password || '',
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
    }),
    [user]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  // Fetch two-factor status
  useEffect(() => {
    async function fetchTwoFactorStatus() {
      try {
        const response = await fetch(
          `/api/openstad/api/project/${user.projectId}/user/${user.id}/two-factor-status`
        );
        const data = await response.json();
        setIsTwoFactorEnabled(data.twoFactorEnabled);
      } catch (error) {
        toast.error('Failed to fetch two-factor status');
      }
    }

    if (user?.id) {
      fetchTwoFactorStatus();
    }
  }, [user]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateUser({ ...values, id: user.id, projectId: user.projectId });
      toast.success('User is bijgewerkt');
    } catch (err: any) {
      toast.error(err.message || 'User kon niet worden bijgewerkt');
    }
  }

  async function handleResetTwoFactor() {
    try {
      await fetch(
        `/api/openstad/api/project/${user.projectId}/user/${user.id}/reset-two-factor`,
        {
          method: 'PUT',
        }
      );

      setIsTwoFactorEnabled(false);
      toast.success('Two-factor authentication reset succesvol');
    } catch (error) {
      toast.error('Two-factor authenticatie kon niet worden gereset');
    }
  }

  if (!data) return null;

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Algemene instellingen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-auto">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>E-mailadres</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mt-auto">
                <FormLabel>Volledige naam</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem className="mt-auto">
                <FormLabel>Voornaam</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastname"
            render={({ field }) => (
              <FormItem className="mt-auto">
                <FormLabel>Achternaam</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefoonnummer</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adres</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stad</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postcode</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wachtwoord</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="col-span-full w-fit" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>

      <Separator className="my-4" />

      <div>
        <p>
          {isTwoFactorEnabled
            ? 'Two-factor authenticatie is ingeschakeld.'
            : 'Deze gebruiker heeft nog geen two-factor authenticatie ingesteld.'}
        </p>
        {isTwoFactorEnabled && (
          <ResetResourceDialog
            header="Two-Factor Authenticatie Reset"
            message="Weet je zeker dat je de two-factor authentication wilt resetten voor deze gebruiker?"
            resetButtonText="Reset Two-Factor Authenticatie"
            onResetAccepted={handleResetTwoFactor}
          />
        )}
      </div>
    </div>
  );
}
