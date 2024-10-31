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
  disabled = false
}: {
  roleId?: string;
  addProject: (roleId: string) => void;
  disabled?: boolean;
}) => {
  return (
    <Select
      defaultValue={roleId ? roleId : ''}
      onValueChange={(value: string) => addProject(value)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
      { roleId ? null : (
        <SelectItem value={''}></SelectItem>
      )}
        <SelectItem value={'admin'}>Administrator</SelectItem>
        {/* currently not available
        <SelectItem value={'editor'}>Editor</SelectItem>
        <SelectItem value={'moderator'}>Moderator</SelectItem>
        */}
        <SelectItem value={'member'}>Normale gebruiker</SelectItem>
        <SelectItem value={'anonymous'}>Anonieme gebruiker</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default UserRoleDropdownList;
