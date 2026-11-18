import { useState } from 'react';

import Form from '../../src/form';

const paginatedFields = (firstFieldRequired = false) => [
  {
    type: 'text',
    title: 'Vraag een',
    fieldKey: 'vraag1',
    variant: 'text input',
    fieldRequired: firstFieldRequired,
  },
  { type: 'pagination', fieldKey: 'pag1' },
  {
    type: 'text',
    title: 'Vraag twee',
    fieldKey: 'vraag2',
    variant: 'text input',
  },
];

function PaginatedForm({ fields }: { fields: Array<Record<string, unknown>> }) {
  const [page, setPage] = useState(0);
  return (
    <div className="osc">
      <div className="osc-enquete-item-content">
        <Form
          {...({
            fields,
            submitHandler: () => {},
            submitText: 'Versturen',
            prevPageText: 'Vorige',
            nextPageText: 'Volgende',
            title: '',
            currentPage: page,
            setCurrentPage: setPage,
            totalPages: 2,
            pageFieldStartPositions: [0, 2],
            pageFieldEndPositions: [1, 3],
          } as any)}
        />
      </div>
    </div>
  );
}

type ScrollCall = {
  top?: number;
  behavior?: ScrollBehavior;
  formText: string;
};

const recordWindowScrolls = () => {
  const calls: ScrollCall[] = [];
  cy.window().then((win) => {
    cy.stub(win, 'scrollTo').callsFake((options: ScrollToOptions) => {
      calls.push({
        top: options?.top,
        behavior: options?.behavior,
        formText: win.document.querySelector('form')?.textContent || '',
      });
    });
  });
  return calls;
};

