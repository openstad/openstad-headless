import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  step1Title: z.string().optional(),
  resourceCardTitle: z.string().optional(),
  step2Title: z.string().optional(),
  stemCodeTitle: z.string().optional(),
  stemCodeTitleSuccess: z.string().optional(),
  newsLetterTitle: z.string().optional(),
  panelTitle: z.string().optional(),
  budgetChosenTitle: z.string().optional(),
  budgetRemainingTitle: z.string().optional(),
  step1Tab: z.string().optional(),
  step2Tab: z.string().optional(),
  step3Tab: z.string().optional(),
  step4Tab: z.string().optional(),
  overviewTitle: z.string().optional(),
  step3Title: z.string().optional(),
  step1Delete: z.string().optional(),
  step1Add: z.string().optional(),
  step1MaxText: z.string().optional(),
});

type Formdata = z.infer<typeof formSchema>;

export default function BegrootmoduleText(
  props: StemBegrootWidgetProps & EditFieldProps<StemBegrootWidgetProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  function onSubmit(values: Formdata) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      step1Tab: props.step1Tab ?? 'Kies',
      step2Tab: props.step2Tab ?? 'Overzicht',
      step3Tab: props.step3Tab ?? 'Stemcode',
      step4Tab: props.step4Tab ?? 'Stem',
      step1Title: props.step1Title ?? 'Uw selecties',
      resourceCardTitle: props.resourceCardTitle ?? 'Selecteer een inzending',
      step1Delete: props.step1Delete ?? 'Verwijder',
      step1Add: props.step1Add ?? 'Voeg toe',
      step1MaxText: props.step1MaxText ?? '',
      step2Title: props.step2Title ?? 'Overzicht van mijn selectie',
      step3Title: props.step3Title ?? "Controleer stemcode",
      stemCodeTitle: props.stemCodeTitle ?? 'Vul je stemcode in',
      stemCodeTitleSuccess: props.stemCodeTitleSuccess ?? 'Vul een andere stemcode in',
      newsLetterTitle: props.newsLetterTitle ?? 'Hou mij op de hoogte',
      panelTitle: props.panelTitle ?? '',
      budgetChosenTitle: props.budgetChosenTitle ?? "Inzendingen gekozen",
      budgetRemainingTitle: props.budgetRemainingTitle ?? "Nog te kiezen",
      overviewTitle: props.overviewTitle ?? "Plannen",
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Weergave opties</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-full grid grid-cols-1 gap-4">

          <div className="w-full grid-cols-4 grid gap-4">

            <FormField
              control={form.control}
              name="step1Tab"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Tab 1 titel</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        onFieldChange(field.name, e.target.value);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="step2Tab"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Tab 2 titel</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        onFieldChange(field.name, e.target.value);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="step3Tab"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Tab 3 titel</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        onFieldChange(field.name, e.target.value);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="step4Tab"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Tab 4 titel</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        onFieldChange(field.name, e.target.value);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <Heading size="lg">Inzendingen overzicht</Heading>
          </div>
          <FormField
            control={form.control}
            name="overviewTitle"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Titel boven het overzicht van alle inzendingen</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Heading size="lg">Stap 1:</Heading>
          <FormField
            control={form.control}
            name="step1Title"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resourceCardTitle"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Titel inzendingen kaart</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="step1Delete"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Tekst voor de knop &apos;Verwijder&apos;</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="step1Add"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Tekst voor de knop &apos;Voeg toe&apos;</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="step1MaxText"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Tekst wanneer het maximaal aantal om te selecteren is bereikt</FormLabel>
                <FormDescription>
                  Voor het type &apos;count&apos; is dit standaard &apos;Maximaal aantal plannen bereikt&apos;. Voor het type &apos;budget&apos; is dit standaard &apos;Onvoldoende budget&apos;.
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Heading size="lg">Stap 2:</Heading>
          <FormField
            control={form.control}
            name="step2Title"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Heading size="lg">Stap 3:</Heading>
          <FormField
            control={form.control}
            name="step3Title"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Titel boven de uitleg</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stemCodeTitle"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Stemcode knop tekst 1</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stemCodeTitleSuccess"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Stemcode knop tekst 2</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Heading size="lg">Stap 4:</Heading>
          <FormField
            control={form.control}
            name="newsLetterTitle"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Nieuws brief titel tekst</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Heading size="lg">Panel teksten:</Heading>
          <FormField
            control={form.control}
            name="panelTitle"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Titel</FormLabel>
                <FormDescription>Het panel wordt bovenin stap 1 en 2 getoond en bevat informatie over wat er is gekozen en hoeveel de gebruiker nog kan kiezen.</FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="budgetChosenTitle"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>&apos;Gekozen&apos; tekst</FormLabel>
                <FormDescription>Hier komt informatie bij te staan over hoeveel er al is gekozen.</FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="budgetRemainingTitle"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>&apos;Nog over&apos; tekst</FormLabel>
                <FormDescription>Hier komt informatie bij te staan over hoeveel er nog gekozen kan worden.</FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-fit col-span-full">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
