import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from "@/components/ui/typography";
import { useWidgetConfig } from "@/hooks/use-widget-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    submitButton: z.string(),
    saveButton: z.string(),
    saveConceptButton: z.string(),
  });

export default function WidgetResourceFormSubmit() {
  type FormData = z.infer<typeof formSchema>;
  const category = "submit";

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    submitButton: widget?.config?.[category]?.submitButton || "",
    saveButton: widget?.config?.[category]?.saveButton || "",
    saveConceptButton: widget?.config?.[category]?.saveConceptButton || "",
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
            Resource Form • Opleveren
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="submitButton"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tekst voor de oplever-knop</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saveButton"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tekst voor de opslaan-knop</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saveConceptButton"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{`Tekst voor de 'opslaan als concept'-knop`}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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