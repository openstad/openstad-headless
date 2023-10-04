import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Project = {
  areaId: number | null,
  id: number,
  createdAt: string,
  deletedAt: string | null,
  hostStatus: Record<string, unknown>,
  name: string,
  title: string,
  updatedAt: string,
  url: string | null,
  config: string
}

export const columns: ColumnDef<Project>[] = [
    {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecteer alles"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onClick={(e:any)=> e.stopPropagation()}
            onCheckedChange={(value: any) => row.toggleSelected(!!value)}
            aria-label="Selecteer rij"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
  {
    accessorKey: "id",
    header: "ID"
  },
  {
    accessorKey: "title",
    header: "Titel"
  },
  {
    accessorKey: "createdAt",
    header: "Aangemaakt op"
  },
  {
    accessorKey: "config",
    header: ({ table }) => (
      null
    ),
    cell: ({ row }) => {
      const config: any = row.getValue("config");
      const project = config?.project;
      const ideas = config?.ideas;
      const votes = config?.votes;
      const basicAuth = config?.basicAuth;

      return (
      <div>
        <p>
          {project?.projectHasEnded?'Project is beeindigd':'Project is nog niet beeindigd'}
        </p>

        <p>
          {project?.endDate ? `Eind-datum: ${project.endDate}`:'Geen einddatum gezet'}
        </p>

        <p>
          {ideas?.canAddNewIdeas?'Plannen kunnen toegevoegd worden':'Plannen kunnen niet meer toegevoegd worden'}
        </p>

        <p>
          {votes?.isActive?'Er kan gestemd worden':'Er kan niet gestemd worden'}
        </p>

        <p>
          {basicAuth?.active ?'Wachtwoord':'Geen wachtwoord'}
        </p>
      </div>);
    },
    enableSorting: false,
    enableHiding: false,
  },
]
