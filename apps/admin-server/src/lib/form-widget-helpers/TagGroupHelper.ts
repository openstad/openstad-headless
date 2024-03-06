type Group = {
  type: string;
  label?: string;
  multiple?: boolean;
};

export function handleTagCheckboxGroupChange(
  tagGroupName: string,
  checked: boolean,
  groups: Array<Group>,
  fieldToChange: keyof Pick<Group, 'type' | 'multiple'>
) {
  const indexToChange = groups.findIndex((g) => g.type === tagGroupName);

  const existingGroup = groups[indexToChange];
  let updatedFields = [...groups];

  if (fieldToChange === 'type' && checked) {
    updatedFields.push({
      type: tagGroupName,
      multiple: false,
      label: '',
    });
  }

  if (fieldToChange === 'type' && !checked) {
    updatedFields = groups.filter((val) => val.type !== tagGroupName);
    return updatedFields;
  }
  if (existingGroup && fieldToChange === 'multiple') {
    existingGroup.multiple = checked;
    updatedFields[indexToChange] = existingGroup;
  }

  return updatedFields;
}
