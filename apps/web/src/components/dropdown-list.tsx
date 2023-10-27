import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const UserRoleDropdownList = ({ roleId, addProject }:{roleId?:string, addProject: (roleId:string) => void}) => {
    return(
            <Select defaultValue={roleId? roleId : "0"} onValueChange={(value: string) =>addProject(value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Geen deelname"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={"0"}>Geen deelname</SelectItem>
                    <SelectItem value={"1"}>Administrator</SelectItem>
                    <SelectItem value={"2"}>Normale gebruiker</SelectItem>
                    <SelectItem value={"3"}>Anonieme gebruiker</SelectItem>
                    <SelectItem value={"4"}>Editor</SelectItem>
                    <SelectItem value={"5"}>Moderator</SelectItem>
                </SelectContent>
            </Select>
    )
}

export default UserRoleDropdownList;