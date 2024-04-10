import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const UserRoleDropdownList = ({
  roleId,
  addProject,
}: {
  roleId?: string;
  addProject: (roleId: string) => void;
}) => {
  return (
    <Select
      defaultValue={roleId ? roleId : ''}
      onValueChange={(value: string) => addProject(value)}>
      <SelectTrigger>
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
      { roleId ? null : (
        <SelectItem value={''}></SelectItem>
      )}
        <SelectItem value={'admin'}>Administrator</SelectItem>
        <SelectItem value={'editor'}>Editor</SelectItem>
        <SelectItem value={'moderator'}>Moderator</SelectItem>
        <SelectItem value={'member'}>Normale gebruiker</SelectItem>
        <SelectItem value={'anonymous'}>Anonieme gebruiker</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default UserRoleDropdownList;
