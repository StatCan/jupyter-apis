describe('Main table', () => {
  beforeEach(() => {
    cy.mockNamespacesRequest();
    cy.fixture('settings').then(settings => {
      cy.mockNotebooksRequest(settings.namespace);
      cy.mockPVCsRequest(settings.namespace)
      cy.mockKubecostRequest(settings.namespace)
    });
    cy.fixture('notebooks').as('notebooksRequest');
    cy.fixture('pvcs').as('pvcsRequest');
    cy.visit('/');
  });

  it('should have a "Notebooks" title', () => {
    cy.get('[data-cy-toolbar-title]').contains('Notebooks').should('exist');
  });

  it('should list Notebooks without errors', () => {
    // wait for the request to fetch notebooks and namespaces
    cy.wait(['@mockNamespacesRequest', '@mockNotebooksRequest']);

    // after fetching the data the page should not have an error snackbar
    cy.get('[data-cy-snack-status=ERROR]').should('not.exist');
  });

  // We use function () in order to be able to access aliases via this
  // tslint:disable-next-line: space-before-function-paren
  it('renders every Notebook name into the table', function () {
    cy.wait(['@mockNamespacesRequest', '@mockNotebooksRequest']);

    let i = 0;
    const notebooks = this.notebooksRequest.notebooks;
    // Table is sorted by Name in ascending order by default
    // and pvcs object is also sorted alphabetically by name
    cy.get('[data-cy-table-id="notebooks-table"]').find(`[data-cy-resource-table-row="Name"]`).each(element => {
      expect(element).to.contain(notebooks[i].name);
      i++;
    });
  });

  // tslint:disable-next-line: space-before-function-paren
  it('checks Status icon for all notebooks', function () {
    cy.wait(['@mockNamespacesRequest', '@mockNotebooksRequest']);

    let i = 0;
    const notebooks = this.notebooksRequest.notebooks;
    cy.get('[data-cy-table-id="notebooks-table"]').find('[data-cy-resource-table-row="Status"]').each(element => {
      if (notebooks[i].status.phase === 'ready') {
        cy.wrap(element)
          .find('lib-status>mat-icon')
          .should('contain', 'check_circle');
      } else if (notebooks[i].status.phase === 'stopped') {
        cy.wrap(element)
          .find('lib-status>lib-icon')
          .should('have.attr', 'icon', 'custom:stoppedResource');
      } else if (notebooks[i].status.phase === 'unavailable') {
        cy.wrap(element)
          .find('lib-status>mat-icon')
          .should('contain', 'timelapse');
      } else if (notebooks[i].status.phase === 'warning') {
        cy.wrap(element)
          .find('lib-status>mat-icon')
          .should('contain', 'warning');
      } else if (
        notebooks[i].status.phase === 'waiting' ||
        notebooks[i].status.phase === 'terminating'
      ) {
        cy.wrap(element).find('mat-spinner').should('exist');
      }
      i++;
    });
  });

  // We use function () in order to access aliases via this
  it('renders every PVC name into the table', function () {
    cy.wait([
      '@mockNamespacesRequest',
      '@mockPVCsRequest',
    ]);

    let i = 0;
    const pvcs = this.pvcsRequest.pvcs;
    // Table is sorted by Name in ascending order by default
    // and pvcs object is also sorted alphabetically by name
    cy.get('[data-cy-table-id="volumes-table"]').find(`[data-cy-resource-table-row="Name"]`).each(element => {
      expect(element).to.contain(pvcs[i].name);
      i++;
    });
  });

  it('checks Status icon for all PVCs', function () {
    cy.wait([
      '@mockNamespacesRequest',
      '@mockPVCsRequest',
    ]);

    let i = 0;
    const pvcs = this.pvcsRequest.pvcs;
    cy.get('[data-cy-table-id="volumes-table"]').find('[data-cy-resource-table-row="Status"]').each(element => {
      if (pvcs[i].status.phase === 'attached') {
        cy.wrap(element)
          .find('lib-status>mat-icon')
          .should('contain', 'link');
      } else if (pvcs[i].status.phase === 'unattached') {
        cy.wrap(element)
          .find('lib-status>mat-icon')
          .should('contain', 'link_off');
      }
      i++;
    });
  });
});
