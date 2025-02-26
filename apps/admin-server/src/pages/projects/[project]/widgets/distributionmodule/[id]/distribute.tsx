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
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { DistributionModuleProps } from '@openstad-headless/distribution-module/src/distribution-module';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const formSchema = z.object({
  total: z.any(),
  choice: z.string(),
  budgetTotalText: z.string().optional(),
  budgetLeftoverText: z.string().optional(),
  pointsTotalText: z.string().optional(),
  pointsLeftoverText: z.string().optional(),
  budgetErrorTitle: z.string().optional(),
  budgetErrorMessage: z.string().optional(),
  pointsErrorTitle: z.string().optional(),
  pointsErrorMessage: z.string().optional(),
  prependText: z.string().optional(),
  appendText: z.string().optional(),
});

export default function WidgetDistributionModuleDistribute(
  props: DistributionModuleProps & EditFieldProps<DistributionModuleProps>
) {
  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    const validChoice = values.choice === "points" || values.choice === "budget" ? values.choice : "budget";
    props.updateConfig({ ...props, ...values, choice: validChoice });
  }

  type PropsKeys = keyof (DistributionModuleProps);

  const defaultValue = (key: PropsKeys, defaultValue: string | number, fallback: string | number) => {
    if (!!props[key]) {
      return props[key];
    } else if ( typeof props[key] === 'undefined') {
      return defaultValue;
    } else {
      return fallback;
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      total: defaultValue('total', 30000, 0) as number,
      choice: defaultValue('choice', 'budget', 'budget') as string,
      pointsTotalText: defaultValue('pointsTotalText', 'Totaal punten', '') as string,
      pointsLeftoverText: defaultValue('pointsLeftoverText', 'Overige punten', '') as string,
      budgetTotalText: defaultValue('budgetTotalText', 'Totaal bedrag', '') as string,
      budgetLeftoverText: defaultValue('budgetLeftoverText', 'Overig bedrag', '') as string,
      budgetErrorTitle: defaultValue('budgetErrorTitle', 'Er is geen geld meer om te verdelen', '') as string,
      budgetErrorMessage: defaultValue('budgetErrorMessage', 'Er is niet genoeg geld over om deze verdeling te maken. Pas je keuze aan zodat het overige bedrag <b>€ 0</b> is', '') as string,
      pointsErrorTitle: defaultValue('pointsErrorTitle', 'Er zijn geen punten meer om te verdelen', '') as string,
      pointsErrorMessage: defaultValue('pointsErrorMessage', 'Er zijn niet genoeg punten over om deze verdeling te maken. Pas je keuze aan zodat de overige punten <b>0 punten</b> is', '') as string,
      prependText: defaultValue('prependText', '€', '') as string,
      appendText: defaultValue('appendText', 'punten', '') as string,
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-4 w-full lg:w-2/3">
          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aantal om te verdelen</FormLabel>
                <Input
                  {...field}
                  type={'number'}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="choice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kies welk type er wordt gebruikt voor het verdelen</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Budget" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="points">Punten</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          { form.watch('choice') === 'budget' && (
            <>
              <FormField
                control={form.control}
                name="budgetTotalText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Totaal bedrag tekst</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetLeftoverText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overig bedrag tekst</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetErrorTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geen geld meer foutmelding titel</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetErrorMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geen geld meer foutmelding tekst</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prependText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tekst voor het verdeelde aantal</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          { form.watch('choice') === 'points' && (
            <>
              <FormField
                control={form.control}
                name="pointsTotalText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Totaal punten tekst</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pointsLeftoverText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overige punten tekst</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pointsErrorTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geen punten meer foutmelding titel</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pointsErrorMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geen punten meer foutmelding tekst</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appendText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tekst na het verdeelde aantal</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
