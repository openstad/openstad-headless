import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    resource: z.enum(["idea", "article", "activeUser", "resourceUser", "submission"]),
    formName: z.string(),
    redirectUrl: z.string().url(),
    hideAdmin: z.boolean(),
    organiseForm: z.enum(["static", "staticAppended", "dynamic"])
  });

export default function WidgetResourceFormGeneral() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        resource: "idea",
        organiseForm: "static"
      },
    });
  
    function onSubmit(values: z.infer<typeof formSchema>) {
      console.log(values);
    }
  
    return (
        <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="resource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Resource type (vanuit de config)
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Idee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="idea">Idee</SelectItem>
                      <SelectItem value="article">Artikel</SelectItem>
                      <SelectItem value="activeUser">Actieve gebruiker</SelectItem>
                      <SelectItem value="resourceUser">Gebruiker van de resource</SelectItem>
                      <SelectItem value="submission">Oplevering</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="formName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naam formulier. Deze moet uniek zijn binnen dit project.</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="redirectUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>De URL waar de gebruiker naartoe wordt geleid na het invullen van het formulier.</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hideAdmin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Wordt de admin verborgen van het project na de eerste publieke actie?
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ja" />
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
              name="organiseForm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hoe moeten de velden van het formulier opgesteld worden?
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Statisch (default optie)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="static">Statisch (default optie)</SelectItem>
                      <SelectItem value="staticAppended">Statisch, met dynamische velden toegevoegd</SelectItem>
                      <SelectItem value="dynamic">Dynamisch</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    );
  }