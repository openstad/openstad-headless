import flattenObject from "@/lib/export-helpers/flattenObject";
import * as XLSX from "xlsx";

const keyMap: Record<string, string> = {
  'resourceId'            : 'Inzending ID',
  'resource.title'        : 'Inzending titel',
  'userId'                : 'Gebruiker ID',
  'user.role'             : 'Gebruiker rol',
  'user.displayName'      : 'Gebruiker weergavenaam',
  'user.name'             : 'Gebruiker naam',
  'user.email'            : 'Gebruiker e-mailadres',
  'id'                    : 'Reactie ID',
  'parentId'              : 'Reactie op ID',
  'sentiment'             : 'Sentiment',
  'description'           : 'Reactie',
  'location.lat'          : 'Locatie (lat)',
  'location.lng'          : 'Locatie (lng)',
  'createDateHumanized'   : 'Datum (leesbaar)',
  'updatedAt'             : 'Laatst bijgewerkt',
};

const cleanCommentsData = (allComments: any[]) => {
  return allComments.map(original => {
    const cleaned: Record<string, any> = {};

    Object.entries(keyMap).forEach(([key, label]) => {
      if (original.hasOwnProperty(key)) {
        cleaned[label] = original[key];
      }
    });

    Object.keys(original).forEach((key) => {
      if (key.startsWith('tags.')) {
        const label = key.replace('tags.', 'Tag ');

        const fullTagsString = typeof cleaned[label] === 'undefined'
          ? original[key]
          : cleaned[label] + ', ' + original[key];

        cleaned[label] = JSON.parse( `[${fullTagsString}]` )?.filter(Boolean).join(', ');
      }
    });

    return cleaned;
  });
}

export const exportComments = (data: any[], fileName: string) => {
  const allComments: any[] = [];

  const flattenedData = data.map(item => flattenObject(item));

  flattenedData.forEach((comment) => {
    allComments.push(comment);

    let replies = [];
    if (typeof comment.replies === 'string') {
      try {
        replies = JSON.parse( `[${comment.replies}]` );

        replies?.forEach((reply: any) => {
          reply.parentId = comment.id;
          reply.description = `└ ${reply.description || ''}`;

          const flattenedReply = flattenObject(reply);
          allComments.push(flattenedReply);
        });
      } catch (e) {}
    }
  });

  const cleanedComments = cleanCommentsData(allComments);

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(cleanedComments);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reacties');
  XLSX.writeFile(workbook, fileName);
};