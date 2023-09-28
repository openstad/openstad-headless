import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    labelOpen: z.string(),
    labelClosed: z.string(),
    labelAccepted: z.string(),
    labelDenied: z.string(),
    labelBusy: z.string(),
    labelDone: z.string(),
  });

export default function BegrootmoduleLabels() {
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
            control={form.control}
            name="labelOpen"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Label voor foto: OPEN</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="labelClosed"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Label voor foto: GESLOTEN</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="labelAccepted"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Label voor foto: GEACCEPTEERD</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="labelDenied"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Label voor foto: AFGEWEZEN</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="labelBusy"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Label voor foto: BEZIG</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="labelDone"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Label voor foto: AFGEROND</FormLabel>
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