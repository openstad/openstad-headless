import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/typography";
import { useWidgetConfig } from "@/hooks/use-widget-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  displayCounter: z.boolean(),
  counterText: z.string(),
  counterUrl: z.string().url(),
});

export default function WidgetIdeasMapCounter() {
  const category = 'counter';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    displayCounter: widget?.config?.[category]?.displayCounter || false,
    counterText: widget?.config?.[category]?.counterText || "",
    counterUrl: widget?.config?.[category]?.counterUrl || "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateConfig({ [category]: values });
  }

  return (
    <div>
      <Form {...form}>
        <Heading size="xl" className="mb-4">
          Ideeën Map • Teller
        </Heading>
        <Separator className="mb-4" />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="displayCounter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wordt de teller weergegeven?</FormLabel>
                <Select
                  onValueChange={(e: string) => field.onChange(e === "true")}
                  value={field.value ? "true" : "false"}
                >
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
            name="counterText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teller tekst</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="counterUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teller URL</FormLabel>
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
