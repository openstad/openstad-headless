import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { useRegisterSave } from '@/components/ui/save-controller';
import { Separator } from '@/components/ui/separator';
import { Heading, ListHeading, Paragraph } from '@/components/ui/typography';
import UserRoleDropdownList from '@/components/user-role-dropdown-list';
import projectListSwr from '@/hooks/use-project-list';
import useUser from '@/hooks/use-user';
import useUsers from '@/hooks/use-users';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({});

type ProjectRole = {
  projectId: string;
  roleId: string;
};

type EmailNotificationConsent = {
  projectId: string;
  consent: boolean;
};

type CombinedProjectRoleAndConsent = {
  projectId: string;
  roleId?: string;
  consent?: boolean;
};

export default function CreateUserProjects() {
  const { data: projects } = projectListSwr();
  const { data: users, updateUser, mutate } = useUser();
  const { createUser } = useUsers();
  const [projectRoles, setProjectRoles] = useState<Array<ProjectRole>>([]);
  const [emailNotificationConsents, setEmailNotificationConsents] = useState<
    Array<EmailNotificationConsent>
  >([]);

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
          updated[index] = { ...updated[index], roleId };
        }
      } else if (roleId !== '') {
        updated.push({ projectId, roleId });
      }
      return updated;
    });
  };

  const addEmailNotificationConsent = (projectId: string, consent: boolean) => {
    setEmailNotificationConsents((prev) => {
      let updated = [...prev];
      const index = updated.findIndex((e) => e.projectId === projectId);

      if (index !== -1) {
        updated[index] = { ...updated[index], consent };
      } else {
        updated.push({ projectId, consent });
      }
      return updated;
    });
  };

  const save = useCallback(async () => {
    let error: any;

    const mergedProjects: CombinedProjectRoleAndConsent[] = [
      ...projectRoles,
      ...emailNotificationConsents,
    ];

    for (let updateValue of mergedProjects) {
      let user = users;
      if (Array.isArray(users)) {
        user = users.find(
          (user: any) => user.projectId == updateValue.projectId
        );
      }
      if (user) {
        try {
          const updatedUser = user;
          if (user.emailNotificationConsent !== updateValue.consent) {
            updatedUser.emailNotificationConsent = updateValue.consent;
          }
          if (
            typeof updateValue.roleId !== 'undefined' &&
            user.role !== updateValue.roleId
          ) {
            updatedUser.role = updateValue.roleId;
          }

          await updateUser(updatedUser);
        } catch (err) {
          error = err;
        }
      } else {
        user = users[0];
        if (user.idpUser?.identifier && user.idpUser?.provider) {
          try {
            const newUser = {
              ...user,
              projectId: updateValue.projectId,
            };
            if (typeof updateValue.consent !== 'undefined') {
              newUser.emailNotificationConsent = updateValue.consent;
            }
            if (updateValue.roleId) {
              newUser.role = updateValue.roleId;
            }

            await createUser(newUser);
          } catch (err) {
            error = err;
          }
        }
      }
    }

    if (error) {
      throw new Error(error.message || 'User kon niet worden bijgewerkt');
    }

    // Clear only the pending edits that were actually sent (this closure's
    // `projectRoles`/`emailNotificationConsents` snapshot). An edit made
    // while the requests were in flight was never sent, so it must survive
    // this reset instead of being silently discarded.
    setProjectRoles((prev) =>
      prev.filter(
        (pending) =>
          !projectRoles.some(
            (sent) =>
              sent.projectId === pending.projectId &&
              sent.roleId === pending.roleId
          )
      )
    );
    setEmailNotificationConsents((prev) =>
      prev.filter(
        (pending) =>
          !emailNotificationConsents.some(
            (sent) =>
              sent.projectId === pending.projectId &&
              sent.consent === pending.consent
          )
      )
    );
    await mutate();
  }, [
    projectRoles,
    emailNotificationConsents,
    users,
    updateUser,
    createUser,
    mutate,
  ]);

  useRegisterSave({
    // Every edit on this page lands in one of these two lists, so a
    // non-empty list is the page's unsaved state.
    isDirty: projectRoles.length > 0 || emailNotificationConsents.length > 0,
    save,
  });

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

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="ml-1">
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 items-center lg:py-3 lg:border-b border-border gap-4">
              <ListHeading className="hidden lg:flex">Projectnaam</ListHeading>
              <ListHeading className="hidden lg:flex">Gebruiker ID</ListHeading>
              <ListHeading className="hidden lg:flex">Rol</ListHeading>
              <ListHeading className="hidden lg:flex">
                E-mail notificaties toestemming
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                Privacy toestemming
              </ListHeading>
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
                const roleOverride = projectRoles.find(
                  (pr) => pr.projectId == project.id
                );
                const effectiveRole = roleOverride?.roleId || user?.role || '';

                const cannotCreateNewUsers =
                  project?.config?.users?.canCreateNewUsers === false;

                return (
                  <li
                    key={project.id}
                    className="grid grid-cols-1 lg:grid-cols-5 items-center py-3 h-fit hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-4">
                    <Paragraph className="truncate">{project.name}</Paragraph>
                    <Paragraph className="truncate text-muted-foreground">
                      {user?.id ?? '—'}
                    </Paragraph>
                    <Paragraph className="truncate mr-4">
                      <UserRoleDropdownList
                        roleId={effectiveRole}
                        addProject={(roleId) => {
                          addProject(project.id, roleId);
                        }}
                        cannotAddMembers={cannotCreateNewUsers}
                      />
                    </Paragraph>

                    <Paragraph className="text-sm text-muted-foreground grid items-center gap-2 grid-cols-[15px_1fr]">
                      {!!effectiveRole && (
                        <>
                          <Checkbox
                            defaultChecked={
                              user?.emailNotificationConsent || false
                            }
                            onCheckedChange={(checked) => {
                              addEmailNotificationConsent(
                                project.id,
                                Boolean(checked)
                              );
                            }}
                          />
                          <span>Toestemming voor e-mail notificaties</span>
                        </>
                      )}
                    </Paragraph>

                    <Paragraph className="text-sm text-muted-foreground">
                      {project?.config?.auth?.provider?.openstad?.requiredUserFields?.includes(
                        'privacyConsent'
                      )
                        ? user?.privacyConsentAt
                          ? new Date(user.privacyConsentAt).toLocaleDateString(
                              'nl-NL',
                              { day: 'numeric', month: 'long', year: 'numeric' }
                            )
                          : 'Niet geaccepteerd'
                        : '–'}
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
        </form>
      </Form>
    </div>
  );
}
