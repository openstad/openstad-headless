import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import projectListSwr from '@/hooks/use-project-list';
import useUser from '@/hooks/use-user';
import { Form } from '@/components/ui/form';
import { Heading, ListHeading, Paragraph } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import DropdownList from '@/components/dropdown-list';
import { Button } from '@/components/ui/button';
import useIdpUser from '@/hooks/use-idpuser';

const formSchema = z.object({
  email: z.string().email().optional(),
});

type ProjectRole = {
  projectId: string;
  role: string;
};

export default function CreateUserProjects() {
  let projectRoles: Array<ProjectRole> = [];
  const { data, isLoading } = projectListSwr();
  const { data:user, isLoading:userLoading } = useUser();
  //const { data:rolesByProject } =  useSWR(() => `/api/openstad/api/user?fromIdpUser=1&identifier=${user.idpUser.identifier}&provider=${user.idpUser.provider}`);
  const {data: rolesByProject, createUser, updateUser } = useIdpUser(user.idpUser.identifier, user.idpUser.provider);


  // console.log({rolesByProject: typeof rolesByProject});

  // if(!!rolesByProject) {
  //   rolesByProject.forEach(roleByProject => {
  //     projectRoles.push(roleByProject);
  //   });
  // }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  const addProject = (projectId: string, role: string) => {
    const matchingProject = projectRoles.findIndex((obj) => obj.projectId == projectId);
   
    if (matchingProject >= 0) {
      if (role === '0') {
        projectRoles = projectRoles.filter(function (project) {
          return project.projectId !== projectId;
        });
      } else {
        projectRoles[matchingProject].role = role;
      }
    } else {
      if (role !== '0') {
        console.log("Add")
        projectRoles.push({ projectId: projectId, role: role });
      }
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newlyAddedProjectRoles = projectRoles.filter(rbp => rolesByProject.findIndex(pr => pr.projectId === rbp.projectId) === -1);
    const editedProjectRoles = projectRoles.filter(rbp => rolesByProject.findIndex(pr => pr.projectId === rbp.projectId));
    console.log({editedProjectRoles})

    
    editedProjectRoles.forEach(rbp => {
      console.log(rbp)
      //update
      updateUser(
        "7",
        user.email,
        rbp.projectId,
        rbp.role
      );
    });
    newlyAddedProjectRoles.forEach(rbp => {
      //create
      createUser(
        user.email,
        rbp.projectId,
        rbp.role
      );
    });
  }

  if (!data || !rolesByProject) return null;

  return (
    <div>
      <Form {...form}>
        <Heading size="xl" className="mb-4">
          Gebruiker • Projectsrechten
        </Heading>
        <Separator className="mb-4" />

        <p>{form.formState.errors.email?.message}</p>
        <p>{form.formState.errors.root?.message}</p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="container mx-auto">
            <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-2 border-b border-border">
              <ListHeading className="hidden md:flex md:col-span-2">
                Projectnaam
              </ListHeading>
              <ListHeading className="hidden md:flex md:col-span-2">
                Rol
              </ListHeading>
            </div>
            <ul>
              {data.map((project: any) => {
                const roleByProject = rolesByProject.find(r => r.projectId === project.id);
                return (
                  <li className="grid grid-cols-2 md:grid-cols-12 items-center py-3 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2">
                    <Paragraph className="hidden md:flex">
                      {project.name}
                    </Paragraph>
                    <Paragraph className="hidden md:flex">
                      <DropdownList
                        role={roleByProject?.role || "0"}
                        addProject={(role) => {
                          addProject(project.id, role);
                        }}
                      />
                    </Paragraph>
                  </li>
                );
              })}
            </ul>
          </div>
          <Button type="submit" variant="default">
            Aanpassen
          </Button>
        </form>
      </Form>
    </div>
  );
}
