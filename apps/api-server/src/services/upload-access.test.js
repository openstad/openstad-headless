import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  projectAllowsAnonymousUpload,
  userCanUploadToProject,
  widgetConfigHasUploadField,
} = require('./upload-access');

describe('widgetConfigHasUploadField', () => {
  it('recognises an enquete image upload question', () => {
    expect(
      widgetConfigHasUploadField({
        items: [{ questionType: 'imageUpload' }],
      })
    ).toBe(true);
  });

  it('recognises a resource form document upload field', () => {
    expect(
      widgetConfigHasUploadField({
        items: [{ type: 'documents', fieldType: 'documentUpload' }],
      })
    ).toBe(true);
  });

  it('ignores a moderator-only upload field', () => {
    expect(
      widgetConfigHasUploadField({
        items: [{ fieldType: 'imageUpload', onlyForModerator: true }],
      })
    ).toBe(false);
  });

  it('finds an upload field nested in a group', () => {
    expect(
      widgetConfigHasUploadField({
        items: [{ type: 'group', items: [{ questionType: 'documentUpload' }] }],
      })
    ).toBe(true);
  });

  it('ignores a form without upload fields', () => {
    expect(
      widgetConfigHasUploadField({
        items: [{ questionType: 'open' }, { fieldType: 'text' }],
      })
    ).toBe(false);
  });
});

describe('projectAllowsAnonymousUpload', () => {
  it('allows a project when one widget has a visitor upload field', () => {
    expect(
      projectAllowsAnonymousUpload([
        { config: { items: [{ questionType: 'open' }] } },
        { config: { items: [{ fieldType: 'imageUpload' }] } },
      ])
    ).toBe(true);
  });

  it('refuses a project whose widgets have no upload field', () => {
    expect(
      projectAllowsAnonymousUpload([
        { config: { items: [{ questionType: 'open' }] } },
      ])
    ).toBe(false);
  });
});

describe('userCanUploadToProject', () => {
  const adminProjectId = 1;

  it('allows a member of the project', () => {
    expect(
      userCanUploadToProject(
        { id: 4, role: 'member', projectId: 8 },
        8,
        adminProjectId
      )
    ).toBe(true);
  });

  it('refuses a member of another project', () => {
    expect(
      userCanUploadToProject(
        { id: 4, role: 'member', projectId: 8 },
        9,
        adminProjectId
      )
    ).toBe(false);
  });

  it('allows an admin of the admin project on any project', () => {
    expect(
      userCanUploadToProject(
        { id: 2, role: 'admin', projectId: adminProjectId },
        9,
        adminProjectId
      )
    ).toBe(true);
  });

  it('allows a superuser on any project', () => {
    expect(
      userCanUploadToProject(
        { id: 2, role: 'superuser', projectId: 3 },
        9,
        adminProjectId
      )
    ).toBe(true);
  });

  it('refuses a user without an id', () => {
    expect(
      userCanUploadToProject(
        { id: null, role: 'anonymous', projectId: 8 },
        8,
        adminProjectId
      )
    ).toBe(false);
  });
});
