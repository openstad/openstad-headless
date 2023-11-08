import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import projectListSwr from '@/hooks/use-project-list';
import useUsers from '@/hooks/use-users';
import { Form } from '@/components/ui/form';
import { Heading, ListHeading, Paragraph } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import DropdownList from '@/components/dropdown-list';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email(),
});

type ProjectRole = {
  projectId: string;
  roleId: string;
};

export default function CreateUserProjects() {
  let projectRoles: Array<ProjectRole> = [];
  const { data, isLoading } = projectListSwr();
  const { createUser } = useUsers();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  const addProject = (projectId: string, roleId: string) => {
    if (projectRoles.find((e) => e.projectId === projectId)) {
      if (roleId === '0') {
        projectRoles = projectRoles.filter(function (project) {
          return project.projectId !== projectId;
        });
      } else {
        let role = projectRoles.findIndex((obj) => obj.projectId == projectId);
        projectRoles[role].roleId = roleId;
      }
    } else {
      if (roleId !== '0') {
        projectRoles.push({ projectId: projectId, roleId: roleId });
      }
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    for (let i = 0; i < projectRoles.length; i++) {
      createUser(
        values.email,
        projectRoles[i].projectId,
        projectRoles[i].roleId
      );
    }
  }

  if (!data) return null;

  return (
    <div>
      <Form {...form}>
        <Heading size="xl" className="mb-4">
          Gebruiker • Projectsrechten
        </Heading>
        <Separator className="mb-4" />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="container mx-auto">
            <div className="mt-4 grid grid-cols-2 items-center py-2 border-b border-border">
              <ListHeading className="hidden md:flex">Projectnaam</ListHeading>
              <ListHeading className="hidden md:flex">Rol</ListHeading>
            </div>
            <ul>
              {data.map((project: any) => {
                return (
                  <li className="grid grid-cols-2 items-center py-3 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2">
                    <Paragraph className="hidden md:flex">
                      {project.name}
                    </Paragraph>
                    <Paragraph className="hidden md:flex">
                      <DropdownList
                        roleId="0"
                        addProject={(roleId) => {
                          addProject(project.id, roleId);
                        }}
                      />
                    </Paragraph>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="py-4 bg-background border-t border-border flex flex-col">
            <Button className="self-end" type="submit">
              Opslaan
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
