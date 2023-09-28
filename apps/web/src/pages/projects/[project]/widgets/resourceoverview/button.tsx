import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    textHoverImage: z.string(),
    textVoteButton: z.string(),
    fieldUsedForTitle: z.string()
  });

export default function WidgetResourceOverviewButton() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        fieldUsedForTitle: 'title'
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
              name="textHoverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tekst die weergegeven wordt als iemand over een afbeelding hovert</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="textVoteButton"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tekst die weergegeven wordt in de stem knoppen van een open idee</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fieldUsedForTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veld dat gebruikt wordt als titel van een idee.</FormLabel>
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