import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/typography";
import { useConfig } from "@/hooks/useConfigHook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    searchLocations: z.enum(['ideasAndAddresses', 'ideas', 'addresses', 'none'])
})

type FormData = z.infer<typeof formSchema>;

export default function WidgetMapFilter() {
  const category = "filter";

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useConfig();

  const defaults = () => ({
    searchLocations: widget?.config?.[category]?.searchLocations || 'ideasAndAddresses'
  });

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error("could not update", error);
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);

    return (
      <div>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Map • Filterbalk
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="searchLocations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Waar wordt in gezocht?
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Zoek in ideeën en adressen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ideasAndAddresses">Zoek in ideeën en adressen</SelectItem>
                      <SelectItem value="ideas">Zoek in ideeën</SelectItem>
                      <SelectItem value="addresses">Zoek in adressen</SelectItem>
                      <SelectItem value="none">Geen zoekveld</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sticky bottom-0 py-4 bg-background border-t border-border flex flex-col">
              <Button className="self-end" type="submit">
                Opslaan
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }