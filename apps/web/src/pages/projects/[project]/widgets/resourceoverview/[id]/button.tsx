import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/typography";
import { useConfig } from "@/hooks/useConfigHook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    textHoverImage: z.string(),
    textVoteButton: z.string(),
    fieldUsedForTitle: z.string()
  });

export default function WidgetResourceOverviewButton() {
  type FormData = z.infer<typeof formSchema>;
    const category = "button";
  
    const {
      data: widget,
      isLoading: isLoadingWidget,
      updateConfig,
    } = useConfig();
  
    const defaults = () => ({
      textHoverImage: widget?.config?.[category]?.textHoverImage || "",
      textVoteButton :widget?.config?.[category]?.textVoteButton || "",
      fieldUsedForTitle: widget?.config?.[category]?.fieldUsedForTitle || "",
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
            Resource Overview • Knop teksten
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
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