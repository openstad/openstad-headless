import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    showIdeas: z.string(),
    excludeIdeas: z.string(),
    showIdeasFromTheme: z.string()
})

export default function WidgetIdeasMapContent() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
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
              name="showIdeas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Laat alleen de volgende ideeën zien (Vul hier de IDs van ideeën in, gescheiden met komma's):</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="excludeIdeas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Laat geen ideeën zien van de volgende themas (Vul hier de namen van themas in, gescheiden met komma's):</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showIdeasFromTheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Laat alleen ideeën zien van de volgende themas (Vul hier de namen van themas in, gescheiden met komma's):</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    );
  }