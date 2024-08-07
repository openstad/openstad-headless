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
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  step1Title: z.string(),
  resourceCardTitle: z.string(),
  step2Title: z.string(),
  stemCodeTitle: z.string(),
  stemCodeTitleSuccess: z.string(),
  newsLetterTitle: z.string(),
  panelTitle: z.string(),
  budgetChosenTitle: z.string(),
  budgetRemainingTitle: z.string(),
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
      step1Title: props.step1Title || 'Uw selecties',
      resourceCardTitle: props.resourceCardTitle || 'Selecteer een plan',
      step2Title: props.step2Title || 'Overzicht van mijn selectie',
      stemCodeTitle: props.stemCodeTitle || 'Vul je stemcode in',
      stemCodeTitleSuccess: props.stemCodeTitleSuccess || 'Vul een andere stemcode in',
      newsLetterTitle: props.newsLetterTitle || 'Hou mij op de hoogte',
      panelTitle: props.panelTitle,
      budgetChosenTitle: props.budgetChosenTitle,
      budgetRemainingTitle: props.budgetRemainingTitle,
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Weergave opties</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/2 grid grid-cols-1 gap-4">

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
                <FormLabel>Titel plannen kaart</FormLabel>
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
                <FormLabel>Regel 1</FormLabel>
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
                <FormLabel>Regel 2</FormLabel>
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
