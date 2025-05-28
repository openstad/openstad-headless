import flattenObject from "@/lib/export-helpers/flattenObject";
import * as XLSX from "xlsx";

const keyMap: Record<string, string> = {
  'id'                    : 'Stem ID',
  'resourceId'            : 'Inzending ID',
  'resource.title'        : 'Inzending titel',
  'opinion'               : 'Stem',
  'createdAt'             : 'Datum',
  'ip'                    : 'IP Adres',
  'userId'                : 'Gebruiker ID',
  'user.role'             : 'Gebruiker rol',
  'user.displayName'      : 'Gebruiker weergavenaam',
  'user.nickName'         : 'Gebruiker bijnaam',
  'user.name'             : 'Gebruiker naam',
  'user.email'            : 'Gebruiker e-mailadres',
  'user.postcode'         : 'Gebruiker postcode',
};

const cleanCommentsData = (original: Record<string, any>) => {
  const cleaned: Record<string, any> = {};

  Object.entries(keyMap).forEach(([key, label]) => {
    if (original.hasOwnProperty(key)) {
      cleaned[label] = original[key];
    }
  });

  return cleaned;
}

export const exportVotes = (data: any[], fileName: string) => {
  const allComments: any[] = [];

  data.forEach((comment) => {
    const flattenedComment = flattenObject(comment);
    const cleanedComment = cleanCommentsData(flattenedComment);
    allComments.push(cleanedComment);
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(allComments);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stemmen');
  XLSX.writeFile(workbook, fileName);
};