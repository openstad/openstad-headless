import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/typography";
import { useWidgetConfig } from "@/hooks/use-widget-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    displayTagFilters: z.boolean(),
    displayType: z.string().optional(),
    displayGroupType: z.boolean()
  });

export default function WidgetResourceOverviewTags() {
  type FormData = z.infer<typeof formSchema>;
  const category = "tags";

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    displayTagFilters: widget?.config?.[category]?.displayTagFilters || false,
    displayType: widget?.config?.[category]?.displayType || "",
    displayGroupType: widget?.config?.[category]?.displayGroupType || false,
  });

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error("could falset update", error);
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
            Resource Overview • Tags
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="displayTagFilters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Wordt het filteren op tags weergegeven?
                  </FormLabel>
                  <Select
                    onValueChange={(e: string) => field.onChange(e === "true")}
                    value={field.value ? "true" : "false"}
                  >
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
            <FormField
              control={form.control}
              name="displayType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Laat alleen de volgende tags zien (indien ingevuld):</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayGroupType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Als er geen tag type geselecteerd is, moet de typename dan weergegeven worden per groep?
                  </FormLabel>
                  <Select
                    onValueChange={(e: string) => field.onChange(e === "true")}
                    value={field.value ? "true" : "false"}
                  >
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