import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/typography";
import { useConfig } from "@/hooks/useConfigHook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    display: z.enum(['simple', 'full']),
    name: z.string(),
    submissionField: z.enum(['ideaType', 'theme']),
    filterLabel: z.string(),
    mobileCase: z.boolean()
});

type FormData = z.infer<typeof formSchema>;

export default function WidgetMapGeneral() {
  const category = "general";

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useConfig();

  const defaults = () => ({
    display: widget?.config?.[category]?.display || 'full',
    name: widget?.config?.[category]?.name || 'Inzending',
    submissionField: widget?.config?.[category]?.submissionField ||'theme',
    filterLabel: widget?.config?.[category]?.filterLabel || "Alle thema's"
  });

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error("could not update", error);
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);


    return (
      <div>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Map • Algemeen
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="display"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Weergave
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Volledig" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="simple">Simpel</SelectItem>
                      <SelectItem value="full">Volledig</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naam van het idee</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="submissionField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type inzending
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Volledig" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ideaType">Idee type</SelectItem>
                      <SelectItem value="theme">Thema</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="filterLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label voor type in filters</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobileCase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Opent op mobiel de lijst van ideeën over de kaart heen?
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Nee" />
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