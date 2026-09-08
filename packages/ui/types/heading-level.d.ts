export type HeadingLevel = 1 | 2 | 3 | 4;
type Level = 1 | 2 | 3 | 4 | 5 | 6;
type SubLevel = 2 | 3 | 4 | 5 | 6;
export declare function headingLevels(base?: number | string): [Level, SubLevel, SubLevel];
export {};
