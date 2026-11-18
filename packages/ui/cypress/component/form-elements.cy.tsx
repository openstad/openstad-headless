import React from 'react';

import RangeSlider from '../../src/form-elements/a-b-slider';
import Checkbox from '../../src/form-elements/checkbox';
import DocumentUploadField from '../../src/form-elements/document-upload';
import HiddenInput from '../../src/form-elements/hidden';
import ImageChoiceField from '../../src/form-elements/image-choice';
import ImageUploadField from '../../src/form-elements/image-upload';
import { toUploadedImageName } from '../../src/form-elements/image-upload/value';
import InfoField from '../../src/form-elements/info';
import MapField from '../../src/form-elements/map';
import NumberField from '../../src/form-elements/number';
import RadioField from '../../src/form-elements/radio';
import SelectField from '../../src/form-elements/select';
import TextField from '../../src/form-elements/text';
import TickmarkSlider from '../../src/form-elements/tickmark-slider';

describe('<RangeSlider />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<RangeSlider />);
  });
});

describe('<Checkbox />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Checkbox />);
  });
});

describe('<DocumentUploadField />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<DocumentUploadField />);
  });
});

describe('<HiddenInput />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<HiddenInput />);
  });
});

describe('<ImageChoiceField />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ImageChoiceField />);
  });
});

describe('<ImageUploadField />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ImageUploadField />);
  });
});

describe('<ImageUploadField /> remark order', () => {
  let nextUploadFileName = '';

  beforeEach(() => {
    cy.intercept('POST', '**/images', (req) => {
      const sanitizedName = toUploadedImageName(nextUploadFileName);
      req.reply([
        {
          name: sanitizedName,
          url: `https://example.com/${sanitizedName}`,
        },
      ]);
    }).as('uploadImage');
  });

  function mountField() {
    cy.mount(
      <ImageUploadField
        title="Photo"
        fieldKey="photo"
        randomId="photo-field"
        multiple={true}
        allowImageDescription={true}
        imageUrl="https://example.com"
        overrideDefaultValue={[
          { url: 'https://example.com/existing.png', name: 'existing_png' },
        ]}
      />
    );
  }

  function selectFile(target: string, fileName: string, dragDrop = false) {
    cy.then(() => {
      nextUploadFileName = fileName;
    });
    cy.get(target).selectFile(
      { contents: 'packages/ui/cypress/fixtures/test-image.png', fileName },
      dragDrop ? { action: 'drag-drop', force: true } : { force: true }
    );
    cy.wait('@uploadImage');
  }

  function assertOrdersMatch(expectedThumbnailCount: number) {
    cy.get('.filepond--file-status-main').should(($statusEls) => {
      const stillUploading = Cypress._.some($statusEls, (el) =>
        el.textContent?.includes('Uploaden')
      );
      expect(stillUploading, 'no item should still be uploading').to.be.false;
    });

    cy.get('.filepond--file-info-main').should(($thumbEls) => {
      expect($thumbEls, 'all thumbnails rendered').to.have.length(
        expectedThumbnailCount
      );
      const thumbs = Cypress._.map($thumbEls, (el) => el.textContent?.trim());

      const $remarkEls = Cypress.$('.image-crop-list-row label');
      const remarks = Cypress._.map($remarkEls, (el) => {
        const match = el.textContent?.match(/\(([^)]+)\)$/);
        return match ? match[1] : el.textContent?.trim();
      });

      expect(
        remarks,
        'remark box order should follow thumbnail order'
      ).to.deep.equal(thumbs);
    });
  }

  it('keeps thumbnail order and remark-box order in sync after browsing one file', () => {
    mountField();

    selectFile('input[type=file]', 'browsed_1.png');

    assertOrdersMatch(2);
  });

  it('keeps thumbnail order and remark-box order in sync after browsing a second file', () => {
    mountField();

    selectFile('input[type=file]', 'browsed_1.png');
    selectFile('input[type=file]', 'browsed_2.png');

    assertOrdersMatch(3);
  });

  it('labels a new upload with its local file name, not the server name', () => {
    mountField();

    selectFile('input[type=file]', 'foto met spaties.png');

    assertOrdersMatch(2);
    cy.get('.image-crop-list-row label')
      .first()
      .should(
        'have.text',
        'Opmerking bij deze afbeelding (foto met spaties.png)'
      );
  });

  it('still shows one correctly-named remark box per photo after a drag-and-drop upload, even out of order', () => {
    mountField();

    selectFile('.filepond--drop-label', 'dropped_1.png', true);

    cy.get('.filepond--file-status-main').should(($statusEls) => {
      const stillUploading = Cypress._.some($statusEls, (el) =>
        el.textContent?.includes('Uploaden')
      );
      expect(stillUploading, 'no item should still be uploading').to.be.false;
    });

    cy.get('.filepond--file-info-main').should(($thumbEls) => {
      expect($thumbEls, 'all thumbnails rendered').to.have.length(2);
      const thumbs = Cypress._.map($thumbEls, (el) =>
        el.textContent?.trim()
      ).sort();

      const $remarkEls = Cypress.$('.image-crop-list-row label');
      const remarks = Cypress._.map($remarkEls, (el) => {
        const match = el.textContent?.match(/\(([^)]+)\)$/);
        return match ? match[1] : el.textContent?.trim();
      }).sort();

      expect(
        remarks,
        'every thumbnail has exactly one identically-named remark box, regardless of position'
      ).to.deep.equal(thumbs);
    });
  });
});

