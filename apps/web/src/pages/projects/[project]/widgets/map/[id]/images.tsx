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
    multipleImages: z.boolean(),
    aspectRatio: z.enum(['16:9', '1:1']),
    defaultImage: z.string()
})


type Props = {
  config?: any;
  handleSubmit?: (config:any) => void
}
export default function WidgetMapImage({config, handleSubmit}: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        multipleImages: config?.image?.multipleImages || false,
        aspectRatio: config?.image?.aspectRatio || '16:9',
        defaultImage: config?.image?.defaultImage || '',
      },
    });
  
    function onSubmit(values: z.infer<typeof formSchema>) {
      handleSubmit && handleSubmit({image: values});
    }
  
    return (
      <div>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Map • Idee afbeeldingen
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="multipleImages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Meerdere afbeeldingen bij één idee?
                  </FormLabel>
                  <Select
                     onValueChange={(e:string) => field.onChange(e === 'true')}
                     defaultValue={field.value ? "true": "false"}>
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
              name="aspectRatio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Aspect ratio
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="16:9" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="16:9">16:9</SelectItem>
                      <SelectItem value="1:1">1:1</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default afbeelding</FormLabel>
                  <FormControl>
                    <Input type="file" {...field} />
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