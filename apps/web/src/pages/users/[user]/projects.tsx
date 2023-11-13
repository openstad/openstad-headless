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
        "8",
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
                const roleByProject = rolesByProject.find(r => r.projectId === project.id);
                return (
                  <li className="grid grid-cols-1 lg:grid-cols-2 items-center py-3 h-fit hover:bg-secondary-background hover:cursor-pointer border-b border-border">
                    <Paragraph className="truncate">{project.name}</Paragraph>
                    <Paragraph className="truncate">
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
          <Button className="col-span-full w-fit mt-4" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
