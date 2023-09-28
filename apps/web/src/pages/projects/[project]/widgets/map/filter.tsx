import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    searchLocations: z.enum(['ideasAndAddresses', 'ideas', 'addresses', 'none'])
})

export default function WidgetMapFilter() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        searchLocations: 'ideasAndAddresses'
      },
    });
  
    function onSubmit(values: z.infer<typeof formSchema>) {
      console.log(values);
    }
  
    return (
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
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
          </form>
        </Form>
      </div>
    );
  }