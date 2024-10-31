import React, {useEffect, useState} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import projectListSwr from '@/hooks/use-project-list';
import useUser from '@/hooks/use-user';
import useUsers from '@/hooks/use-users';
import { Form } from '@/components/ui/form';
import { Heading, ListHeading, Paragraph } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import UserRoleDropdownList from '@/components/user-role-dropdown-list';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const formSchema = z.object({
});

type ProjectRole = {
  projectId: string;
  roleId: string;
};

export default function CreateUserProjects() {

  let projectRoles: Array<ProjectRole> = [];
  const { data:projects } = projectListSwr();
  const { data:users, updateUser } = useUser();
  const { createUser } = useUsers();

  useEffect(() => {
  }, [projects, users]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  const addProject = (projectId: string, roleId: string) => {
    if (projectRoles.find((e) => e.projectId === projectId)) {
      if (roleId === '') {
        projectRoles = projectRoles.filter(function (project) {
          return project.projectId !== projectId;
        });
      } else {
        let role = projectRoles.findIndex((obj) => obj.projectId == projectId);
        projectRoles[role].roleId = roleId;
      }
    } else {
      if (roleId !== '') {
        projectRoles.push({ projectId: projectId, roleId: roleId });
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {

    let error:any;
    for (let projectRole of projectRoles) {

      let user = users;
      if (Array.isArray(users)) {
        user = users.find((user:any) => user.projectId == projectRole.projectId);
      }
      if (user) {
        try {
          await updateUser({
            ...user,
            role: projectRole.roleId,
          })
        } catch(err) {
          error = err;
        }
      } else {
        user = users[0];
        if (user.idpUser?.identifier && user.idpUser?.provider) {
          try {
            await createUser({
              idpUser: user.idpUser,
              projectId: projectRole.projectId,
              role: projectRole.roleId,
            });
          } catch(err) {
            error = err;
          }
        }
      }
    }

    if (error) {
      toast.error(error.message || 'User kon niet worden bijgewerkt')
    } else {
      toast.success('User is bijgewerkt')
    }

  }

  if (!projects || !users) return null;

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
              {projects.map((project: any) => {
                let user;
                if (!Array.isArray(users)) {
                  user = users;
                  if (user.projectId != project.id) {
                    return;
                  }
                } else {
                  user = users.find((user:any) => user.projectId == project.id);
                }

                const cannotCreateNewUsers = project?.config?.users?.canCreateNewUsers === false;

                return (
                  <li key={project.id} className="grid grid-cols-1 lg:grid-cols-2 items-center py-3 h-fit hover:bg-secondary-background hover:cursor-pointer border-b border-border">
                    <Paragraph className="truncate">{project.name}</Paragraph>
                    <Paragraph className="truncate">
                      <UserRoleDropdownList
                        roleId={user?.role || ''}
                        addProject={(roleId) => {
                          addProject(project.id, roleId);
                        }}
                        disabled={cannotCreateNewUsers}
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
