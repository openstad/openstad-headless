import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    voting: z.boolean(),
    votingType: z.enum(['budgeting', 'budgetingPerTheme', 'count', 'countPerTheme']),
    maximumSelectableIdeas: z.number().gt(0),
    minimumSelectableIdeas: z.number().gte(0),
    budget: z.number().gt(0),
    minimumBudget: z.number().gt(0),
  });

export default function BegrootmoduleVoting() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        votingType: "budgeting",
        maximumSelectableIdeas: 1000,
        minimumSelectableIdeas: 0,
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
                    Sta stemmen toe (werkt op het moment alleen met Gridder)
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
                      <SelectItem value="budgetingPerTheme">
                        Budgeting per thema
                      </SelectItem>
                      <SelectItem value="count">
                        Hoeveelheid
                      </SelectItem>
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
                  <FormLabel>
                    Minimum budget om te selecteren
                  </FormLabel>
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
          </form>
        </Form>
      </div>
    );
  }