import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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

type EmailNotificationConsent = {
  projectId: string;
  consent: boolean;
};

type ProjectDisplayName = {
  projectId: string;
  displayName: string;
};

type CombinedProjectRoleAndConsent = {
  projectId: string;
  roleId?: string;
  consent?: boolean;
  displayName?: string;
};

export default function CreateUserProjects() {
  const { data: projects } = projectListSwr();
  const { data: users, updateUser, mutate } = useUser();
  const { createUser } = useUsers();
  const [projectRoles, setProjectRoles] = useState<Array<ProjectRole>>([]);
  const [emailNotificationConsents, setEmailNotificationConsents] = useState<
    Array<EmailNotificationConsent>
  >([]);
  const [projectDisplayNames, setProjectDisplayNames] = useState<
    Array<ProjectDisplayName>
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
          updated[index].roleId = roleId;
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
        updated[index].consent = consent;
      } else {
        updated.push({ projectId, consent });
      }
      return updated;
    });
  };

  const addProjectDisplayName = (projectId: string, displayName: string) => {
    setProjectDisplayNames((prev) => {
      let updated = [...prev];
      const index = updated.findIndex((e) => e.projectId === projectId);

      if (index !== -1) {
        updated[index].displayName = displayName;
      } else {
        updated.push({ projectId, displayName });
      }
      return updated;
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let savedCount = 0;
    const failures: Array<{ project: string; message: string }> = [];

    const projectLabel = (projectId: string) =>
      projects?.find((p: any) => p.id == projectId)?.name ||
      `project ${projectId}`;

    const combinedByProject = new Map<string, CombinedProjectRoleAndConsent>();
    for (const entry of [
      ...projectRoles,
      ...emailNotificationConsents,
      ...projectDisplayNames,
    ]) {
      const existing = combinedByProject.get(entry.projectId) || {
        projectId: entry.projectId,
      };
      combinedByProject.set(entry.projectId, { ...existing, ...entry });
    }
    const mergedProjects = Array.from(combinedByProject.values());

    for (let updateValue of mergedProjects) {
      let user = users;
      if (Array.isArray(users)) {
        user = users.find(
          (user: any) => user.projectId == updateValue.projectId
        );
      }
      if (user) {
        const changes: Record<string, any> = {};
        if (
          typeof updateValue.consent !== 'undefined' &&
          user.emailNotificationConsent !== updateValue.consent
        ) {
          changes.emailNotificationConsent = updateValue.consent;
        }
        if (
          typeof updateValue.displayName !== 'undefined' &&
          user.projectDisplayName !== (updateValue.displayName || null)
        ) {
          changes.projectDisplayName = updateValue.displayName || null;
        }
        if (
          typeof updateValue.roleId !== 'undefined' &&
          user.role !== updateValue.roleId
        ) {
          changes.role = updateValue.roleId;
        }

        // Nothing changed for this project: skip the update.
        if (Object.keys(changes).length === 0) continue;

        try {
          await updateUser({ ...user, ...changes });
          savedCount++;
        } catch (err: any) {
          failures.push({
            project: projectLabel(updateValue.projectId),
            message: err?.message || 'onbekende fout',
          });
        }
      } else if (updateValue.roleId) {
        // Only create an account when a role was actually assigned.
        const source = Array.isArray(users) ? users[0] : users;
        if (!source?.idpUser?.identifier || !source?.idpUser?.provider) {
          failures.push({
            project: projectLabel(updateValue.projectId),
            message: 'geen gekoppeld inlogaccount',
          });
          continue;
        }
        try {
          const newUser = {
            ...source,
            projectId: updateValue.projectId,
            role: updateValue.roleId,
            nickName: null,
            projectDisplayName: updateValue.displayName || null,
            emailNotificationConsent:
              typeof updateValue.consent !== 'undefined'
                ? updateValue.consent
                : null,
            privacyConsentAt: null,
            listableByRole: null,
            detailsViewableByRole: null,
          };

          await createUser(newUser);
          savedCount++;
        } catch (err: any) {
          failures.push({
            project: projectLabel(updateValue.projectId),
            message: err?.message || 'onbekende fout',
          });
        }
      }
    }

    // Refresh even on partial success so saved values are visible.
    if (savedCount) await mutate();

    if (failures.length) {
      const details = failures
        .map((f) => `${f.project} (${f.message})`)
        .join('; ');
      toast.error(
        savedCount
          ? `Opgeslagen, behalve voor: ${details}`
          : `Bijwerken mislukt voor: ${details}`
      );
    } else if (savedCount) {
      toast.success('User is bijgewerkt');
    } else {
      toast.success('Er waren geen wijzigingen om op te slaan');
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
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-6 items-center lg:py-3 lg:border-b border-border gap-4">
              <ListHeading className="hidden lg:flex">Projectnaam</ListHeading>
              <ListHeading className="hidden lg:flex">Gebruiker ID</ListHeading>
              <ListHeading className="hidden lg:flex">Weergavenaam</ListHeading>
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
                    className="grid grid-cols-1 lg:grid-cols-6 items-center py-3 h-fit hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-4">
                    <Paragraph className="truncate">{project.name}</Paragraph>
                    <Paragraph className="truncate text-muted-foreground">
                      {user?.id ?? '—'}
                    </Paragraph>
                    <Paragraph className="truncate mr-4">
                      {!!effectiveRole && (
                        <Input
                          type="text"
                          defaultValue={user?.projectDisplayName || ''}
                          placeholder="Weergavenaam"
                          onChange={(e) => {
                            addProjectDisplayName(project.id, e.target.value);
                          }}
                        />
                      )}
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

          <Button className="col-span-full w-fit mt-4" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
