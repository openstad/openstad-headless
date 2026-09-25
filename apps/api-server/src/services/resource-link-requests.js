const createError = require('http-errors');
const pluginExtensions = require('./plugin-extensions');

const MAX_SELECTION = 50;
const MAX_MESSAGE_LENGTH = 1000;
const SOURCE_PATTERN = /^[a-z0-9-]{1,64}$/;

function parseSelection(links) {
  if (links === undefined || links === null) return null;
  if (!Array.isArray(links)) {
    throw createError(422, 'links must be an array');
  }
  if (links.length > MAX_SELECTION) {
    throw createError(422, `links can contain at most ${MAX_SELECTION} items`);
  }

  return links.map((link, index) => {
    const source = link && link.source;
    const id = link && link.id;
    const message = link && link.message;

    if (typeof source !== 'string' || !SOURCE_PATTERN.test(source)) {
      throw createError(422, `links[${index}]: invalid source`);
    }
    if (
      !['string', 'number'].includes(typeof id) ||
      String(id).length === 0 ||
      String(id).length > 255
    ) {
      throw createError(422, `links[${index}]: invalid id`);
    }
    if (
      message !== undefined &&
      message !== null &&
      (typeof message !== 'string' || message.length > MAX_MESSAGE_LENGTH)
    ) {
      throw createError(
        422,
        `links[${index}]: message must be a string of at most ${MAX_MESSAGE_LENGTH} characters`
      );
    }

    return {
      source,
      id: String(id),
      ...(message ? { message } : {}),
    };
  });
}

function assertHandlerAvailable(selection) {
  if (selection && !pluginExtensions.get().getLinkRequestHandler()) {
    throw createError(422, 'Link requests are not available');
  }
}

async function submitSelection({ project, resource, selection, user, mode }) {
  const handler = pluginExtensions.get().getLinkRequestHandler();
  if (!selection) return null;
  if (!handler) {
    throw createError(422, 'Link requests are not available');
  }

  try {
    return await handler.submit({ project, resource, selection, user, mode });
  } catch (err) {
    console.error(
      `[resource-link-requests] ${handler.pluginName} failed to handle ${mode} link requests for resource ${resource.id}:`,
      err.message
    );
    return { error: err.message };
  }
}

module.exports = { parseSelection, assertHandlerAvailable, submitSelection };
