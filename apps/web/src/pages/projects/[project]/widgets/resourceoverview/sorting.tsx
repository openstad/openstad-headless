import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const sorting = [
    {
        id: "newest",
        label: "Nieuwste eerst"
    },
    {
        id: "oldest",
        label: "Oudste eerst"
    },
    {
        id: "random",
        label: "Willekeurig"
    },
    {
        id: "mostLikes",
        label: "Meeste likes"
    },
    {
        id: "leastLikes",
        label: "Minste likes"
    },
    {
        id: "highestCost",
        label: "Meeste reacties"
    },
    {
        id: "lowestCost",
        label: "Minste reacties"
    }
]

const formSchema = z.object({
    displaySorting: z.boolean(),
    defaultSorting: z.enum(['newest', 'oldest', 'random', 'mostLikes', 'leastLikes', 'highestCost', 'lowestCost']),
    sorting: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one item."
    }),
  });

export default function WidgetResourceOverviewSorting() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        defaultSorting: 'newest',
        sorting: []
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
              name="displaySorting"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Sorteeropties weergeven
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
              name="defaultSorting"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Selecteer de standaard manier van sorteren.
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Nieuwste eerst" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="newest">Nieuwste eerst</SelectItem>
                      <SelectItem value="oldest">Oudste eerst</SelectItem>
                      <SelectItem value="random">Willekeurig</SelectItem>
                      <SelectItem value="mostLikes">Meeste likes</SelectItem>
                      <SelectItem value="leastLikes">Minste likes</SelectItem>
                      <SelectItem value="highestCost">Hoogste bedrag</SelectItem>
                      <SelectItem value="lowestCost">Laagste bedrag</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
            control={form.control}
            name="sorting"
            render={() => (
                <FormItem>
                    <div>
                        <FormLabel>Selecteer uw gewenste sorteeropties</FormLabel>
                    </div>
                    {sorting.map((item) => (
                        <FormField
                        key={item.id}
                        control={form.control}
                        name="sorting"
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
          </form>
        </Form>
      </div>
    );
  }