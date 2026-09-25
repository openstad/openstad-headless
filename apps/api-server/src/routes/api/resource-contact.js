const express = require('express');
const createError = require('http-errors');
const db = require('../../db');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const pluginExtensions = require('../../services/plugin-extensions');

const router = express.Router({ mergeParams: true });

const MAX_MESSAGE_LENGTH = 2000;
const CONTACT_NOTIFICATION_TYPE = 'contact message - user';

function parseContactRequest(body) {
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw createError(
      422,
      `message can contain at most ${MAX_MESSAGE_LENGTH} characters`
    );
  }
  const fields =
    body.fields &&
    typeof body.fields === 'object' &&
    !Array.isArray(body.fields)
      ? body.fields
      : {};
  return {
    message,
    consent: body.consent === true,
    handlerKey: body.handler,
    fields,
  };
}

function assertDefaultContactRequest({ message, consent }) {
  if (!message) {
    throw createError(422, 'message is required');
  }
  if (!consent) {
    throw createError(422, 'consent to share your email address is required');
  }
}

router.post('/', rateLimiter(), async function (req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      throw createError(401, 'You must be logged in to send a message');
    }

    const resource = await db.Resource.findOne({
      where: {
        id: parseInt(req.params.resourceId, 10),
        projectId: parseInt(req.params.projectId, 10),
      },
    });
    if (!resource) {
      throw createError(404, 'Resource not found');
    }

    const { message, consent, handlerKey, fields } = parseContactRequest(
      req.body || {}
    );

    if (handlerKey !== undefined && handlerKey !== null) {
      const contactHandler = pluginExtensions
        .get()
        .getContactHandler(handlerKey);
      if (!contactHandler) {
        throw createError(422, 'Unknown contact handler');
      }
      const result = await contactHandler.handle({
        project: req.project,
        resource,
        message,
        consent,
        user: req.user,
        fields,
      });
      return res.json({ handled: true, result });
    }

    assertDefaultContactRequest({ message, consent });

    if (!req.user.email) {
      throw createError(422, 'Your account has no email address');
    }

    const owner = resource.userId
      ? await db.User.findByPk(resource.userId)
      : null;
    if (!owner || !owner.email) {
      throw createError(422, 'This submission cannot be contacted');
    }

    await db.Notification.create({
      type: CONTACT_NOTIFICATION_TYPE,
      projectId: req.project.id,
      to: owner.email,
      data: {
        resourceId: resource.id,
        userId: owner.id,
        message,
        senderName: req.user.name,
        senderEmail: req.user.email,
      },
    });

    res.json({ sent: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
