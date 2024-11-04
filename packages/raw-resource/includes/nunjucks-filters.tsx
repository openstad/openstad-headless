import nunjucks from 'nunjucks';

type Tag = {
  label?: string;
  name?: string;
};

type Status = {
  label?: string;
  name?: string;
};

// Custom filter functions
function dump(obj: any): string {
  if (obj === null || obj === undefined) return '';
  return JSON.stringify(obj, null, 2);
}

function cleanArray(str: string): string {
  if (typeof str !== 'string') return '';
  try {
    const arr = JSON.parse(str);
    if (Array.isArray(arr)) {
      return arr.join(', ');
    }
  } catch (e) {
    // If parsing fails, return the original string
  }
  return str;
}

function capitalize(str: string): string {
  if (typeof str !== 'string' || str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str: string, length: number): string {
  if (typeof str !== 'string' || typeof length !== 'number') return '';
  return str.length > length ? str.slice(0, length) + '...' : str;
}

function lowercase(str: string): string {
  if (typeof str !== 'string') return '';
  return str.toLowerCase();
}

function uppercase(str: string): string {
  if (typeof str !== 'string') return '';
  return str.toUpperCase();
}

function replace(str: string, search: string, replacement: string): string {
  console.log( str, search, replacement);
  if (typeof str !== 'string' || typeof search !== 'string' || typeof replacement !== 'string') return '';
  return str.split(search).join(replacement);
}

function tags(resource: any): string {
  if (!Array.isArray(resource.tags)) return '';
  return resource.tags.map((tag: Tag) => tag.label || tag.name).join(', ');
}

function tagGroup(resource: any, type: any): string {
  if (!Array.isArray(resource.tags)) return '';
  return resource?.tags?.filter((tag: any) => tag.type === type).map((tag: Tag) => tag.label || tag.name).join(', ');
}

function status(resource: any): string {
  if (!Array.isArray(resource.statuses)) return '';
  return resource.statuses.map((status: Status) => status.label || status.name).join(', ');
}

function formatDate(dateStr: string, formatStr: string): string {
  if (typeof dateStr !== 'string' || typeof formatStr !== 'string') return '';

  try {
    const date = new Date(dateStr);
    const months = [
      'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'
    ];

    const map: { [key: string]: string } = {
      DD: String(date.getDate()).padStart(2, '0'), // Dag van de maand, 2 cijfers
      D: String(date.getDate()), // Dag van de maand
      MMMM: months[date.getMonth()], // Volledige maandnaam
      MM: String(date.getMonth() + 1).padStart(2, '0'), // Maand, 2 cijfers
      M: String(date.getMonth() + 1), // Maand
      YYYY: String(date.getFullYear()), // Volledig jaar
      YY: String(date.getFullYear()).slice(-2), // Jaar, 2 cijfers
      hh: String(date.getHours()).padStart(2, '0'), // Uren, 2 cijfers
      mm: String(date.getMinutes()).padStart(2, '0'), // Minuten, 2 cijfers
      ss: String(date.getSeconds()).padStart(2, '0'), // Seconden, 2 cijfers
    };

    // Vervang het formaat door de juiste waarden
    return formatStr.replace(/DD|D|MMMM|MM|M|YYYY|YY|hh|mm|ss/g, (matched) => map[matched] || '');
  } catch (e) {
    // Return de originele string als het parsen mislukt
    return dateStr;
  }
}

// Apply filters to Nunjucks environment
export function applyFilters(env: nunjucks.Environment) {
  env.addFilter('dump', dump);
  env.addFilter('cleanArray', cleanArray);
  env.addFilter('capitalize', capitalize);
  env.addFilter('truncate', truncate);
  env.addFilter('lowercase', lowercase);
  env.addFilter('uppercase', uppercase);
  env.addFilter('replace', replace);
  env.addFilter('tags', tags);
  env.addFilter('status', status);
  env.addFilter('tagGroup', tagGroup);
  env.addFilter('formatDate', formatDate);
}