/// <reference types="cypress" />

Cypress.Commands.add('mockNamespacesRequest', () => {
  cy.intercept('GET', '/api/namespaces', {
    fixture: 'namespaces',
  }).as('mockNamespacesRequest');
});

Cypress.Commands.add('mockNotebooksRequest', namespace => {
  cy.intercept('GET', `/api/namespaces/${namespace}/notebooks`, {
    fixture: 'notebooks',
  }).as('mockNotebooksRequest');
});

Cypress.Commands.add('mockPVCsRequest', namespace => {
  cy.intercept('GET', `/api/namespaces/${namespace}/pvcs`, {
    fixture: 'pvcs',
  }).as('mockPVCsRequest');
});

Cypress.Commands.add('mockKubecostRequest', namespace => {
  cy.intercept('GET', `/api/namespaces/${namespace}/cost/allocation`, {
    fixture: 'cost',
  }).as('mockKubecostRequest');
});
