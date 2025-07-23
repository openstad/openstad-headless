import React from 'react'
import { Pill } from '../../src/pill'

describe('<Pill />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Pill />
    )
  });

  it('renders with text', () => {

    const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ut vehicula lorem. Cras eget purus vitae lectus facilisis dignissim id ac velit. Nam nisi neque, euismod id sodales sed, ultrices a sapien. Donec et nisi malesuada, molestie magna id, bibendum justo. Nullam nisl orci, venenatis eget luctus vitae, suscipit sit amet felis. Curabitur ornare quis ligula et interdum. Nullam fringilla quam lorem, sollicitudin dapibus purus varius ut.";

    cy.mount(
      <Pill text={text} />
    )

    cy.get('.osc-pill').should('exist').contains(text);
  });
});
