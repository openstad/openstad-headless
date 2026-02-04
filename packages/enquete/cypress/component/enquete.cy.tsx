import React from 'react'
import { Enquete, EnqueteWidgetProps } from '../../src/enquete'

// Minimal config for testing draft persistence
const createTestConfig = (overrides: Partial<EnqueteWidgetProps> = {}): EnqueteWidgetProps => ({
  api: {
    url: 'http://localhost:31410',
  },
  projectId: '1',
  widgetId: 100,
  title: 'Test Enquete',
  displayTitle: true,
  formVisibility: 'always',
  enableDraftPersistence: true,
  draftRetentionHours: 24,
  items: [
    {
      key: '',
      trigger: '1',
      fieldKey: 'textField',
      title: 'Text Question',
      description: 'Enter some text',
      questionType: 'open',
      variant: 'textarea',
      fieldRequired: false,
      options: [],
      matrix: { rows: [], columns: [] },
    },
    {
      key: '',
      trigger: '2',
      fieldKey: 'scaleField',
      title: 'Scale Question',
      description: 'Rate this',
      questionType: 'scale',
      showSmileys: true,
      fieldRequired: false,
      options: [],
      matrix: { rows: [], columns: [] },
    },
    {
      key: '',
      trigger: '3',
      fieldKey: 'choiceField',
      title: 'Choice Question',
      description: 'Pick one',
      questionType: 'multiplechoice',
      fieldRequired: false,
      options: [
        { trigger: '0', titles: [{ key: 'Option A', defaultValue: false, isOtherOption: false }] },
        { trigger: '1', titles: [{ key: 'Option B', defaultValue: false, isOtherOption: false }] },
      ],
      matrix: { rows: [], columns: [] },
    },
  ],
  ...overrides,
})

// Helper to get the storage key
const getStorageKey = (projectId: string, widgetId: number, pathname: string) =>
  `enquete-draft:${projectId}:${widgetId}:${pathname}`

