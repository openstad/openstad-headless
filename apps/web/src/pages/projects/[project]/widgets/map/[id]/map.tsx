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
    variant: z.enum(['NLMaps', 'Amsterdam', 'OpenStreetMaps', 'advanced']),
    zoom: z.enum(['none', 'markers', 'area']),
    defaultLocation: z.string(),
    clustering: z.boolean(),
    clusteringSensitivity: z.coerce.number(),
    clickingChoosesLocation: z.boolean(),
    mapIcon: z.enum(['select', 'details'])
})

type Props = {
  config?: any;
  handleSubmit?: (config:any) => void
}
export default function WidgetMapMap({config, handleSubmit}: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        variant: config?.map?.variant || 'NLMaps',
        zoom: config?.map?.zoom || 'none',
        defaultLocation: config?.map?.defaultLocation || '',
        clustering: config?.map?.clustering || false,
        clusteringSensitivity: config?.map?.clusteringSensitivity || 40,
        clickingChoosesLocation: config?.map?.clickingChoosesLocation || false,
        mapIcon:config?.map?.mapIcon || 'select'
      },
    });
  
    function onSubmit(values: z.infer<typeof formSchema>) {
      handleSubmit && handleSubmit({map: values});
    }
  
    return (
      <div>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Map • Kaart
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="variant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Variant
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="NLMaps" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NLMaps">NLMaps</SelectItem>
                      <SelectItem value="Amsterdam">Amsterdam</SelectItem>
                      <SelectItem value="OpenStreetMaps">OpenStreetMaps</SelectItem>
                      <SelectItem value="advanced">Geavanceerd</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zoom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Zoom en center
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Niet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Niet</SelectItem>
                      <SelectItem value="markers">Op markers</SelectItem>
                      <SelectItem value="area">Op gebied</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Location icon</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clustering"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Clustering actief?
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
              name="clusteringSensitivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gevoeligheid van clustering</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clickingChoosesLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Op de kaart klikken selecteert een locatie?
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
              name="mapIcon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Op een kaart icon klikken:
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteert een idee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="select">Selecteert een idee</SelectItem>
                      <SelectItem value="details">Toon idee details</SelectItem>
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