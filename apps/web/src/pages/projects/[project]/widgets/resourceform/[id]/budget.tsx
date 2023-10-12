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
    displayBudget: z.coerce.boolean()
  });

export default function WidgetResourceFormBudget() {
  type FormData = z.infer<typeof formSchema>;
    const category = "budget";
  
    const {
      data: widget,
      isLoading: isLoadingWidget,
      updateConfig,
    } = useConfig();
  
    const defaults = () => ({
      displayBudget: widget?.config?.[category]?.displayBudget || false,
    });
  
    async function onSubmit(values: FormData) {
      try {
        await updateConfig({ [category]: values });
      } catch (error) {
        console.error("could not update", error);
      }
    }
  
    const form = useForm<FormData>({
      resolver: zodResolver<any>(formSchema),
      defaultValues: defaults(),
    });
  
    useEffect(() => {
      form.reset(defaults());
    }, [widget]);
  
    return (
        <div>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Resource Form • Budget
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="displayBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Wordt het budget weergegeven aan moderators?
                  </FormLabel>
                  <Select
                    onValueChange={(e: string) => field.onChange(e === "true")}
                    value={field.value ? "true" : "false"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Nee" />
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