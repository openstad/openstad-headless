import { humanizeDate } from '@openstad-headless/lib/humanize-date';
import { sanitizeHtml } from '@openstad-headless/lib/sanitize';

import { RawResourceWidgetProps } from '../src/raw-resource';
import stringFilters from './nunjucks-filters';

function getVariableValue(varName: string, varMapping: { [p: string]: any }) {
  let varValue: any = '';

  // varName can be a dot notation, then we must fetch the correct deeper layer
  // e.g. resource.extraData.phone, we must get resource['extraData']['phone'] if it exists
  const splitVarName = varName.split('.');

  // Handle array bracket notation like images[0]
  const firstPart = splitVarName[0];
  const arrayMatch = firstPart.match(/^([^\[]+)\[(\d+)\]$/);

  if (arrayMatch) {
    const [, key, index] = arrayMatch;
    varValue = varMapping[key]?.[parseInt(index)];
  } else {
    varValue = varMapping[firstPart];
  }

  if (splitVarName.length > 1) {
    // Loop through the splitVarName array, skipping index 0
    splitVarName.shift();

    splitVarName.forEach((vn) => {
      if (varValue && varValue[vn] !== undefined && varValue[vn] !== null) {
        varValue = varValue[vn] as string;
      } else {
        varValue = '';
      }
    });
  }

  // Convert objects/arrays to JSON string for display
  if (typeof varValue === 'object' && varValue !== null) {
    return JSON.stringify(varValue);
  }

  return varValue;
}

export const renderRawTemplate = (
  updatedProps: RawResourceWidgetProps,
  resource: any,
  resourceId: number | string,
  checkForResourceId = false
) => {
  let render = (() => {
    if (updatedProps.rawInput) {
      if (resourceId || !checkForResourceId) {
        let rendered = updatedProps.rawInput;

        const varMapping: { [key: string]: any } = {
          // here you can add variables that are available in the template
          projectId: updatedProps.projectId,
          resource: resource,
          user: resource.user,
          startDateHumanized: resource.startDateHumanized,
          status: resource.statuses,
          tags: resource.tags,
          title: resource.title,
          summary: resource.summary,
          description: resource.description,
          images: resource.images,
          budget: resource.budget,
          extraData: resource.extraData,
          location: resource.location,
          modBreak: resource.modBreak,
          modBreakDateHumanized: resource.modBreakDateHumanized,
          modBreaks: resource.modBreaksHumanized || [],
          modBreaksHtml: (resource.modBreaks || [])
            .map(
              (mb: any) =>
                `<div class="resource-detail-modbreak-banner">` +
                `<section>` +
                `<strong>${sanitizeHtml(mb.authorName || updatedProps.resources?.modbreakTitle || '')}</strong>` +
                `<span>${mb.modBreakDate ? humanizeDate(mb.modBreakDate) : ''}</span>` +
                `</section>` +
                `<div>${sanitizeHtml(mb.description || '')}</div>` +
                `</div>`
            )
            .join(''),
          progress: resource.progress,
          createDateHumanized: resource.createDateHumanized,
          publishDateHumanized: resource.publishDateHumanized,
          publishDate: resource.publishDate,
          currentUser: updatedProps.currentUser,
        };

        // The template can also contain conditionals, like such:
        // {% if resource %}
        // or
        // {% if title = 'Test' %}
        // Which are accompanied by an {% endif %} at the end of the conditional block, and can also have a matching {% else %} block

        // Get all if-endif, if-else-endif blocks from the string
        const ifRegex = /\{%\s*if\s*([^}]*)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g;

        const ifBlocks = Array.from(updatedProps.rawInput.matchAll(ifRegex));

        // Loop through all if blocks
        if (ifBlocks && ifBlocks.length) {
          for (const match of ifBlocks) {
            const condition = match[1].trim();
            const block = match[2].trim().split('{% else %}');

            // Check if the condition is true
            let conditionIsTrue = false;
            if (condition.indexOf('=') > -1) {
              const parts = condition.split('=');
              const varName = parts[0].trim();
              const value = parts[1].trim();

              const varValue = getVariableValue(varName, varMapping);

              if (
                varValue === value ||
                `'${varValue}'` === value ||
                `"${varValue}"` === value
              ) {
                conditionIsTrue = true;
              }
            } else {
              const varValue = getVariableValue(condition, varMapping);
              conditionIsTrue = !!varValue;
            }

            // If the condition is true, render the block
            if (conditionIsTrue) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              rendered = rendered.replaceAll(match[0], block[0]);
            } else {
              // If the condition is false, render the else block (or empty value)
              const elseBlock = block[1] ?? '';
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
              rendered = rendered.replaceAll(match[0], elseBlock);
            }
          }
        }

        // Substitute all {{variables}}, escaped for the context they land in
        rendered = substituteVars(rendered, (expression) =>
          resolveExpression(expression, varMapping)
        );

        return rendered;
      }
    }
    return '';
  })();

  return render;
};

// Resolve a single `varName | filter | filter(arg)` expression to its value.
function resolveExpression(
  expression: string,
  varMapping: { [key: string]: any }
) {
  const cleanMatches = expression.trim().split('|');
  const varName = cleanMatches[0].trim();
  const filters = cleanMatches.slice(1).map((filter) => filter.trim());

  let newValue = getVariableValue(varName, varMapping);

  if (!!newValue && filters && filters.length) {
    for (const filter of filters) {
      // Filter can be in this format: tagGroup('type') or replace('type', 'type2) | cleanArray
      // So we need to split the filter name and the arguments
      const filterParts = filter.split('(');
      const filterName = filterParts[0];
      let filterArgs: string[] = [];
      if (filterParts.length > 1) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        filterArgs = filterParts[1]
          .replace(')', '')
          .split(',')
          .map((f) => f.trim().replaceAll("'", '').replaceAll('"', ''));
      }

      // @ts-ignore
      if (stringFilters[filterName]) {
        if (filterArgs.length) {
          // @ts-ignore
          newValue = stringFilters[filterName](newValue, ...filterArgs);
        } else {
          // @ts-ignore
          newValue = stringFilters[filterName](newValue);
        }
      }
    }
  }

  return String(newValue ?? '');
}

function escapeAttributeValue(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Walk the template once and substitute every {{variable}}. The template
 * itself is admin-authored widget config (trusted, may contain iframes or
 * inline handlers on purpose); the substituted values are user-generated
 * content. Each value is therefore escaped for the context it lands in:
 * HTML-sanitized in element content, attribute-escaped inside a tag.
 *
 * Values are not rescanned, so template syntax inside user content is inert.
 *
 * ponytail: unquoted attributes (`<a href={{url}}>`) stay injectable through
 * whitespace; quote the attribute in the template, or escape whitespace here
 * if that turns out to happen in the wild.
 */
function substituteVars(
  template: string,
  resolve: (expression: string) => string
) {
  let out = '';
  let pos = 0;
  let inTag = false;
  let quote = '';

  while (pos < template.length) {
    if (template.startsWith('{{', pos)) {
      const end = template.indexOf('}}', pos);
      if (end === -1) break;

      const value = resolve(template.slice(pos + 2, end));
      out += inTag ? escapeAttributeValue(value) : sanitizeHtml(value);
      pos = end + 2;
      continue;
    }

    const char = template[pos];

    if (inTag) {
      if (quote) {
        if (char === quote) quote = '';
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '>') {
        inTag = false;
      }
    } else if (char === '<' && /[a-zA-Z/!]/.test(template[pos + 1] || '')) {
      inTag = true;
    }

    out += char;
    pos++;
  }

  return out + template.slice(pos);
}
