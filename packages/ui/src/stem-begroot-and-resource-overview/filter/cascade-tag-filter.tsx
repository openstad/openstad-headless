import { FormLabel } from '@utrecht/component-library-react';
import React, { useEffect, useState } from 'react';

type TagDefinition = {
  id: number;
  name: string;
  type: string;
  extraData?: any;
};

type Props = {
  dataStore: any;
  parentTagType: string;
  childTagType: string;
  label?: string;
  onUpdateFilter?: (selectedTagIds: number[]) => void;
};

const CascadeTagFilter = ({
  dataStore,
  parentTagType,
  childTagType,
  label = 'Stadsdeel & Wijk',
  onUpdateFilter,
}: Props) => {
  const { data: parentTags } = dataStore.useTags({
    type: parentTagType,
    onlyIncludeIds: [],
  });
  const { data: childTags } = dataStore.useTags({
    type: childTagType,
    onlyIncludeIds: [],
  });
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  function handleParentToggle(parentTag: TagDefinition, checked: boolean) {
    const childIds = (childTags || [])
      .filter((c: TagDefinition) => c.extraData?.parentTagId === parentTag.id)
      .map((c: TagDefinition) => c.id);

    let newSelected: number[];
    if (checked) {
      newSelected = [
        ...selectedTags,
        parentTag.id,
        ...childIds.filter((id: number) => !selectedTags.includes(id)),
      ];
    } else {
      newSelected = selectedTags.filter(
        (id) => id !== parentTag.id && !childIds.includes(id)
      );
    }
    setSelectedTags(newSelected);
    onUpdateFilter && onUpdateFilter(newSelected);
  }

  function handleChildToggle(
    childTag: TagDefinition,
    parentId: number,
    checked: boolean
  ) {
    let newSelected: number[];
    if (checked) {
      newSelected = [...selectedTags, childTag.id];
      if (!newSelected.includes(parentId)) {
        newSelected.push(parentId);
      }
    } else {
      newSelected = selectedTags.filter((id) => id !== childTag.id);
    }
    setSelectedTags(newSelected);
    onUpdateFilter && onUpdateFilter(newSelected);
  }

  if (!parentTags?.length) return null;

  return (
    <div className="form-element">
      <FormLabel>{label}</FormLabel>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          maxHeight: '320px',
          overflowY: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '0.5rem',
        }}>
        {parentTags.map((parent: TagDefinition) => {
          const children = (childTags || []).filter(
            (c: TagDefinition) => c.extraData?.parentTagId === parent.id
          );
          const parentSelected = selectedTags.includes(parent.id);

          return (
            <div key={parent.id} style={{ marginBottom: '0.5rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  border: '1px solid',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  borderColor: parentSelected ? '#3b82f6' : '#d1d5db',
                  backgroundColor: parentSelected ? '#eff6ff' : '#fff',
                }}>
                <input
                  type="checkbox"
                  checked={parentSelected}
                  onChange={(e) => handleParentToggle(parent, e.target.checked)}
                />
                {parent.name}
              </label>
              {children.length > 0 && (
                <div
                  style={{
                    marginLeft: '1.5rem',
                    marginTop: '0.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}>
                  {children.map((child: TagDefinition) => {
                    const childSelected = selectedTags.includes(child.id);
                    return (
                      <label
                        key={child.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          border: '1px solid',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          borderColor: childSelected ? '#93c5fd' : '#e5e7eb',
                          backgroundColor: childSelected ? '#f0f9ff' : '#fff',
                        }}>
                        <input
                          type="checkbox"
                          checked={childSelected}
                          onChange={(e) =>
                            handleChildToggle(
                              child,
                              parent.id,
                              e.target.checked
                            )
                          }
                        />
                        {child.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { CascadeTagFilter };