describe('<ImageUploadField /> one card per photo', () => {
  const existingUrl = 'https://example.com/image/existing.png';

  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '**/image/**' },
      {
        statusCode: 200,
        headers: { 'content-type': 'image/png' },
        fixture: 'crop-test-800x600.png,null',
      }
    );
    cy.intercept('POST', '**/images', {
      body: [{ name: 'new_png', url: 'https://example.com/image/new.png' }],
    }).as('uploadImage');
  });

  function mountCard(props: Record<string, unknown> = {}) {
    cy.viewport(1000, 800);
    cy.mount(
      <ImageUploadField
        title="Photo"
        fieldKey="photo"
        randomId="photo-field"
        multiple={true}
        allowImageDescription={true}
        imageCropEnabled={true}
        imageUrl="https://example.com"
        overrideDefaultValue={[{ url: existingUrl, name: 'existing_png' }]}
        onChange={cy.stub().as('onChange')}
        {...props}
      />
    );
  }

  it('shows one card per photo with the remark box inside it when crop and remarks are on', () => {
    mountCard();

    cy.get('input[type=file]').selectFile(
      {
        contents: 'packages/ui/cypress/fixtures/test-image.png',
        fileName: 'new.png',
      },
      { force: true }
    );
    cy.wait('@uploadImage');

    cy.get('.image-crop-list-row').should('have.length', 2);
    cy.get('.image-crop-list-row').each(($row) => {
      cy.wrap($row).find('input[type=text]').should('have.length', 1);
      cy.wrap($row).contains('button', 'Bijsnijden').should('exist');
    });
    cy.get('.openstad-image-descriptions').should('not.exist');
  });

  it('shows a card without crop buttons when only remarks are on', () => {
    mountCard({ imageCropEnabled: false });

    cy.get('.image-crop-list-row input[type=text]').should('exist');
    cy.get('.image-crop-list-row')
      .contains('button', 'Bijsnijden')
      .should('not.exist');
  });

  it('shows a card without remark box when only cropping is on', () => {
    mountCard({ allowImageDescription: false });

    cy.get('.image-crop-list-row').should('have.length', 1);
    cy.get('.image-crop-list-row input[type=text]').should('not.exist');
    cy.get('.image-crop-list-row')
      .contains('button', 'Bijsnijden')
      .should('exist');
  });

  it('shows no card list when neither option is on', () => {
    mountCard({ imageCropEnabled: false, allowImageDescription: false });

    cy.get('.image-crop-list-row').should('not.exist');
  });

  it('keeps the remark when the photo is cropped afterwards', () => {
    mountCard();

    cy.get('.image-crop-list-row input[type=text]').type('Made with AI');
    cy.get('.image-crop-list-row').contains('button', 'Bijsnijden').click();
    cy.get('img.reactEasyCrop_Image', { timeout: 10000 }).should(($img) =>
      expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0)
    );
    cy.contains('button', 'Opslaan').click();

    cy.get('.image-crop-list-row input[type=text]').should(
      'have.value',
      'Made with AI'
    );
    cy.get('@onChange').should((stub) => {
      const last = (stub as unknown as sinon.SinonStub).lastCall.args[0];
      expect(last.value[0].url).to.contain('cr=');
      expect(last.value[0].description).to.equal('Made with AI');
    });
  });

  it('removes the card and its remark when the existing photo is removed in the file list', () => {
    mountCard({
      overrideDefaultValue: [
        { url: existingUrl, name: 'existing_png', description: 'Made with AI' },
      ],
    });

    cy.get('.filepond--action-remove-item').first().click({ force: true });

    cy.get('.image-crop-list-row').should('not.exist');
    cy.get('@onChange').should((stub) => {
      const last = (stub as unknown as sinon.SinonStub).lastCall.args[0];
      expect(last.value).to.deep.equal([]);
    });
  });

  it('keeps the remark when the crop is reset to the original', () => {
    mountCard({
      overrideDefaultValue: [
        {
          url: `${existingUrl}/:/cr=l:10%25,t:10%25,w:50%25,h:50%25`,
          name: 'existing_png',
          description: 'Made with AI',
        },
      ],
    });

    cy.contains('button', 'Herstel origineel').click();

    cy.get('.image-crop-list-row input[type=text]').should(
      'have.value',
      'Made with AI'
    );
    cy.get('@onChange').should((stub) => {
      const last = (stub as unknown as sinon.SinonStub).lastCall.args[0];
      expect(last.value[0].url).to.equal(existingUrl);
      expect(last.value[0].description).to.equal('Made with AI');
    });
  });
});

describe('<InfoField />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<InfoField />);
  });
});

describe('<MapField />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<MapField />);
  });
});

describe('<NumberField />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<NumberField />);
  });
});

describe('<RadioField />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<RadioField />);
  });
});

describe('<SelectField />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<SelectField />);
  });
});

describe('<TextField />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<TextField />);
  });
});

describe('<TickmarkSlider />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<TickmarkSlider />);
  });
});