describe('<Form />', () => {
  it('renders without crashing', () => {
    cy.mount(<Form {...({} as any)} />);
  });

  it('shows scale feedback only after the user interacts with the slider', () => {
    const fields = [
      {
        type: 'tickmark-slider',
        fieldKey: 'scale1',
        title: 'Schaalvraag',
        fieldRequired: false,
        fieldOptions: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
        ],
        feedbackMode: 'perAnswer',
        scaleFeedback: ['Een', 'Twee', 'Drie', 'Vier', 'Vijf'],
      },
    ];

    cy.mount(<Form {...({ fields, submitHandler: () => {} } as any)} />);

    cy.get('.question-feedback').should('not.exist');

    cy.get('input[type="range"]').then(($el) => {
      const el = $el[0] as HTMLInputElement;
      const win = el.ownerDocument.defaultView as Window & typeof globalThis;
      const setter = Object.getOwnPropertyDescriptor(
        win.HTMLInputElement.prototype,
        'value'
      )?.set;
      setter?.call(el, '4');
      el.dispatchEvent(new win.Event('input', { bubbles: true }));
      el.dispatchEvent(new win.Event('change', { bubbles: true }));
    });

    cy.get('.question-feedback').should('contain.text', 'Vier');
  });

  it('scrolls to its own widget container, not another widget higher on the page', () => {
    const fields = [
      {
        type: 'text',
        fieldKey: 'q1',
        title: 'Vraag',
        fieldRequired: false,
      },
    ];

    cy.mount(
      <div>
        <div
          className="osc-enquete-item-content"
          data-testid="decoy"
          style={{ height: '300px' }}
        />
        <div className="osc-enquete-item-content" data-testid="own">
          <Form {...({ fields, submitHandler: () => {} } as any)} />
        </div>
      </div>
    );

    cy.window().then((win) => {
      cy.stub(win, 'scrollTo').as('scrollTo');
    });

    cy.get('[data-testid="own"]').then(($own) => {
      const ownTop = $own[0].getBoundingClientRect().top;

      cy.get('button[type="submit"]').click();

      cy.get('@scrollTo').should('have.been.calledWithMatch', {
        top: ownTop,
      });
    });
  });

  it('keeps a confirmed graded answer locked when restored from a draft', () => {
    const fields = [
      {
        type: 'radiobox',
        fieldKey: 'quiz1',
        title: 'Quizvraag',
        fieldRequired: false,
        feedbackMode: 'correctIncorrect',
        feedbackCorrect: 'Goed zo',
        choices: [
          { value: 'a', label: 'A', isCorrect: true },
          { value: 'b', label: 'B' },
        ],
      },
    ];

    cy.mount(
      <Form
        {...({
          fields,
          submitHandler: () => {},
          initialValues: { quiz1: 'a' },
          initialConfirmedFields: ['quiz1'],
          initialTouchedFields: ['quiz1'],
        } as any)}
      />
    );

    cy.get('.osc-confirm-answer-button').should('not.exist');
    cy.get('input[type="radio"]').should('be.disabled');
    cy.get('.question-feedback').should('contain.text', 'Goed zo');
  });

  it('requires confirmation for a graded radio without instantFeedback', () => {
    const fields = [
      {
        type: 'radiobox',
        fieldKey: 'quiz1',
        title: 'Quizvraag',
        fieldRequired: false,
        feedbackMode: 'correctIncorrect',
        feedbackCorrect: 'Goed zo',
        choices: [
          { value: 'a', label: 'A', isCorrect: true },
          { value: 'b', label: 'B' },
        ],
      },
    ];

    cy.mount(<Form {...({ fields, submitHandler: () => {} } as any)} />);

    cy.get('#quiz1_0').check({ force: true });

    cy.get('.osc-confirm-answer-button').should('exist');
    cy.get('.question-feedback').should('not.exist');
    cy.get('input[type="radio"]').should('not.be.disabled');
  });

  it('reveals feedback immediately for a graded radio with instantFeedback', () => {
    const fields = [
      {
        type: 'radiobox',
        fieldKey: 'quiz1',
        title: 'Quizvraag',
        fieldRequired: false,
        instantFeedback: true,
        feedbackMode: 'correctIncorrect',
        feedbackCorrect: 'Goed zo',
        choices: [
          { value: 'a', label: 'A', isCorrect: true },
          { value: 'b', label: 'B' },
        ],
      },
    ];

    cy.mount(<Form {...({ fields, submitHandler: () => {} } as any)} />);

    cy.get('.osc-confirm-answer-button').should('not.exist');

    cy.get('#quiz1_0').check({ force: true });

    cy.get('.question-feedback').should('contain.text', 'Goed zo');
    cy.get('input[type="radio"]').should('be.disabled');
    cy.get('.osc-confirm-answer-button').should('not.exist');
    cy.get('.question').should('have.class', '--answer-correct');
  });

  it('locks each ticked option and reveals the score at maxChoices for an instant checkbox', () => {
    const fields = [
      {
        type: 'checkbox',
        fieldKey: 'quizc',
        title: 'Meerkeuze quiz',
        fieldRequired: false,
        instantFeedback: true,
        maxChoices: '2',
        feedbackMode: 'correctIncorrect',
        feedbackCorrect: 'Helemaal goed',
        feedbackIncorrect: 'Niet helemaal',
        choices: [
          { value: 'a', label: 'A', isCorrect: true },
          { value: 'b', label: 'B', isCorrect: true },
          { value: 'c', label: 'C' },
        ],
      },
    ];

    cy.mount(<Form {...({ fields, submitHandler: () => {} } as any)} />);

    cy.get('.osc-confirm-answer-button').should('not.exist');

    cy.get('#quizc_0').check({ force: true });
    cy.get('#quizc_0').should('be.disabled');
    cy.get('#quizc_1').should('not.be.disabled');
    cy.get('.question-feedback').should('not.exist');

    cy.get('#quizc_1').check({ force: true });
    cy.get('.question-feedback').should('contain.text', 'Helemaal goed');
    cy.get('#quizc_1').should('be.disabled');
  });

  it('reveals per-option feedback but never a score for an instant checkbox without maxChoices', () => {
    const submit = cy.stub().as('submit');
    const fields = [
      {
        type: 'checkbox',
        fieldKey: 'quizc',
        title: 'Meerkeuze quiz',
        fieldRequired: false,
        instantFeedback: true,
        feedbackMode: 'correctIncorrect',
        feedbackCorrect: 'Helemaal goed',
        choices: [
          { value: 'a', label: 'A', isCorrect: true },
          { value: 'b', label: 'B' },
        ],
      },
    ];

    cy.mount(<Form {...({ fields, submitHandler: submit } as any)} />);

    cy.get('#quizc_0').check({ force: true });
    cy.get('#quizc_0').should('be.disabled');
    cy.get('.osc-confirm-answer-button').should('not.exist');
    cy.get('.question-feedback').should('not.exist');

    cy.get('button[type="submit"]').click();
    cy.contains('Bevestig eerst').should('not.exist');
    cy.get('@submit').should('have.been.called');
  });

  it('scrolls to the form top only after the next page has rendered', () => {
    cy.mount(<PaginatedForm fields={paginatedFields()} />);
    const calls = recordWindowScrolls();

    cy.get('button[type="submit"]').click();
    cy.contains('Vraag twee').should('exist');

    cy.wrap(calls).should((recorded: ScrollCall[]) => {
      expect(recorded).to.have.length.greaterThan(0);
      recorded.forEach((call) => {
        expect(call.formText).to.contain('Vraag twee');
        expect(call.behavior).to.equal('smooth');
      });
    });
  });

  it('scrolls to the form top only after the previous page has rendered', () => {
    cy.mount(<PaginatedForm fields={paginatedFields()} />);
    cy.get('button[type="submit"]').click();
    cy.contains('Vraag twee').should('exist');
    const calls = recordWindowScrolls();

    cy.get('.osc-prev-button').click();
    cy.contains('Vraag een').should('exist');

    cy.wrap(calls).should((recorded: ScrollCall[]) => {
      expect(recorded).to.have.length.greaterThan(0);
      recorded.forEach((call) => {
        expect(call.formText).to.contain('Vraag een');
        expect(call.behavior).to.equal('smooth');
      });
    });
  });

  it('scrolls smoothly to the form top when the page has validation errors', () => {
    cy.mount(<PaginatedForm fields={paginatedFields(true)} />);
    const calls = recordWindowScrolls();

    cy.get('button[type="submit"]').click();
    cy.contains('is verplicht').should('exist');
    cy.contains('Vraag twee').should('not.exist');

    cy.get('.osc-enquete-item-content').then(($container) => {
      const container = $container[0];
      const formTop =
        container.getBoundingClientRect().top +
        (container.ownerDocument.defaultView?.scrollY ?? 0);

      cy.wrap(calls).should((recorded: ScrollCall[]) => {
        expect(
          recorded.some(
            (call) => call.top === formTop && call.behavior === 'smooth'
          )
        ).to.equal(true);
      });
    });
  });
});
