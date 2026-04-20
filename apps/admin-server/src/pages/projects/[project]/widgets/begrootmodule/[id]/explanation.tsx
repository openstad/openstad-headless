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
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { useProject } from '@/hooks/use-project';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  step0: z.string().optional(),
  step1: z.string().optional(),
  step2: z.string().optional(),
  step3: z.string().optional(),
  step3success: z.string().optional(),
  voteMessage: z.string().optional(),
  thankMessage: z.string().optional(),
  showNewsletterButton: z.boolean().optional(),
});

type Formdata = z.infer<typeof formSchema>;

export default function BegrootmoduleExplanation(
  props: StemBegrootWidgetProps & EditFieldProps<StemBegrootWidgetProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);
  const { data } = useProject();

  function onSubmit(values: Formdata) {
    props.updateConfig({ ...props, ...values });
  }

  const voteType = data?.config?.votes?.voteType || 'likes';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      step0: props.step0 ?? '',
      step1: props.step1 ?? '',
      step2: props.step2 ?? '',
      step3: props.step3 ?? '',
      step3success: props.step3success ?? '',
      voteMessage: props.voteMessage ?? '',
      thankMessage: props.thankMessage ?? '',
      showNewsletterButton: props.showNewsletterButton ?? false,
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Authenticatie</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/2 grid grid-cols-1 gap-4">
          {(voteType === 'countPerTag' || voteType === 'budgetingPerTag') && (
            <FormField
              control={form.control}
              name="step0"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Stap 0: Stemmen / budget per thema intro
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
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
          )}

          <FormField
            control={form.control}
            name="step1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stap 1: Intro</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
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
            name="step2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stap 2: Intro</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
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
            name="step3"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stap 3: Intro</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
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
            name="step3success"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Succesvolle authenticatie</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
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
            name="voteMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Succesvol gestemd bericht</FormLabel>
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
            name="thankMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedankt bericht</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
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
            name="showNewsletterButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Wordt de nieuwsbrief knop weergegeven na het stemmen?
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
