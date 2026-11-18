import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FilterTag, groupTagsByType } from '@/lib/group-tags-by-type';
import { Check, ChevronDown, X } from 'lucide-react';
import React, { useId, useMemo, useState } from 'react';

type Props = {
  tags: Array<FilterTag>;
  selectedTagId: number | null;
  onChange: (tagId: number | null) => void;
};

export function TagFilter({ tags, selectedTagId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const fieldId = useId();
  const searchId = `${fieldId}-search`;

  const groups = useMemo(() => groupTagsByType(tags, query), [tags, query]);
  const selectedTag = tags.find((tag) => tag.id === selectedTagId);

  const selectTag = (tagId: number) => {
    onChange(tagId);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="flex items-center gap-1">
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setQuery('');
        }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="p-2 rounded bg-white flex items-center gap-1 text-sm">
            Tag: {selectedTag ? selectedTag.name : 'Alle'}
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-2">
          <label htmlFor={searchId} className="sr-only">
            Zoek een tag
          </label>
          <input
            id={searchId}
            type="text"
            autoFocus
            className="w-full p-2 rounded border text-sm"
            placeholder="Zoek een tag..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const firstMatch = groups[0]?.tags[0];
                if (firstMatch) selectTag(firstMatch.id);
              }
            }}
          />
          <div className="max-h-72 overflow-y-auto mt-2">
            {groups.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">
                Geen tags gevonden
              </p>
            ) : (
              groups.map((group, index) => {
                const headingId = `${fieldId}-group-${index}`;
                return (
                  <div
                    key={group.type}
                    role="group"
                    aria-labelledby={headingId}>
                    <p
                      id={headingId}
                      className="px-2 pt-2 pb-1 text-xs font-medium uppercase text-muted-foreground">
                      {group.type}
                    </p>
                    {group.tags.map((tag) => {
                      const isSelected = tag.id === selectedTagId;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => selectTag(tag.id)}
                          className="w-full flex items-center justify-between px-2 py-1 rounded text-left text-sm hover:bg-muted focus:bg-muted">
                          {tag.name}
                          {isSelected ? (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
      {selectedTag ? (
        <button
          type="button"
          aria-label={`Tagfilter ${selectedTag.name} wissen`}
          onClick={() => onChange(null)}
          className="p-2 rounded bg-white">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
