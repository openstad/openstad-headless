import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Idea = {
  title: String,
  votesFor: Number,
  votesAgainst: Number,
  created: Date
}

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "title",
    header: "Titel"
  },
  {
    accessorKey: "votesFor",
    header: "Stemmen voor"
  },
  {
    accessorKey: "votesAgainst",
    header: "Stemmen tegen"
  },
  {
    accessorKey: "created",
    header: "Gemaakt op"
  }
]
