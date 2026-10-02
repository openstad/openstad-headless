import { Agenda } from '../../src/agenda';

const timelineItems = [
  {
    trigger: '0',
    title: 'Informatieavond',
    description: '',
    active: false,
    activeFrom: '2026-09-26',
    activeTo: '2026-09-26',
  },
  {
    trigger: '1',
    title: '2026-09-27',
    description: 'Rapportage',
    active: false,
    activeFrom: '2026-09-27',
    activeTo: '2026-09-27',
  },
  {
    trigger: '2',
    title: 'Publicatie',
    description: 'Publicatie van rapportage',
    active: false,
    activeFrom: '2026-09-28',
    activeTo: '2026-09-30',
  },
  {
    trigger: '3',
    title: 'Feedback',
    description: '',
    active: false,
    activeFrom: '2026-10-01',
  },
];

describe('<Agenda />', () => {
  it('renders without crashing', () => {
    cy.mount(<Agenda {...({} as any)} />);
  });

  describe('with active dates', () => {
    beforeEach(() => {
      cy.mount(
        <Agenda
          {...({
            items: timelineItems,
            useActiveDates: true,
            serverTime: '2026-09-30T10:00:00.000Z',
          } as any)}
        />
      );
    });

    it('keeps every reached item marked as passed', () => {
      cy.get('.osc-agenda-item').should('have.length', 4);
      cy.get('.osc-agenda-item.--passed-item').should('have.length', 3);
      cy.get('.osc-agenda-item')
        .eq(3)
        .should('not.have.class', '--passed-item');
    });

    it('marks only the current phase with aria-current', () => {
      cy.get('.osc-agenda-item[aria-current="true"]')
        .should('have.length', 1)
        .and('contain.text', 'Publicatie');
      cy.get('.osc-agenda-item.--active-item').should('have.length', 1);
    });

    it('shows date and title together in one heading', () => {
      cy.get('.osc-agenda-item')
        .eq(2)
        .find('h4')
        .should('have.length', 1)
        .and('have.text', '28 september 2026 – Publicatie');
      cy.get('.osc-agenda-item')
        .eq(2)
        .find('time')
        .should('have.attr', 'datetime', '2026-09-28');
    });

    it('shows only the date when no custom title is set', () => {
      cy.get('.osc-agenda-item')
        .eq(1)
        .find('h4')
        .should('have.text', '27 september 2026');
    });

    it('does not render an empty description paragraph', () => {
      cy.get('.osc-agenda-item').eq(0).find('p').should('not.exist');
      cy.get('.osc-agenda-item')
        .eq(2)
        .find('p')
        .should('have.text', 'Publicatie van rapportage');
    });
  });

  describe('with date notations', () => {
    beforeEach(() => {
      cy.mount(
        <Agenda
          {...({
            items: [
              {
                trigger: '0',
                title: 'Terugkoppeling',
                description: '',
                active: false,
                activeFrom: '2026-11-09',
                datePrecision: 'week',
              },
              {
                trigger: '1',
                title: 'Start uitvoering',
                description: '',
                active: false,
                activeFrom: '2027-07-01',
                datePrecision: 'quarter',
              },
              {
                trigger: '2',
                title: 'Oplevering',
                description: '',
                active: false,
                activeFrom: '2027-12-01',
                datePrecision: 'text',
                dateLabel: 'eind 2027',
              },
            ],
            useActiveDates: true,
            serverTime: '2026-11-10T10:00:00.000Z',
          } as any)}
        />
      );
    });

    it('shows the date in the chosen notation', () => {
      cy.get('.osc-agenda-item')
        .eq(0)
        .find('h4')
        .should('have.text', 'Week 46, 2026 – Terugkoppeling');
      cy.get('.osc-agenda-item')
        .eq(0)
        .find('time')
        .should('have.attr', 'datetime', '2026-W46');
      cy.get('.osc-agenda-item')
        .eq(1)
        .find('h4')
        .should('have.text', 'Q3 2027 – Start uitvoering');
      cy.get('.osc-agenda-item')
        .eq(2)
        .find('h4')
        .should('have.text', 'eind 2027 – Oplevering');
    });

    it('marks a period as passed from its first day', () => {
      cy.get('.osc-agenda-item').eq(0).should('have.class', '--passed-item');
      cy.get('.osc-agenda-item')
        .eq(1)
        .should('not.have.class', '--passed-item');
    });
  });

  describe('without active dates', () => {
    it('marks only the manually activated item', () => {
      cy.mount(
        <Agenda
          {...({
            items: [
              { trigger: '0', title: 'Fase 1', description: '', active: false },
              { trigger: '1', title: 'Fase 2', description: '', active: true },
            ],
          } as any)}
        />
      );
      cy.get('.osc-agenda-item.--passed-item')
        .should('have.length', 1)
        .and('contain.text', 'Fase 2');
      cy.get('.osc-agenda-item[aria-current="true"]').should('have.length', 1);
    });
  });
});
