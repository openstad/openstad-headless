import nunjucks from 'nunjucks';

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
  return resource.tags.map(tag => tag.label || tag.name).join(', ');
}

function status(resource: any): string {
  if (!Array.isArray(resource.statuses)) return '';
  return resource.statuses.map(status => status.label || status.name).join(', ');
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
}