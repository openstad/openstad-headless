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
  }
]
