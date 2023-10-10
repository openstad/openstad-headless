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
import { useConfig } from "@/hooks/useConfigHook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  allowVoting: z.boolean(),
  votingType: z.enum([
    "budgeting",
    "budgetingPerTheme",
    "count",
    "countPerTheme",
  ]),
  maximumSelectableIdeas: z.coerce
    .number()
    .gt(0, "Nummer moet groter zijn dan 0"),
  minimumSelectableIdeas: z.coerce
    .number()
    .gte(0, "Nummer moet groter of gelijk zijn aan 0"),
  budget: z.coerce.number().gt(0, "Nummer moet groter zijn dan 0"),
  minimumBudget: z.coerce.number().gt(0, "Nummer moet groter zijn dan 0"),
});

export default function BegrootmoduleVoting() {
  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useConfig();

  const defaults = () => ({
    allowVoting: widget?.config?.voting?.allowVoting || false,
    votingType: widget?.config?.voting?.votingType || "budgeting",
    maximumSelectableIdeas:
      widget?.config?.voting?.maximumSelectableIdeas || 1000,
    minimumSelectableIdeas: widget?.config?.voting?.minimumSelectableIdeas || 0,
    minimumBudget: widget?.config?.voting?.minimumBudget || 0,
    budget: widget?.config?.voting?.budget || 0,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateConfig({ voting: values });
  }

  return (
    <Form {...form}>
      <Heading size="xl" className="mb-4">
        Begrootmodule • Stem opties
      </Heading>
      <Separator className="mb-4" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="allowVoting"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Sta stemmen toe (werkt op het moment alleen met Gridder)
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
          name="votingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voting types</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Budgeting" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="budgeting">Budgeting</SelectItem>
                  <SelectItem value="budgetingPerTheme">
                    Budgeting per thema
                  </SelectItem>
                  <SelectItem value="count">Hoeveelheid</SelectItem>
                  <SelectItem value="countPerTheme">
                    Hoeveelheid per thema
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="minimumSelectableIdeas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum hoeveelheid selecteerbare ideeën</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maximumSelectableIdeas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum hoeveelheid selecteerbare ideeën</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="minimumBudget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum budget om te selecteren</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschikbaar budget</FormLabel>
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
  );
}
