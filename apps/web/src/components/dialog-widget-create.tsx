import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

import useSWR from "swr";
import { useProject } from "@/hooks/useProjectHook";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { useState } from "react";
import { useWidgetsHook } from "@/hooks/use-widgets-hook";

type Props = {
  projectId?: string;
};

const minDescription = 4;
const maxDescription = 255;

const formSchema = z.object({
    description: z
    .string()
    .min(
      minDescription,
      `De beschrijving van de widget moet uit minimaal ${minDescription} karakters bestaan`
    )
    .max(
      maxDescription,
      `Maximaal ${maxDescription} karakters voor widget beschrijvingen zijn toegestaan`
    ),
  type: z.string(),
});

type FormData = z.infer<typeof formSchema>;
export function CreateWidgetDialog({ projectId }: Props) {
  const [open, setOpen] = useState<boolean>(false);

  const { data: widgetTypes, isLoading } = useSWR(
    `/api/openstad/api/widget-types`
  );

  const { createWidget } = useWidgetsHook(projectId);


  async function onSubmit(values: FormData) {
        if(!projectId) return;
        try {
              await createWidget(values.type, values.description);
              setOpen(false);
          } catch (error) {
              console.error("could not create widget", error);
          }
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
    description: "",
      type: "1",
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus size="20" />
          Widget toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Aanmaken van een nieuwe widget</DialogTitle>
              <DialogDescription>
                Voer de naam in van de widget en selecteer het type
              </DialogDescription>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Widget type:</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={Number.parseInt(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer een type widget" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {widgetTypes?.map((type: any) => {
                          return (
                            <SelectItem key={type.id} value={type.id}>
                              {type.visibleName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschrijving/naam van de widget</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="De identificeerbare naam van de widget"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="sticky bottom-0 py-4 bg-background flex flex-col"></div>
            </DialogHeader>
            <DialogFooter>
              <Button disabled={!form.formState.isValid} type="submit">Aanmaken</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
