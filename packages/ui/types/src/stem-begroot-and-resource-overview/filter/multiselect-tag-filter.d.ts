import React from 'react';
type Props = {
    dataStore: any;
    tagType: string;
    placeholder?: string;
    selected?: number[];
    onUpdateFilter?: (filter: any, label?: string, forceSelected?: boolean) => void;
    onlyIncludeIds?: number[];
    tagGroupProjectId?: any;
    preFilterTags?: Array<number>;
    parentStopUsingDefaultValue?: boolean;
    inlineOptions?: boolean;
    selectedParentTagIds?: number[];
};
declare const MultiSelectTagFilter: ({ dataStore, tagType, onUpdateFilter, selected, onlyIncludeIds, preFilterTags, parentStopUsingDefaultValue, inlineOptions, selectedParentTagIds, ...props }: Props) => false | React.JSX.Element;
export { MultiSelectTagFilter };
