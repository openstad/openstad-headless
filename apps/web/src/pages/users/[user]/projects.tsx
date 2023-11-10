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
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Projectsrechten</Heading>
        <Separator className="my-4" />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="ml-1">
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 items-center lg:py-2 lg:border-b border-border gap-4">
              <ListHeading className="hidden lg:flex">Projectnaam</ListHeading>
              <ListHeading className="hidden lg:flex">Rol</ListHeading>
            </div>
            <ul>
              {data.map((project: any) => {
                return (
                  <li className="grid grid-cols-1 lg:grid-cols-2 items-center py-3 h-fit hover:bg-secondary-background hover:cursor-pointer border-b border-border">
                    <Paragraph className="truncate">{project.name}</Paragraph>
                    <Paragraph className="truncate">
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
          <Button className="col-span-full w-fit mt-4" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