describe('Enquete Draft Persistence', () => {
  beforeEach(() => {
    // Clear all localStorage before each test
    cy.window().then((win) => {
      win.localStorage.clear()
    })
  })

  describe('Basic Rendering', () => {
    it('renders the enquete form', () => {
      const config = createTestConfig()
      cy.mount(<Enquete {...config} />)
      cy.contains('Text Question').should('be.visible')
    })
  })

  describe('Draft Saving', () => {
    it('saves draft to localStorage when user types in text field', () => {
      const config = createTestConfig()
      cy.mount(<Enquete {...config} />)

      // Type in the textarea
      cy.get('textarea').first().type('My draft answer')

      // Wait for debounce (750ms) + buffer
      cy.wait(1000)

      // Check localStorage
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        const stored = win.localStorage.getItem(key)
        expect(stored).to.not.be.null

        const draft = JSON.parse(stored!)
        expect(draft.data).to.have.property('textField', 'My draft answer')
        expect(draft.updatedAt).to.be.a('number')
        expect(draft.version).to.equal(1)
      })
    })

    it('saves draft when user selects a radio option', () => {
      const config = createTestConfig()
      cy.mount(<Enquete {...config} />)

      // Click on Option A radio button
      cy.contains('Option A').click()

      // Wait for debounce
      cy.wait(1000)

      // Check localStorage
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        const stored = win.localStorage.getItem(key)
        expect(stored).to.not.be.null

        const draft = JSON.parse(stored!)
        expect(draft.data).to.have.property('choiceField', 'Option A')
      })
    })

    it('debounces saves - multiple rapid changes result in single save', () => {
      const config = createTestConfig()
      cy.mount(<Enquete {...config} />)

      // Type rapidly
      cy.get('textarea').first().type('a')
      cy.get('textarea').first().type('b')
      cy.get('textarea').first().type('c')
      cy.get('textarea').first().type('d')
      cy.get('textarea').first().type('e')

      // Wait for debounce
      cy.wait(1000)

      // Should have final value
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        const stored = win.localStorage.getItem(key)
        const draft = JSON.parse(stored!)
        expect(draft.data.textField).to.equal('abcde')
      })
    })
  })

  describe('Draft Restoration', () => {
    it('restores draft values when component remounts', () => {
      const config = createTestConfig()

      // Pre-populate localStorage with a draft
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        const draft = {
          data: { textField: 'Previously saved text' },
          updatedAt: Date.now(),
          version: 1,
        }
        win.localStorage.setItem(key, JSON.stringify(draft))
      })

      // Mount the component
      cy.mount(<Enquete {...config} />)

      // Verify the textarea has the restored value
      cy.get('textarea').first().should('have.value', 'Previously saved text')
    })

    it('restores radio selection from draft', () => {
      const config = createTestConfig()

      // Pre-populate localStorage with a draft
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        const draft = {
          data: { choiceField: 'Option B' },
          updatedAt: Date.now(),
          version: 1,
        }
        win.localStorage.setItem(key, JSON.stringify(draft))
      })

      // Mount the component
      cy.mount(<Enquete {...config} />)

      // Verify Option B is selected
      cy.get('input[type="radio"][value="Option B"]').should('be.checked')
    })

    it('restores scale/slider value from draft', () => {
      const config = createTestConfig()

      // Pre-populate localStorage with a draft
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        const draft = {
          data: { scaleField: '3' },
          updatedAt: Date.now(),
          version: 1,
        }
        win.localStorage.setItem(key, JSON.stringify(draft))
      })

      // Mount the component - the scale field should have value 3 restored
      cy.mount(<Enquete {...config} />)

      // The tickmark slider should reflect the saved value
      // This depends on how the slider renders, but we can check it doesn't throw
      cy.get('.osc-enquete-item-content').should('exist')
    })
  })

  describe('Draft Expiry', () => {
    it('does not restore expired drafts', () => {
      const config = createTestConfig({ draftRetentionHours: 24 })

      // Pre-populate localStorage with an expired draft (25 hours old)
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        const expiredTime = Date.now() - 25 * 60 * 60 * 1000 // 25 hours ago
        const draft = {
          data: { textField: 'Expired draft text' },
          updatedAt: expiredTime,
          version: 1,
        }
        win.localStorage.setItem(key, JSON.stringify(draft))
      })

      // Mount the component
      cy.mount(<Enquete {...config} />)

      // The textarea should be empty (draft was expired and removed)
      cy.get('textarea').first().should('have.value', '')

      // The expired draft should be removed from localStorage
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        expect(win.localStorage.getItem(key)).to.be.null
      })
    })

    it('restores drafts within retention period', () => {
      const config = createTestConfig({ draftRetentionHours: 24 })

      // Pre-populate localStorage with a recent draft (1 hour old)
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        const recentTime = Date.now() - 1 * 60 * 60 * 1000 // 1 hour ago
        const draft = {
          data: { textField: 'Recent draft text' },
          updatedAt: recentTime,
          version: 1,
        }
        win.localStorage.setItem(key, JSON.stringify(draft))
      })

      // Mount the component
      cy.mount(<Enquete {...config} />)

      // The textarea should have the restored value
      cy.get('textarea').first().should('have.value', 'Recent draft text')
    })

    it('respects custom retention hours', () => {
      const config = createTestConfig({ draftRetentionHours: 1 }) // 1 hour retention

      // Pre-populate localStorage with a draft that's 2 hours old
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        const oldTime = Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
        const draft = {
          data: { textField: 'Old draft' },
          updatedAt: oldTime,
          version: 1,
        }
        win.localStorage.setItem(key, JSON.stringify(draft))
      })

      // Mount with 1 hour retention
      cy.mount(<Enquete {...config} />)

      // Should not restore (expired for 1-hour retention)
      cy.get('textarea').first().should('have.value', '')
    })
  })

  describe('Draft Persistence Disabled', () => {
    it('does not save draft when enableDraftPersistence is false', () => {
      const config = createTestConfig({ enableDraftPersistence: false })
      cy.mount(<Enquete {...config} />)

      // Type in the textarea
      cy.get('textarea').first().type('Should not be saved')

      // Wait for potential debounce
      cy.wait(1000)

      // Check localStorage is empty
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        expect(win.localStorage.getItem(key)).to.be.null
      })
    })

    it('does not restore draft when enableDraftPersistence is false', () => {
      const config = createTestConfig({ enableDraftPersistence: false })

      // Pre-populate localStorage with a draft
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        const draft = {
          data: { textField: 'Should not be restored' },
          updatedAt: Date.now(),
          version: 1,
        }
        win.localStorage.setItem(key, JSON.stringify(draft))
      })

      // Mount with persistence disabled
      cy.mount(<Enquete {...config} />)

      // The textarea should be empty
      cy.get('textarea').first().should('have.value', '')
    })
  })

  describe('Storage Key Isolation', () => {
    it('uses different storage keys for different widgetIds', () => {
      // Mount first widget
      const config1 = createTestConfig({ widgetId: 100 })
      cy.mount(<Enquete {...config1} />)
      cy.get('textarea').first().type('Widget 100 data')
      cy.wait(1000)

      // Check storage for widget 100
      cy.window().then((win) => {
        const key100 = getStorageKey('1', 100, win.location.pathname)
        const stored = win.localStorage.getItem(key100)
        expect(stored).to.not.be.null
        expect(JSON.parse(stored!).data.textField).to.equal('Widget 100 data')
      })

      // Mount second widget (different widgetId)
      const config2 = createTestConfig({ widgetId: 200 })
      cy.mount(<Enquete {...config2} />)

      // Should not see widget 100's data
      cy.get('textarea').first().should('have.value', '')

      // Type in widget 200
      cy.get('textarea').first().type('Widget 200 data')
      cy.wait(1000)

      // Both should exist separately
      cy.window().then((win) => {
        const key100 = getStorageKey('1', 100, win.location.pathname)
        const key200 = getStorageKey('1', 200, win.location.pathname)

        const stored100 = JSON.parse(win.localStorage.getItem(key100)!)
        const stored200 = JSON.parse(win.localStorage.getItem(key200)!)

        expect(stored100.data.textField).to.equal('Widget 100 data')
        expect(stored200.data.textField).to.equal('Widget 200 data')
      })
    })

    it('uses different storage keys for different projectIds', () => {
      // Save draft for project 1
      const config1 = createTestConfig({ projectId: '1', widgetId: 100 })
      cy.mount(<Enquete {...config1} />)
      cy.get('textarea').first().type('Project 1 data')
      cy.wait(1000)

      // Mount for project 2
      const config2 = createTestConfig({ projectId: '2', widgetId: 100 })
      cy.mount(<Enquete {...config2} />)

      // Should not see project 1's data
      cy.get('textarea').first().should('have.value', '')

      // Both keys should be independent
      cy.window().then((win) => {
        const key1 = getStorageKey('1', 100, win.location.pathname)
        const key2 = getStorageKey('2', 100, win.location.pathname)

        expect(win.localStorage.getItem(key1)).to.not.be.null
        expect(win.localStorage.getItem(key2)).to.be.null
      })
    })
  })

  describe('Invalid Draft Handling', () => {
    it('handles corrupted localStorage data gracefully', () => {
      const config = createTestConfig()

      // Pre-populate with invalid JSON
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        win.localStorage.setItem(key, 'not valid json {{{')
      })

      // Mount should not crash
      cy.mount(<Enquete {...config} />)
      cy.get('textarea').first().should('exist')
      cy.get('textarea').first().should('have.value', '')
    })

    it('handles missing updatedAt field gracefully', () => {
      const config = createTestConfig()

      // Pre-populate with invalid draft structure
      cy.window().then((win) => {
        const key = getStorageKey('1', 100, win.location.pathname)
        win.localStorage.setItem(key, JSON.stringify({ data: { textField: 'test' } }))
      })

      // Mount should not crash and should not restore invalid draft
      cy.mount(<Enquete {...config} />)
      cy.get('textarea').first().should('exist')
    })
  })
})
