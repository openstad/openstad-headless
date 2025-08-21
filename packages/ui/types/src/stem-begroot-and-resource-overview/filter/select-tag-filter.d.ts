import React from 'react';
type Props = {
    dataStore: any;
    tagType: string;
    placeholder?: string;
    onlyIncludeIds?: number[];
    onUpdateFilter?: (filter: string) => void;
    title: string;
    tagGroupProjectId?: any;
    preFilterTags?: Array<number>;
    parentStopUsingDefaultValue?: boolean;
};
declare const SelectTagFilter: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLSelectElement>>;
export { SelectTagFilter };
