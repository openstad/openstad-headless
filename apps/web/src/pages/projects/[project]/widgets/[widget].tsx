import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PageLayout } from "@/components/ui/page-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    voting: z.enum(["yes", "no"]),
    votingType: z.enum(["budgeting"]),
    maximumSelectableIdeas: z.number().gt(0),
    minimumSelectableIdeas: z.number().gt(0),
    budget: z.number().gt(0),
    minimumBudget: z.number().gt(0)
})

export default function WidgetDetails() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            voting: "yes",
            votingType: "budgeting",
            maximumSelectableIdeas: 10000,
            minimumSelectableIdeas: 1,
            budget: 300000,
            minimumBudget: 1
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return (
        <div>
          <PageLayout
          pageHeader="Project naam"
          breadcrumbs={[
            {
              name: 'Projecten',
              url: '/projects',
            },
            {
                name: 'Widgets',
                url: '/projects/1/widgets'
            },
            {
                name: 'Widget',
                url: '/projects/1/widgets/widget'
            }
          ]}
          >
            <div className="pl-4 pr-4 pt-4">
                <Button variant={"create"} className="float-right">Save</Button>
                <Tabs defaultValue="voting" className="">
                    <TabsList>
                        <TabsTrigger value="voting">Voting options</TabsTrigger>
                        <TabsTrigger value="display">Display options</TabsTrigger>
                        <TabsTrigger value="sorting">Sorting options</TabsTrigger>
                        <TabsTrigger value="explanation">Explanation texts</TabsTrigger>
                        <TabsTrigger value="authentication">Authentication</TabsTrigger>
                        <TabsTrigger value="labels">Labels</TabsTrigger>
                    </TabsList>
                    <TabsContent value="voting" className="w-1/2">
                        <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                                <FormField
                                control={form.control}
                                name="voting"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Enable voting (currently only works with Gridder)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Yes" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="yes">Yes</SelectItem>
                                                <SelectItem value="no">No</SelectItem>
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
                                        <FormLabel>Enable voting (currently only works with Gridder)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Budgeting" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="budgeting">Budgeting</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                            <Input placeholder='Max 10000' {...field} />
                                        </FormControl>
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
                                            <Input placeholder='Min 1' {...field} />
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
                                            <Input placeholder='300000' {...field} />
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
                                        <FormLabel>Minimum budget that has to be selected</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Min 1' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </form>
                        </Form>
                        </div>
                    </TabsContent>
                    <TabsContent value="display">Text 2</TabsContent>
                    <TabsContent value="sorting"></TabsContent>
                    <TabsContent value="explanation"></TabsContent>
                    <TabsContent value="authentication"></TabsContent>
                    <TabsContent value="labels"></TabsContent>
                </Tabs>
            </div>
          </PageLayout>
        </div>
    )
}