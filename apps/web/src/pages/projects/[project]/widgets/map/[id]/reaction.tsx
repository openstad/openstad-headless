import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    displayReactions: z.boolean(),
    title: z.string(),
    textEmptyInput: z.string(),
    textAboveInput: z.string(),
    idNonActiveReactions: z.string(),
    reactionsAvailable: z.enum(['open', 'closed', 'limited'])
})

type Props = {
  config?: any;
  handleSubmit?: (config:any) => void
}

export default function WidgetMapReaction({config, handleSubmit}: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        reactionsAvailable: config?.reaction?.reactionsAvailable || 'open',
        displayReactions: config?.reaction?.displayReactions || false,
        title: config?.reaction?.title || '',
        textEmptyInput: config?.reaction?.textEmptyInput || '',
        textAboveInput: config?.reaction?.textAboveInput || '',
        idNonActiveReactions: config?.reaction?.idNonActiveReactions || '',
      },
    });
  
    function onSubmit(values: z.infer<typeof formSchema>) {
      handleSubmit && handleSubmit({reaction: values});
    }
  
    return (
      <div>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Map • Reacties
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="displayReactions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Weergave
                  </FormLabel>
                  <Select
                    onValueChange={(e:string) => field.onChange(e === 'true')}
                    defaultValue={field.value ? "true": "false"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ja" />
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title boven de reacties</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="textEmptyInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tekst in lege inputveld</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="textAboveInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tekst boven inputveld</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="idNonActiveReactions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IDs van ideeën waar reacties niet actief voor zijn.</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reactionsAvailable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reacties staan...
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="... open voor alle ideeën" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="open">... open voor alle ideeën.</SelectItem>
                      <SelectItem value="closed">... gesloten voor alle ideeën.</SelectItem>
                      <SelectItem value="limited">... open voor sommige ideeën.</SelectItem>
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