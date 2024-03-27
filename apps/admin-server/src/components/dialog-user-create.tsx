import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { useState } from 'react';
import useUsers from '../hooks/use-users';
import { useRouter } from 'next/router';
import projectListSwr from '@/hooks/use-project-list';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import toast from 'react-hot-toast';

const formSchema = z.object({
  email: z.string().email(),
  projectId: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateUserDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const { data, isLoading } = projectListSwr();
  const { createUser } = useUsers();

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      email: '',
    },
  });

  if (!data) return null;

  async function onSubmit(values: FormData) {
    try {
      const user = await createUser(values.email, values.projectId);
      setOpen(false);
      if (user) {
        toast.success('Gebruiker aangemaakt!');
        router.push(router.asPath + `/${user.id}`);
      }
    } catch (error) {
      toast.error('Gebruiker kon niet worden aangemaakt!');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex w-fit">
          <Plus size="20" className="hidden lg:flex" />
          Gebruiker toevoegen
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
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Basisproject (Een gebruiker moet altijd één project
                      hebben.)
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer een project." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {data?.map((project: any) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail van de gebruiker</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="E-mail van de gebruiker" />
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
