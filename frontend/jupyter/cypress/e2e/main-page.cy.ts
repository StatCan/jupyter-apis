describe('Main tables', () => {
  beforeEach(() => {
    cy.fixture('settings').then(settings => {
      cy.mockNotebooksRequest(settings.namespace);
      cy.mockPVCsRequest(settings.namespace);
      cy.mockKubecostRequest(settings.namespace);
    });
    cy.fixture('notebooks').as('notebooksRequest');
    cy.fixture('pvcs').as('pvcsRequest');
    cy.visit('/');
  });

  describe('Notebooks table', () => {
    beforeEach(() => {
      cy.wait(['@mockNotebooksRequest']);
    });

    it('should have a "Notebooks" title', () => {
      cy.get('[data-cy-toolbar-title]').contains('Notebooks').should('exist');
    });

    it('should have the Notebooks table', () => {
      cy.get('[data-cy-table-id="notebooks-table"]').should('exist');
      cy.get('[data-cy-table-id="notebooks-table"] > tbody > tr').should(
        'have.length',
        7,
      );

      cy.get('[data-cy-toolbar-button="New Notebook"]')
        .should('exist')
        .and('be.enabled');
    });

    it('should list Notebooks without errors', () => {
      // after fetching the data the page should not have an error snackbar
      cy.get('[data-cy-snack-status=ERROR]').should('not.exist');
    });

    // We use function () in order to be able to access aliases via this
    it('renders every Notebook name into the table', function () {
      let i = 0;
      const notebooks = this.notebooksRequest.notebooks;
      // Table is sorted by Name in ascending order by default
      // and pvcs object is also sorted alphabetically by name
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .each(element => {
          expect(element).to.contain(notebooks[i].name);
          i++;
        });
    });

    it('checks Status icon for all notebooks', function () {
      let i = 0;
      const notebooks = this.notebooksRequest.notebooks;
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find('[data-cy-resource-table-row="Status"]')
        .each(element => {
          if (notebooks[i].status.phase === 'ready') {
            cy.wrap(element)
              .find('lib-status-icon>mat-icon')
              .should('contain', 'check_circle');
          } else if (notebooks[i].status.phase === 'stopped') {
            cy.wrap(element)
              .find('lib-status-icon>lib-icon')
              .should('have.attr', 'icon', 'custom:stoppedResource');
          } else if (notebooks[i].status.phase === 'unavailable') {
            cy.wrap(element)
              .find('lib-status-icon>mat-icon')
              .should('contain', 'timelapse');
          } else if (notebooks[i].status.phase === 'warning') {
            cy.wrap(element)
              .find('lib-status-icon>mat-icon')
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

    it('should start a notebook', () => {
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a0-new-image')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-button="connect"] > button')
        .should('be.disabled');
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a0-new-image')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="start-stop"] > button')
        .should('have.text', ' play_arrow\n');
      cy.intercept(
        'PATCH',
        '/api/namespaces/kubeflow-user/notebooks/a0-new-image',
        { success: true, status: 200 },
      ).as('mockStartNotebook');
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a0-new-image')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="start-stop"]')
        .click();
      cy.wait('@mockStartNotebook')
        .its('response.statusCode')
        .should('eq', 200);
    });

    it('should stop a notebook', () => {
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-test-01')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-button="connect"] > button')
        .should('be.enabled');
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-test-01')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="start-stop"] > button')
        .should('have.text', ' stop\n');
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-test-01')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="start-stop"]')
        .click();
      cy.get('.mat-mdc-dialog-title')
        .should('be.visible')
        .and(
          'have.text',
          'Are you sure you want to stop this notebook server? a-test-01',
        );
      cy.get('.mat-mdc-dialog-actions > button').contains('CANCEL').click();
      cy.get('mat-dialog-container').should('not.exist');
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-test-01')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="start-stop"]')
        .click();
      cy.intercept(
        'PATCH',
        '/api/namespaces/kubeflow-user/notebooks/a-test-01',
        { success: true, status: 200 },
      ).as('mockStopNotebook');
      cy.get('.mat-mdc-dialog-actions > button').contains('STOP').click();
      cy.wait('@mockStopNotebook').its('response.statusCode').should('eq', 200);
    });

    it('should delete a notebook', () => {
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-test-01')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="delete"] > button')
        .should('have.text', ' delete\n');
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-test-01')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="delete"]')
        .click();
      cy.get('.mat-mdc-dialog-title')
        .should('be.visible')
        .and(
          'have.text',
          'Are you sure you want to delete this notebook server? a-test-01',
        );
      cy.get('.mat-mdc-dialog-actions > button').contains('CANCEL').click();
      cy.get('mat-dialog-container').should('not.exist');
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-test-01')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="delete"]')
        .click();
      cy.intercept(
        'DELETE',
        '/api/namespaces/kubeflow-user/notebooks/a-test-01',
        { success: true, status: 200 },
      ).as('mockDeleteNotebook');
      cy.get('.mat-mdc-dialog-actions > button').contains('DELETE').click();
      cy.wait('@mockDeleteNotebook')
        .its('response.statusCode')
        .should('eq', 200);
    });

    it('should filter the notebook table', () => {
      // filter on notebook name
      cy.get('[data-cy-table-filter-id="notebooks-table"]').click();
      cy.get('#mat-autocomplete-0').contains('Name').click();
      cy.get('[data-cy-table-filter-id="notebooks-table"]').type(
        'pro-b{enter}',
      );
      cy.get('[data-cy-table-id="notebooks-table"] > tbody > tr').should(
        'have.length',
        1,
      );

      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .each(element => {
          expect(element).to.contain('pro-b');
        });
      // clear filters
      cy.get('[mattooltip="Clear filters"]').click();
      cy.get('[data-cy-table-id="notebooks-table"] > tbody > tr').should(
        'have.length',
        7,
      );

      // generic filter
      cy.get('[data-cy-table-filter-id="notebooks-table"]').type(
        'jupyter-scipy{enter}',
      );
      cy.get('[data-cy-table-id="notebooks-table"] > tbody > tr').should(
        'have.length',
        4,
      );

      //clear filters
      cy.get('[matchipremove]').click();
      cy.get('[data-cy-table-id="notebooks-table"] > tbody > tr').should(
        'have.length',
        7,
      );
    });

    it('should open the notebook details page', () => {
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-dog-breed-katib')
        .click();
      cy.url().should(
        'eq',
        'http://localhost:4200/notebook/details/kubeflow-user/a-dog-breed-katib',
      );
    });
  });

  describe('Volumes table', () => {
    beforeEach(() => {
      cy.wait(['@mockPVCsRequest']);
    });

    it('should have the Volumes table', () => {
      cy.get('[data-cy-table-id="volumes-table"]').should('exist');
      cy.get('[data-cy-table-id="volumes-table"] > tbody > tr').should(
        'have.length',
        8,
      );
    });

    // We use function () in order to access aliases via this
    it('renders every PVC name into the table', function () {
      let i = 0;
      const pvcs = this.pvcsRequest.pvcs;
      // Table is sorted by Name in ascending order by default
      // and pvcs object is also sorted alphabetically by name
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .each(element => {
          expect(element).to.contain(pvcs[i].name);
          i++;
        });
    });

    it('checks Status icon for all PVCs', function () {
      let i = 0;
      const pvcs = this.pvcsRequest.pvcs;
      cy.get('[data-cy-table-id="volumes-table"]')
        .find('[data-cy-resource-table-row="Status"]')
        .each(element => {
          if (pvcs[i].status.phase === 'attached') {
            cy.wrap(element)
              .find('lib-status-icon>mat-icon')
              .should('contain', 'link');
          } else if (pvcs[i].status.phase === 'unattached') {
            cy.wrap(element)
              .find('lib-status-icon>mat-icon')
              .should('contain', 'link_off');
          }
          i++;
        });
    });

    it('should delete volume', () => {
      // assert that a mounted volume has a disabled delete button
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-pvc-phase-waiting-viewer-uninitialized')
        .parent()
        .parent()
        .find(`[data-cy-resource-table-row="Used by"]`)
        .should('have.text', ' test-notebook-1\n');
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-pvc-phase-waiting-viewer-uninitialized')
        .parent()
        .parent()
        .find('app-delete-button')
        .find('button')
        .should('have.text', ' delete\n')
        .and('be.disabled');
      // assert that a non-mounted volume has an enabled delete button
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-pvc-phase-warning-viewer-ready')
        .parent()
        .parent()
        .find('app-delete-button')
        .find('button')
        .should('be.enabled');
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-pvc-phase-warning-viewer-ready')
        .parent()
        .parent()
        .find('app-delete-button')
        .find('button')
        .click();
      cy.get('.mat-mdc-dialog-title')
        .should('be.visible')
        .and(
          'have.text',
          'Are you sure you want to delete this volume? a-pvc-phase-warning-viewer-ready',
        );
      cy.get('.mat-mdc-dialog-actions > button').contains('CANCEL').click();
      cy.get('mat-dialog-container').should('not.exist');
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-pvc-phase-warning-viewer-ready')
        .parent()
        .parent()
        .find('app-delete-button')
        .find('button')
        .click();
      cy.intercept(
        'DELETE',
        '/api/namespaces/kubeflow-user/pvcs/a-pvc-phase-warning-viewer-ready',
        { success: true, status: 200 },
      ).as('mockDeleteVolume');
      cy.get('.mat-mdc-dialog-actions > button').contains('DELETE').click();
      cy.wait('@mockDeleteVolume').its('response.statusCode').should('eq', 200);
    });

    it('should filter the volume table', () => {
      // filter on volume name
      cy.get('[data-cy-table-filter-id="volumes-table"]').click();
      cy.get('#mat-autocomplete-1').contains('Name').click();
      cy.get('[data-cy-table-filter-id="volumes-table"]').type('ready{enter}');
      cy.get('[data-cy-table-id="volumes-table"] > tbody > tr').should(
        'have.length',
        4,
      );

      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .each(element => {
          expect(element).to.contain('ready');
        });
      // clear filters
      cy.get('[mattooltip="Clear filters"]').click();
      cy.get('[data-cy-table-id="volumes-table"] > tbody > tr').should(
        'have.length',
        8,
      );

      // generic filter
      cy.get('[data-cy-table-filter-id="volumes-table"]').type(
        'default{enter}',
      );
      cy.get('[data-cy-table-id="volumes-table"] > tbody > tr').should(
        'have.length',
        2,
      );

      //clear filters
      cy.get('[matchipremove]').click();
      cy.get('[data-cy-table-id="volumes-table"] > tbody > tr').should(
        'have.length',
        8,
      );
    });

    it('should open the volume details page', () => {
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-pvc-phase-ready-viewer-ready')
        .click();
      cy.url().should(
        'eq',
        'http://localhost:4200/volume/details/kubeflow-user/a-pvc-phase-ready-viewer-ready',
      );
    });

    it('should open notebook details page from volume table used-by column', () => {
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-pvc-phase-waiting-viewer-uninitialized')
        .parent()
        .parent()
        .find(`[data-cy-resource-table-row="Used by"]`)
        .should('have.text', ' test-notebook-1\n');
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-pvc-phase-waiting-viewer-uninitialized')
        .parent()
        .parent()
        .find(`[data-cy-resource-table-row="Used by"]`)
        .click();
      cy.url().should(
        'eq',
        'http://localhost:4200/notebook/details/kubeflow-user/test-notebook-1',
      );
    });
  });

  describe('Kubecost table', () => {
    beforeEach(() => {
      cy.wait('@mockKubecostRequest');
    });

    it('should have the Kubecost table', () => {
      cy.get('[data-cy-toolbar-title]').contains('Cost').should('exist');
      cy.get('[data-cy-time-window-dropdown]').should('exist');

      cy.get('[data-cy-table-id="kubecost-table"]').should('exist');
      cy.get('[data-cy-table-id="kubecost-table"] > tbody > tr').should(
        'have.length',
        1,
      );
      cy.get(
        '[data-cy-table-id="kubecost-table"] > tbody > tr > [data-cy-resource-table-row="CPUs"]',
      ).should('have.text', ' $1.07 ');
      cy.get(
        '[data-cy-table-id="kubecost-table"] > tbody > tr > [data-cy-resource-table-row="GPUs"]',
      ).should('have.text', ' $0.00 ');
      cy.get(
        '[data-cy-table-id="kubecost-table"] > tbody > tr > [data-cy-resource-table-row="RAM"]',
      ).should('have.text', ' $0.28 ');
      cy.get(
        '[data-cy-table-id="kubecost-table"] > tbody > tr > [data-cy-resource-table-row="Storage"]',
      ).should('have.text', ' $0.04 ');
      cy.get(
        '[data-cy-table-id="kubecost-table"] > tbody > tr > [data-cy-resource-table-row="Total"]',
      ).should('have.text', ' $1.39 ');
    });

    it('should change cost table time window', () => {
      cy.get('[data-cy-time-window-dropdown]').click();
      cy.get('[data-cy-time-window-dropdown]').scrollIntoView();
      cy.intercept(
        'GET',
        `/api/namespaces/kubeflow-user/cost/allocation?aggregation=namespace&namespace=kubeflow-user&window=week`,
        {
          code: 200,
          data: {
            step: 432000000000000,
            sets: [
              {
                allocations: {
                  'kubeflow-user': {
                    name: 'kubeflow-user',
                    start: '2023-09-24T00:00:00Z',
                    end: '2023-09-28T13:00:00Z',
                    cpuCoreRequestAverage: 1.1935443425076455,
                    cpuCoreUsageAverage: 0.011396784208213948,
                    cpuCost: 6.422205495,
                    gpuCost: 0.500123123,
                    networkCost: 0,
                    loadBalancerCost: 0,
                    pvCost: 0.20107622058306993,
                    ramByteRequestAverage: 2753108437.7247705,
                    ramByteUsageAverage: 643568994.0768814,
                    ramCost: 1.847079963867188,
                    sharedCost: 14.235623251899874,
                    externalCost: 0,
                  },
                },
                window: {
                  start: '2023-09-24T00:00:00Z',
                  end: '2023-09-29T00:00:00Z',
                },
              },
            ],
            window: {
              start: '2023-09-24T00:00:00Z',
              end: '2023-09-29T00:00:00Z',
            },
          },
        },
      ).as('mockKubecostRequest');
      cy.get('mat-option').contains('Week-to-date').click();
      cy.wait('@mockKubecostRequest');
      cy.get('[data-cy-table-id="kubecost-table"] > tbody > tr').should(
        'have.length',
        1,
      );
      cy.get(
        '[data-cy-table-id="kubecost-table"] > tbody > tr > [data-cy-resource-table-row="CPUs"]',
      ).should('have.text', ' $6.42 ');
      cy.get(
        '[data-cy-table-id="kubecost-table"] > tbody > tr > [data-cy-resource-table-row="GPUs"]',
      ).should('have.text', ' $0.50 ');
      cy.get(
        '[data-cy-table-id="kubecost-table"] > tbody > tr > [data-cy-resource-table-row="RAM"]',
      ).should('have.text', ' $1.85 ');
      cy.get(
        '[data-cy-table-id="kubecost-table"] > tbody > tr > [data-cy-resource-table-row="Storage"]',
      ).should('have.text', ' $0.20 ');
      cy.get(
        '[data-cy-table-id="kubecost-table"] > tbody > tr > [data-cy-resource-table-row="Total"]',
      ).should('have.text', ' $8.97 ');
    });
  });
});
