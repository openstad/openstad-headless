import {
  buildImageCropUrl,
  parseImageCropUrl,
} from '@openstad-headless/lib/image-crop/crop-url';
import React from 'react';

import ImageCropDialog from '../../src/form-elements/image-upload/image-crop-dialog';

const RATIO_WIDTH = 16;
const RATIO_HEIGHT = 9;

let imageCounter = 0;

/**
 * A fresh url per test, because the component test browser session is shared
 * and a cached response would hide the failure case.
 */
const nextImageUrl = () => {
  imageCounter += 1;
  return `http://image.test/image/foto-${imageCounter}.jpg`;
};

const servePreview = () =>
  cy
    .intercept(
      { method: 'GET', url: '**/image/**' },
      {
        statusCode: 200,
        headers: { 'content-type': 'image/png' },
        fixture: 'crop-test-800x600.png,null',
      }
    )
    .as('preview');

const failPreview = () =>
  cy
    .intercept({ method: 'GET', url: '**/image/**' }, { statusCode: 404 })
    .as('preview');

const mountDialog = (props: Record<string, unknown> = {}) => {
  const imageUrl = (props.imageUrl as string) || nextImageUrl();

  cy.viewport(1000, 800);
  cy.mount(
    <ImageCropDialog
      imageUrl={imageUrl}
      ratioWidth={RATIO_WIDTH}
      ratioHeight={RATIO_HEIGHT}
      onConfirm={cy.stub().as('onConfirm')}
      onCancel={cy.stub().as('onCancel')}
      onLoadError={cy.stub().as('onLoadError')}
      {...props}
    />
  );

  return imageUrl;
};

/**
 * react-easy-crop lets the image overflow its clipped container, which trips up
 * the built in visibility check. What matters here is that the media loaded, so
 * the natural size is the assertion.
 */
const waitForCropper = () =>
  cy
    .get('img.reactEasyCrop_Image', { timeout: 10000 })
    .should(($img) =>
      expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0)
    );

const confirmedCrop = (assert: (crop: Record<string, number>) => void) =>
  cy.get('@onConfirm').should((stub) => {
    const call = (stub as unknown as sinon.SinonStub).firstCall;
    expect(call, 'onConfirm is aangeroepen').to.not.equal(null);
    assert(call.args[0]);
  });

describe('<ImageCropDialog />', () => {
  it('loads a bounded preview instead of the untouched original', () => {
    servePreview();
    mountDialog();

    cy.get('img.reactEasyCrop_Image')
      .should('have.attr', 'src')
      .and('include', '/:/rs=w:1600,h:1600');
  });

  it('reports the crop as percentages inside the image', () => {
    servePreview();
    mountDialog();
    waitForCropper();

    cy.contains('button', 'Opslaan').click();

    confirmedCrop((crop) => {
      expect(crop.x, 'x').to.be.within(0, 100);
      expect(crop.y, 'y').to.be.within(0, 100);
      expect(crop.width, 'width').to.be.within(0, 100);
      expect(crop.height, 'height').to.be.within(0, 100);
      expect(crop.x + crop.width, 'x + width').to.be.at.most(100.001);
      expect(crop.y + crop.height, 'y + height').to.be.at.most(100.001);
    });
  });

  it('crops a 4 by 3 image to the configured 16 by 9 ratio', () => {
    servePreview();
    mountDialog();
    waitForCropper();

    cy.contains('button', 'Opslaan').click();

    confirmedCrop((crop) => {
      expect(crop.width, 'volle breedte').to.be.closeTo(100, 1);
      expect(crop.height, '16:9 van 4:3 is 75 procent hoogte').to.be.closeTo(
        75,
        1
      );
      expect(crop.y, 'gecentreerd').to.be.closeTo(12.5, 1);
    });
  });

  it('produces a url with the encoded percentage crop step', () => {
    servePreview();
    const imageUrl = mountDialog();
    waitForCropper();

    cy.contains('button', 'Opslaan').click();

    confirmedCrop((crop) => {
      const url = buildImageCropUrl(imageUrl, crop);
      expect(url).to.include('/:/cr=l:');
      expect(url).to.include('%25');
      expect(parseImageCropUrl(url).crop).to.not.equal(null);
      expect(parseImageCropUrl(url).hasCrop).to.equal(true);
    });
  });

  it('restores a zoomed in crop when reopened', () => {
    const saved = { x: 25, y: 31.25, width: 50, height: 37.5 };

    servePreview();
    mountDialog({ initialCrop: saved });
    waitForCropper();

    cy.contains('button', 'Opslaan').click();

    confirmedCrop((crop) => {
      expect(crop.x, 'x').to.be.closeTo(saved.x, 1);
      expect(crop.y, 'y').to.be.closeTo(saved.y, 1);
      expect(crop.width, 'width').to.be.closeTo(saved.width, 1);
      expect(crop.height, 'height').to.be.closeTo(saved.height, 1);
    });
  });

  it('restores a full width crop when reopened', () => {
    const saved = { x: 0, y: 12.5, width: 100, height: 75 };

    servePreview();
    mountDialog({ initialCrop: saved });
    waitForCropper();

    cy.contains('button', 'Opslaan').click();

    confirmedCrop((crop) => {
      expect(crop.x, 'x').to.be.closeTo(saved.x, 1);
      expect(crop.y, 'y').to.be.closeTo(saved.y, 1);
      expect(crop.width, 'width').to.be.closeTo(saved.width, 1);
      expect(crop.height, 'height').to.be.closeTo(saved.height, 1);
    });
  });

  it('explains the problem and stays usable when the image cannot load', () => {
    failPreview();
    mountDialog();

    cy.get('[role="alert"]').should('exist');
    cy.get('img.reactEasyCrop_Image').should('not.exist');
    cy.contains('button', 'Opslaan').should('not.exist');

    cy.contains('button', 'Sluiten').click();
    cy.get('@onLoadError').should('have.been.calledOnce');
    cy.get('@onCancel').should('not.have.been.called');
  });

  it('cancels on escape while the image is shown', () => {
    servePreview();
    mountDialog();
    waitForCropper();

    cy.get('[role="dialog"]').trigger('keydown', { key: 'Escape' });
    cy.get('@onCancel').should('have.been.calledOnce');
    cy.get('@onLoadError').should('not.have.been.called');
  });
});
