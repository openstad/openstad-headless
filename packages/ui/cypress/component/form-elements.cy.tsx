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

      const $remarkEls = Cypress.$('.openstad-image-descriptions label');
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
    cy.get('.openstad-image-descriptions label')
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

      const $remarkEls = Cypress.$('.openstad-image-descriptions label');
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
