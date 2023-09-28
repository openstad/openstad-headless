import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
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
        id: "liked",
        label: "Meeste likes"
    },
    {
        id: "unliked",
        label: "Minste likes"
    },
    {
        id: "ranked",
        label: "Ranglijst"
    },
    {
        id: "expensive",
        label: "Hoogste bedrag"
    },
    {
        id: "cheap",
        label: "Laagste bedrag"
    }
]

const formSchema = z.object({
    sorting: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one item."
    }),
    minimumBudget: z.enum(["random"])
  });

export default function BegrootmoduleSorting() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        sorting: ["random", "expensive", "cheap"]
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
            <FormField
            control={form.control}
            name="minimumBudget"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Minimum budget dat geselecteerd moet worden</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Willekeurig" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="random">Willekeurig</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
            />
          </form>
        </Form>
      </div>
    );
  }