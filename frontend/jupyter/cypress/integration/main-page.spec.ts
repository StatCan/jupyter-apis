describe('Main table', () => {
  beforeEach(() => {
    cy.log("Mocking api calls");
    cy.mockNamespacesRequest();
    cy.fixture('settings').then(settings => {
      cy.mockNotebooksRequest(settings.namespace);
      cy.mockPVCsRequest(settings.namespace)
      cy.mockKubecostRequest(settings.namespace)
    });
  });

  it('should have a "Notebooks" title', () => {
    cy.visit('/');
    cy.get('[data-cy-toolbar-title]').contains('Notebooks').should('exist');
  });

  it('should list Notebooks without errors', () => {
    cy.visit('/');
    // wait for the request to fetch notebooks and namespaces
    cy.wait(['@mockNamespacesRequest', '@mockNotebooksRequest']);

    // after fetching the data the page should not have an error snackbar
    cy.get('[data-cy-snack-status=ERROR]').should('not.exist');
  });
});
