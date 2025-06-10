describe('Can log into admin server', () => {
  
  it('Allows us to log in as an admin', () => {
    cy.visit(Cypress.env('ADMIN_URL'))
    cy.contains('Welcome to Openstad');
    cy.contains('Sign in').click();
    
    cy.origin(Cypress.env('AUTH_APP_URL'), () => {
      cy.location('href').should('include', '/login');
      cy.contains('Hoe wil je inloggen?').should('exist');
      cy.contains('stemcode').click();
      
      cy.get('input[name="unique_code"]').type('does-not-exist');
      cy.get('input[type="submit"]').click();
      cy.get('div.side-error').should('contain', 'Vul een geldige stemcode in.');
      
      cy.get('input[name="unique_code"]').type(Cypress.env('AUTH_FIRST_LOGIN_CODE'));
      cy.get('input[type="submit"]').click();
    });
    
    cy.contains('Uitloggen').should('exist');
    cy.get('h1').should('contain', 'Projecten');
    
    
  })
})
