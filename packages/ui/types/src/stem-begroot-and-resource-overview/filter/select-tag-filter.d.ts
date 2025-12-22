import React from 'react';
type Props = {
    dataStore: any;
    tagType: string;
    placeholder?: string;
    onlyIncludeIds?: number[];
    onUpdateFilter?: (filter: any, label?: string) => void;
    title: string;
    tagGroupProjectId?: any;
    preFilterTags?: Array<number>;
    parentStopUsingDefaultValue?: boolean;
    inlineOptions?: boolean;
    valueSelected?: string;
    removeActiveTag?: (tagType: string, tagId: number) => void;
};
declare const SelectTagFilter: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLSelectElement>>;
export { SelectTagFilter };
