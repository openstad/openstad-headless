import flattenObject from "@/lib/export-helpers/flattenObject";
import * as XLSX from "xlsx";

const keyMap: Record<string, string> = {
  'resourceId'            : 'Inzending ID',
  'resource.title'        : 'Inzending titel',
  'userId'                : 'Gebruiker ID',
  'user.role'             : 'Gebruiker rol',
  'user.name'             : 'Gebruiker naam',
  'user.displayName'      : 'Gebruiker weergavenaam',
  'user.email'            : 'Gebruiker e-mailadres',
  'user.phonenumber'      : 'Gebruiker telefoonnummer',
  'user.address'          : 'Gebruiker adres',
  'user.city'             : 'Gebruiker woonplaats',
  'user.postcode'         : 'Gebruiker postcode',
  'id'                    : 'Reactie ID',
  'parentId'              : 'Reactie op ID',
  'sentiment'             : 'Sentiment',
  'yes'                   : 'Reactie likes',
  'no'                    : 'Reactie dislikes',
  'score'                 : 'Wilson score interval',
  'description'           : 'Reactie',
  'location.lat'          : 'Locatie (lat)',
  'location.lng'          : 'Locatie (lng)',
  'createDateHumanized'   : 'Datum (leesbaar)',
  'updatedAt'             : 'Laatst bijgewerkt',
};

const cleanCommentsData = (original: Record<string, any>) => {
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
}

export const exportComments = (data: any[], fileName: string) => {
  const allComments: any[] = [];

  data.forEach((comment) => {
    const flattenedComment = flattenObject(comment);
    const cleanedComment = cleanCommentsData(flattenedComment);
    allComments.push(cleanedComment);

    let replies = [];
    if (typeof flattenedComment.replies === 'string') {
      try {
        replies = JSON.parse( `[${flattenedComment.replies}]` );

        replies?.forEach((reply: any) => {
          reply.parentId = flattenedComment.id;
          reply.description = `└ ${reply.description || ''}`;

          const flattenedReply = flattenObject(reply);
          const cleanedReply = cleanCommentsData(flattenedReply);
          allComments.push(cleanedReply);
        });
      } catch (e) {}
    }
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(allComments);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reacties');
  XLSX.writeFile(workbook, fileName);
};
