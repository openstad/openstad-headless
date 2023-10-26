import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const DropdownList = ({ project, addProject }) => {

    return(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Geen deelname" onChange={addProject(project)}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">Geen deelname</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="member">Normale gebruiker</SelectItem>
                    <SelectItem value="anonymous">Anonieme gebruiker</SelectItem>
                </SelectContent>
            </Select>
    )
}

export default DropdownList;