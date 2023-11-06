import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const UserRoleDropdownList = ({ roleId, addProject }:{roleId?:string, addProject: (roleId:string) => void}) => {
    return(
            <Select defaultValue={roleId? roleId : "0"} onValueChange={(value: string) =>addProject(value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Geen deelname"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={"0"}>Geen deelname</SelectItem>
                    <SelectItem value={"admin"}>Administrator</SelectItem>
                    <SelectItem value={"member"}>Normale gebruiker</SelectItem>
                    <SelectItem value={"anonymous"}>Anonieme gebruiker</SelectItem>
                    <SelectItem value={"editor"}>Editor</SelectItem>
                    <SelectItem value={"moderator"}>Moderator</SelectItem>
                </SelectContent>
            </Select>
    )
}

export default UserRoleDropdownList;