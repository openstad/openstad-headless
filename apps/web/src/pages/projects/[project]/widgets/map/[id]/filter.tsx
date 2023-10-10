import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    searchLocations: z.enum(['ideasAndAddresses', 'ideas', 'addresses', 'none'])
})

type Props = {
  config?: any;
  handleSubmit?: (config:any) => void
}
export default function WidgetMapFilter({config, handleSubmit}: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        searchLocations: config?.filter?.searchLocations || 'ideasAndAddresses'
      },
    });
  
    function onSubmit(values: z.infer<typeof formSchema>) {
      handleSubmit && handleSubmit({filter: values});
    }
  
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
                    defaultValue={field.value}
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