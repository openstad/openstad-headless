import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    intro: z.string(),
    placeholder: z.string()
  });

export default function ArgumentsForm() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        placeholder: "Type hier uw reactie."
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
            name="intro"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Formulier intro</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="placeholder"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Placeholder tekst</FormLabel>
                    <FormControl>
                        <Input placeholder="Dit wordt weergegeven wanneer er nog niets is ingevuld door de gebruiker." {...field} />
                    </FormControl>
                </FormItem>
            )}
            />
          </form>
        </Form>
      </div>
    );
  }