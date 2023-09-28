import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from "@/components/ui/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    noSelectionLoggedInHTML: z.string(),
    noSelectionNotLoggedInHTML: z.string(),
    showNoSelectionBlock: z.boolean(),
    selectionActiveLoggedInHTML: z.string(),
    selectionInactiveLoggedInHTML: z.string(),
    mobilePreviewLoggedInHTML: z.string(),
    selectionActiveNotLoggedInHTML: z.string(),
    selectionInactiveNotLoggedInHTML: z.string(),
    mobilePreviewNotLoggedInHTML: z.string(),
})

export default function WidgetMapContent() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
      },
    });
  
    function onSubmit(values: z.infer<typeof formSchema>) {
      console.log(values);
    }
  
    return (
      <div>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Map • Content
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="noSelectionLoggedInHTML"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>noSelectionLoggedInHTML</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="noSelectionNotLoggedInHTML"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>noSelectionNotLoggedInHTML</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showNoSelectionBlock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Weergave
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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
            <FormField
              control={form.control}
              name="selectionActiveLoggedInHTML"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>selectionActiveLoggedInHTML</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="selectionInactiveLoggedInHTML"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>selectionInactiveLoggedInHTML</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobilePreviewLoggedInHTML"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>mobilePreviewLoggedInHTML</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="selectionActiveNotLoggedInHTML"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>selectionActiveNotLoggedInHTML</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="selectionInactiveNotLoggedInHTML"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>selectionInactiveNotLoggedInHTML</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobilePreviewNotLoggedInHTML"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>mobilePreviewNotLoggedInHTML</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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