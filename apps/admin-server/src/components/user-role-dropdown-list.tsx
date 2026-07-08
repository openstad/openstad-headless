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
  cannotAddMembers = false,
}: {
  roleId?: string;
  addProject: (roleId: string) => void;
  cannotAddMembers?: boolean;
}) => {
  return (
    <Select
      value={roleId ? roleId : ''}
      onValueChange={(value: string) => addProject(value)}>
      <SelectTrigger>
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        {roleId ? null : <SelectItem value={''}>Geen rol</SelectItem>}
        <SelectItem value={'admin'}>Administrator</SelectItem>
        <SelectItem value={'editor'}>Editor</SelectItem>
        {/* currently not available
        <SelectItem value={'moderator'}>Moderator</SelectItem>
        */}
        {!cannotAddMembers && (
          <SelectItem value={'member'}>Normale gebruiker</SelectItem>
        )}
        {!cannotAddMembers && (
          <SelectItem value={'anonymous'}>Anonieme gebruiker</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default UserRoleDropdownList;
