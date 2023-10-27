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
import { Input } from "./ui/input";
import { useState } from "react";
import useUser from '../hooks/use-user'
import { useRouter } from "next/router";

const formSchema = z.object({
  email: z.string().email()
});

type FormData = z.infer<typeof formSchema>;

export function CreateUserDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const { createUser } = useUser()

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      email: ''
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createUser(values.email)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus size="20" />
          Gebruiker aanmaken
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Aanmaken van een nieuwe gebruiker</DialogTitle>
              <DialogDescription>
                Geef de e-mail op van de nieuwe gebruiker
              </DialogDescription>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail van de gebruiker</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="E-mail van de gebruiker"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="sticky bottom-0 py-4 bg-background flex flex-col"></div>
            </DialogHeader>
            <DialogFooter>
              <Button disabled={!form.formState.isValid} type="submit">
                Aanmaken
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}