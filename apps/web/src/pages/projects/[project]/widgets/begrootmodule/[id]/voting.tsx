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
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  allowVoting: z.boolean(),
  votingType: z.enum([
    'budgeting',
    'budgetingPerTheme',
    'count',
    'countPerTheme',
  ]),
  maximumSelectableIdeas: z.coerce
    .number()
    .gt(0, 'Nummer moet groter zijn dan 0'),
  minimumSelectableIdeas: z.coerce
    .number()
    .gte(0, 'Nummer moet groter of gelijk zijn aan 0'),
  budget: z.coerce.number().gt(0, 'Nummer moet groter zijn dan 0'),
  minimumBudget: z.coerce.number().gt(0, 'Nummer moet groter zijn dan 0'),
});

export default function BegrootmoduleVoting() {
  const category = 'voting';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    allowVoting: widget?.config?.[category]?.allowVoting || false,
    votingType: widget?.config?.[category]?.votingType || 'budgeting',
    maximumSelectableIdeas:
      widget?.config?.[category]?.maximumSelectableIdeas || 1000,
    minimumSelectableIdeas:
      widget?.config?.[category]?.minimumSelectableIdeas || 0,
    minimumBudget: widget?.config?.[category]?.minimumBudget || 0,
    budget: widget?.config?.[category]?.budget || 0,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateConfig({ [category]: values });
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Stem opties</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-fit grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="allowVoting"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>
                  Sta stemmen toe (werkt momenteel alleen met Gridder)
                </FormLabel>
                <Select
                  onValueChange={(e: string) => field.onChange(e === 'true')}
                  value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Ja</SelectItem>
                    <SelectItem value="false">Nee</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="votingType"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Stem types</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Budgeting" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="budgeting">Budgeting</SelectItem>
                    <SelectItem value="budgetingPerTheme">
                      Budgeting per thema
                    </SelectItem>
                    <SelectItem value="count">Hoeveelheid</SelectItem>
                    <SelectItem value="countPerTheme">
                      Hoeveelheid per thema
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minimumSelectableIdeas"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Minimum hoeveelheid selecteerbare ideeën</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maximumSelectableIdeas"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Maximum hoeveelheid selecteerbare ideeën</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minimumBudget"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Minimum budget om te selecteren</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Beschikbaar budget</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
