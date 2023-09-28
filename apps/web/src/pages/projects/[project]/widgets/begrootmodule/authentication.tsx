import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    authEmbedded: z.enum(['no', 'email', 'code', 'sms']),
    scrollBack: z.boolean(),
  });

export default function BegrootmoduleAuthentication() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        authEmbedded: 'no'
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
            name="authEmbedded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Authencatie formulier embedden
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no">Nee</SelectItem>
                    <SelectItem value="email">Email login URL</SelectItem>
                    <SelectItem value="code">Stemcode</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="scrollBack"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Is het mogelijk om terug naar het budgetblok te scrollen wanneer iemand terugkeert van het gebruiken van zijn/haar stemcode in oAuth?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ja" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Yes">Ja</SelectItem>
                    <SelectItem value="No">Nee</SelectItem>
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