import stringFilters from "./nunjucks-filters";
import {RawResourceWidgetProps} from "../src/raw-resource";

function getVariableValue(varName: string, varMapping: { [p: string]: any }) {
  let varValue = '';

  // varName can be a dot notation, then we must fetch the correct deeper layer
  // e.g. resource.extraData.phone, we must get resource['extraData']['phone'] if it exists
  const splitVarName = varName.split('.');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  varValue = varMapping[splitVarName[0]];

  if (splitVarName.length > 1) {
    // Loop through the splitVarName array, skipping index 0
    splitVarName.shift();

    splitVarName.forEach((vn) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (varValue && varValue[vn]) {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // @ts-expect-error any
        varValue = varValue[vn] as string;
      } else {
        varValue = '';
      }
    });
  }

  return varValue;
}

export const renderRawTemplate = (updatedProps: RawResourceWidgetProps, resource: any, resourceId: number | string, checkForResourceId = false ) => {
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
          progress: resource.progress,
          createDateHumanized: resource.createDateHumanized,
          publishDateHumanized: resource.publishDateHumanized,
          publishDate: resource.publishDate,
        };

        // The template can also contain conditionals, like such:
        // {% if resource %}
        // or
        // {% if title = 'Test' %}
        // Which are accompanied by an {% endif %} at the end of the conditional block, and can also have a matching {% else %} block

        // Get all if-endif, if-else-endif blocks from the string
        const ifRegex = /\{%\s*if\s*([^}]*)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g

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

              if (varValue === value || `'${varValue}'` === value || `"${varValue}"` === value) {
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

        // Get all variables fom the string
        const regex = /\{\{([^}]*)\}\}/g
        const varsInString = Array.from(rendered.matchAll(regex));

        if (varsInString && varsInString.length) {
          for (const match of varsInString) {

            let newValue = '';
            const cleanMatches = match[1].trim().split('|');
            const varName = cleanMatches[0].trim();
            const filters = cleanMatches.slice(1).map((filter) => filter.trim());

            newValue = getVariableValue(varName, varMapping);

            if (!!newValue && filters && filters.length) {
              for (const filter of filters) {

                // Filter can be in this format: tagGroup('type') or replace('type', 'type2) | cleanArray
                // So we need to split the filter name and the arguments
                const filterParts = filter.split('(');
                const filterName = filterParts[0];
                let filterArgs: string[] = [];
                if (filterParts.length > 1) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  filterArgs = filterParts[1].replace(')', '').split(',').map(f => f.trim().replaceAll("'", "").replaceAll('"', ''));
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

            rendered = rendered.replaceAll(match[0], newValue);

          }
        }

        return rendered;

      }
    }
    return '';
  })();

  return render;
}