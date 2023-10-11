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
    sentiment: z.enum(["for", "against", "none"]),
    replyReactions: z.boolean(),
    voteReactions: z.boolean()
  });

export default function ArgumentsGeneral() {
  const category = 'general';

  const { data: widget, isLoading: isLoadingWidget, updateConfig } = useConfig();
  
    const defaults = () =>({  
      sentiment: widget?.config?.[category]?.sentiment || "for",
      replyReactions: widget?.config?.[category]?.replyReactions || false,
      voteReactions: widget?.config?.[category]?.voteReactions || false
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: defaults()
    });

    useEffect(() => {     
        form.reset(defaults());
    }, [widget])

    
    function onSubmit(values: z.infer<typeof formSchema>) {
      updateConfig({[category]: values});
    }
  
    return (
        <div>

          <pre>
        { JSON.stringify(form.getValues()) }

          </pre>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Argumenten • Algemeen
          </Heading>
          <Separator className="mb-4" />
          
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4">
            <FormField
            control={form.control}
            name="sentiment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Sentiment
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Voor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="for">Voor</SelectItem>
                    <SelectItem value="against">Tegen</SelectItem>
                    <SelectItem value="none">Geen sentiment</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="replyReactions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                    Is het toegestaan om te reageren op reacties?
                </FormLabel>
                <Select
                  onValueChange={(e:string) => field.onChange(e === 'true')}
                  value={field.value ? "true":"false"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ja" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='true'>Ja</SelectItem>
                    <SelectItem value='false'>Nee</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="voteReactions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                    Is het mogelijk om te stemmen op reacties?
                </FormLabel>
                <Select
                  onValueChange={(e:string) => field.onChange(e === 'true')}
                  value={field.value ? "true":"false"}>

                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ja" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                  <SelectItem value='true'>Ja</SelectItem>
                    <SelectItem value='false'>Nee</SelectItem>
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