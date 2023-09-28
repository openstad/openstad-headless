import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    title: z.string(),
    placeholder: z.string()
  });

export default function ArgumentsList() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: "Argumenten",
        placeholder: "Nog geen reacties geplaatst."
      },
    });
  
    function onSubmit(values: z.infer<typeof formSchema>) {
      console.log(values);
    }
  
    return (
        <div>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Argumenten • Lijst
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Titel</FormLabel>
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
                    <FormLabel>Placeholder</FormLabel>
                    <FormControl>
                        <Input placeholder="Dit wordt weergegeven wanneer er geen reacties zijn." {...field} />
                    </FormControl>
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