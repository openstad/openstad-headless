import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    voting: z.boolean(),
    votingType: z.enum(["budgeting"]),
    maximumSelectableIdeas: z.number().gt(0),
    minimumSelectableIdeas: z.number().gt(0),
    budget: z.number().gt(0),
    minimumBudget: z.number().gt(0),
  });

export default function BegrootmoduleVoting() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        votingType: "budgeting",
        maximumSelectableIdeas: 10000,
        minimumSelectableIdeas: 1,
        budget: 300000,
        minimumBudget: 1,
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
              name="voting"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Enable voting (currently only works with Gridder)
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Yes" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
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
                  <FormLabel>
                    Voting types
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Budgeting" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="budgeting">
                        Budgeting
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
                  <FormLabel>Minimum selectable ideas</FormLabel>
                  <FormControl>
                    <Input placeholder="Min 1" {...field} />
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
                  <FormLabel>Maximum selectable ideas</FormLabel>
                  <FormControl>
                    <Input placeholder="Max 10000" {...field} />
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
                  <FormLabel>
                    Minimum budget that has to be selected
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Min 1" {...field} />
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
                  <FormLabel>Available Budget</FormLabel>
                  <FormControl>
                    <Input placeholder="300000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    );
  }