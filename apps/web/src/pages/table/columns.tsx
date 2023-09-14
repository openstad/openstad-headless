import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Project = {
  id: string
  projectName: string
  data: string
  issues: string
  status: string
  react: string
  like: string
  submitter: string
  resources: string
}

export const columns: ColumnDef<Project>[] = [
    {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: any) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
  {
    accessorKey: "projectName",
    header: "Project Naam"
  },
  {
    accessorKey: "data",
    header: "Data"
  },
  {
    accessorKey: "issues",
    header: "Issues"
  },
  {
    accessorKey: "status",
    header: "Status"
  },
  {
    accessorKey: "react",
    header: "Reageren"
  },{
    accessorKey: "like",
    header: "Liken"
  },{
    accessorKey: "submitter",
    header: "Toevoeger"
  },
  {
    accessorKey: "resources",
    header: "Resources"
  },
]
