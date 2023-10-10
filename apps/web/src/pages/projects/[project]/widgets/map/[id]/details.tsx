import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from "@/components/ui/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const selectableOptions = [
    {
        id: "facebook",
        label: "Facebook"
    },
    {
        id: "twitter",
        label: "Twitter"
    },
    {
        id: "mail",
        label: "E-mail"
    },
    {
        id: "whatsapp",
        label: "Whatsapp"
    }
]

const formSchema = z.object({
    template: z.string(),
    link: z.string().url(),
    displayShare: z.boolean(),
    selectableOptions: z.string().array()
})

type Props = {
  config?: any;
  handleSubmit?: (config:any) => void
}

export default function WidgetMapDetails({config, handleSubmit}: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        template: config?.details?.template || '<span class="ocs-gray-text">Door </span>{username} <span class="ocs-gray-text"> op </span>{createDate} <span class="ocs-gray-text">&nbsp;&nbsp;|&nbsp;&nbsp;</span> <span class="ocs-gray-text">Thema: </span>{theme}',
        link: config?.details?.link || '',
        displayShare: config?.details?.displayShare || false,
        selectableOptions: config?.details?.selectableOptions || []
      },
    });
  
    function onSubmit(values: z.infer<typeof formSchema>) {
      handleSubmit && handleSubmit({details: values});
    }
  
    return (
      <div>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Map • Idee details
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metadata regel template</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link naar gebruikerspagina</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayShare"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Worden de share buttons weergegeven?
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
            name="selectableOptions"
            render={() => (
                <FormItem>
                    <div>
                        <FormLabel>Selecteer uw gewenste sorteeropties</FormLabel>
                    </div>
                    {selectableOptions.map((item) => (
                        <FormField
                        key={item.id}
                        control={form.control}
                        name="selectableOptions"
                        render={({ field }) => {
                            return (
                                <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked: any) => {
                                            return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                    (value) => value !== item.id
                                                )
                                            )
                                        }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        {item.label}
                                    </FormLabel>
                                </FormItem>
                            )
                        }}
                        />
                    ))}
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