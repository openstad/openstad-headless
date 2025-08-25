import { FC } from "react";
export type InfoFieldProps = {
    title?: string;
    description?: string;
    fieldKey?: string;
    type?: string;
    image?: string;
    imageAlt?: string;
    imageDescription?: string;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
};
declare const InfoField: FC<InfoFieldProps>;
export default InfoField;
