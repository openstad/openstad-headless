import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading, ListHeading, Paragraph } from '@/components/ui/typography';
import UserRoleDropdownList from '@/components/user-role-dropdown-list';
import projectListSwr from '@/hooks/use-project-list';
import useUser from '@/hooks/use-user';
import useUsers from '@/hooks/use-users';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({});

type ProjectRole = {
  projectId: string;
  roleId: string;
};

export default function CreateUserProjects() {
  const { data: projects } = projectListSwr();
  const { data: users, updateUser } = useUser();
  const { createUser } = useUsers();
  const [projectRoles, setProjectRoles] = useState<Array<ProjectRole>>([]);

  useEffect(() => {}, [projects, users]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  const addProject = (projectId: string, roleId: string) => {
    setProjectRoles((prev) => {
      let updated = [...prev];
      const index = updated.findIndex((e) => e.projectId === projectId);

      if (index !== -1) {
        if (roleId === '') {
          updated.splice(index, 1);
        } else {
          updated[index].roleId = roleId;
        }
      } else if (roleId !== '') {
        updated.push({ projectId, roleId });
      }
      return updated;
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let error: any;
    for (let projectRole of projectRoles) {
      let user = users;
      if (Array.isArray(users)) {
        user = users.find(
          (user: any) => user.projectId == projectRole.projectId
        );
      }
      if (user) {
        try {
          await updateUser({
            ...user,
            role: projectRole.roleId,
          });
        } catch (err) {
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
          } catch (err) {
            error = err;
          }
        }
      }
    }

    if (error) {
      toast.error(error.message || 'User kon niet worden bijgewerkt');
    } else {
      toast.success('User is bijgewerkt');
    }
  }

  if (!projects || !users) return null;

  const mergedRoles = Array.isArray(users)
    ? users.map((user: any) => {
        const override = projectRoles.find(
          (pr) => pr.projectId == user.projectId
        );
        return override ? { ...user, role: override.roleId } : user;
      })
    : [users];

  projectRoles.forEach((pr) => {
    if (!mergedRoles.find((u: any) => u.projectId == pr.projectId)) {
      mergedRoles.push({ projectId: pr.projectId, role: pr.roleId });
    }
  });

  const hasEditorRole = mergedRoles.some((item: any) => item.role === 'editor');
  const adminProject = mergedRoles.find((item: any) => item.projectId == 1);
  const isAdminOrEditorInAdminProject =
    adminProject &&
    (adminProject.role === 'admin' || adminProject.role === 'editor');
  const isEditorInAdminProject = adminProject && adminProject.role === 'editor';

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
                  user = users.find(
                    (user: any) => user.projectId == project.id
                  );
                }

                const cannotCreateNewUsers =
                  project?.config?.users?.canCreateNewUsers === false;

                return (
                  <li
                    key={project.id}
                    className="grid grid-cols-1 lg:grid-cols-2 items-center py-3 h-fit hover:bg-secondary-background hover:cursor-pointer border-b border-border">
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

          {hasEditorRole && !isAdminOrEditorInAdminProject && (
            <Alert variant="warning" className="mb-4">
              <AlertTitle>Let op!</AlertTitle>
              <AlertDescription>
                Een gebruiker met de rol <b>editor</b> heeft geen toegang tot
                projecten als deze geen <b>admin</b> of <b>editor</b> is van het
                admin-project.
                <br />
                Voeg de gebruiker toe als <b>admin</b> of <b>editor</b> aan het
                admin-project om toegang te geven tot de admin.
              </AlertDescription>
            </Alert>
          )}

          {isEditorInAdminProject && (
            <Alert variant="info" className="mb-4">
              <AlertTitle>Let op!</AlertTitle>
              <AlertDescription>
                Een <b>editor</b> van het admin-project kan het admin-project
                zelf niet bewerken. Deze rol geeft alleen toegang tot de
                admin-omgeving.
              </AlertDescription>
            </Alert>
          )}

          <Button className="col-span-full w-fit mt-4" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
