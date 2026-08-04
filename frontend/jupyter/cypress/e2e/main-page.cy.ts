describe('Main tables', () => {
  beforeEach(() => {
    cy.fixture('settings').then(settings => {
      cy.mockNotebooksRequest(settings.namespace);
      cy.mockPVCsRequest(settings.namespace);
      cy.mockPVCsUsageRequest(settings.namespace);
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
      cy.get('[data-cy-table-id="notebooks-table"] > tbody > tr')
        .should('have.length', 7);

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
    
    it('should have icon for oom', () => {
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-dog-breed-katib')
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
        .find('[data-cy-resource-table-action-icon="settings"] > button')
        .should('have.text', 'settings');
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-test-01')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="settings"]')
        .click();
      cy.get('div[role="menu"]')
        .should('be.visible')
        .find('button[data-cy-menu-icon-action="deleteAction"]')
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
        .find('[data-cy-resource-table-action-icon="settings"]')
        .click();
      cy.get('div[role="menu"]')
        .should('be.visible')
        .find('button[data-cy-menu-icon-action="deleteAction"]')
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
      cy.get('[data-cy-table-id="notebooks-table"] > tbody > tr')
        .should('have.length', 7);

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
      cy.get('[data-cy-table-id="notebooks-table"] > tbody > tr')
        .should('have.length', 7);
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

    it('should open the notebook details page from settings menu', () => {
      cy.get('[data-cy-table-id="notebooks-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-dog-breed-katib')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="settings"]')
        .click();
      cy.get('div[role="menu"]')
        .should('be.visible')
        .find('button[data-cy-menu-icon-action="nb_details"]')
        .click();

      cy.url().should(
        'eq',
        'http://localhost:4200/notebook/details/kubeflow-user/a-dog-breed-katib',
      );
    });

    it('Delay menu', () => {
      it('Should be disabled if notebook not ready', () => {
        cy.get('[data-cy-table-id="notebooks-table"]')
          .find(`[data-cy-resource-table-row="Name"]`)
          .contains('a-dog-breed-katib')
          .parent()
          .parent()
          .find('[data-cy-resource-table-action-icon="settings"]')
          .click();
        cy.get('div[role="menu"]')
          .should('be.visible')
          .find('button[data-cy-menu-icon-action="keep_alive"]')
          .and('be.disabled');
            });
      it('Should Cancel on click', () => {
        cy.get('[data-cy-table-id="notebooks-table"]')
          .find(`[data-cy-resource-table-row="Name"]`)
          .contains('a-test-01')
          .parent()
          .parent()
          .find('[data-cy-resource-table-action-icon="settings"]')
          .click();
        cy.get('div[role="menu"]')
          .should('be.visible')
          .find('button[data-cy-menu-icon-action="keep_alive"]')
          .and('be.enabled')
          .click();
        cy.get('.mat-mdc-dialog-title')
          .should('be.visible')
          .and(
            'have.text',
            'Delay auto-shutdown for a-test-01',
          );
        cy.get('.mat-mdc-dialog-actions > button').contains('CANCEL').click();
        cy.get('mat-dialog-container').should('not.exist');
      });
      it('Should be enabled and working', () => {
        cy.intercept(
            'PATCH',
            '/api/namespaces/kubeflow-user/notebooks/a-test-01/keepalive',
            { success: true, status: 200 },
          ).as('mockDelayCulling');
        cy.get('[data-cy-table-id="notebooks-table"]')
          .find(`[data-cy-resource-table-row="Name"]`)
          .contains('a-test-01')
          .parent()
          .parent()
          .find('[data-cy-resource-table-action-icon="settings"]')
          .click();
        cy.get('div[role="menu"]')
          .should('be.visible')
          .find('button[data-cy-menu-icon-action="keep_alive"]')
          .and('be.enabled')
          .click();;
        cy.get('.mat-mdc-dialog-title')
          .should('be.visible')
          .and(
            'have.text',
            'Delay auto-shutdown for a-test-01',
          );
        cy.get('[data-cy-form-button="formDelayCtrlSubmit"]').should('be.enabled');
        cy.get('.mat-mdc-dialog-actions > button').contains('SUBMIT').click();
        cy.wait('@mockDelayCulling').its('response.statusCode').should('eq', 200);
        cy.get('mat-dialog-container').should('not.exist');
      });
      it('Should disable submit if invalid data', () => {
        cy.get('[data-cy-table-id="notebooks-table"]')
          .find(`[data-cy-resource-table-row="Name"]`)
          .contains('a-test-01')
          .parent()
          .parent()
          .find('[data-cy-resource-table-action-icon="settings"]')
          .click();
        cy.get('div[role="menu"]')
          .should('be.visible')
          .find('button[data-cy-menu-icon-action="keep_alive"]')
          .and('be.enabled')
          .click();
        cy.get('.mat-mdc-dialog-title')
          .should('be.visible')
          .and(
            'have.text',
            'Delay auto-shutdown for a-test-01',
          );
        // Min
        cy.get('[data-cy-form-input="delayTime"]').find('input').should('have.value', '1');
        cy.get('[data-cy-form-button="formDelayCtrlSubmit"]').should('be.enabled');
        // Zero
        cy.get('[data-cy-form-input="delayTime"]').find('input').clear();
        cy.get('[data-cy-form-input="delayTime"]').find('input').type('0');
        cy.get('[data-cy-form-button="formDelayCtrlSubmit"]').should('be.disabled');
        cy.get('[data-cy-form-input="delayTime"]').find('input').should('have.class', 'ng-invalid');
        cy.get('[data-cy-form-input="delayTime"]').find('mat-error')
        .should('have.text', "Specify at least 1 hour(s)");
        // Max
        cy.get('[data-cy-form-input="delayTime"]').find('input').clear();
        cy.get('[data-cy-form-input="delayTime"]').find('input').type('72');
        cy.get('[data-cy-form-button="formDelayCtrlSubmit"]').should('be.enabled');
        // Negative
        cy.get('[data-cy-form-input="delayTime"]').find('input').clear();
        cy.get('[data-cy-form-input="delayTime"]').find('input').type('-1');
        cy.get('[data-cy-form-button="formDelayCtrlSubmit"]').should('be.disabled');
        cy.get('[data-cy-form-input="delayTime"]').find('input').should('have.class', 'ng-invalid');
        cy.get('[data-cy-form-input="delayTime"]').find('mat-error')
        .should('have.text', "Specify at least 1 hour(s)");
        // Valid
        cy.get('[data-cy-form-input="delayTime"]').find('input').clear();
        cy.get('[data-cy-form-input="delayTime"]').find('input').type('24');
        cy.get('[data-cy-form-button="formDelayCtrlSubmit"]').should('be.enabled');
        // Above max
        cy.get('[data-cy-form-input="delayTime"]').find('input').clear();
        cy.get('[data-cy-form-input="delayTime"]').find('input').type('73');
        cy.get('[data-cy-form-button="formDelayCtrlSubmit"]').should('be.disabled');
        cy.get('[data-cy-form-input="delayTime"]').find('input').should('have.class', 'ng-invalid');
        cy.get('[data-cy-form-input="delayTime"]').find('mat-error')
        .should('have.text', "Can't exceed 72 hours");
        // Valid
        cy.get('[data-cy-form-input="delayTime"]').find('input').clear();
        cy.get('[data-cy-form-input="delayTime"]').find('input').type('1');
        cy.get('[data-cy-form-button="formDelayCtrlSubmit"]').should('be.enabled');
        // Invalid - letters won't be allowed in the input
        cy.get('[data-cy-form-input="delayTime"]').find('input').clear();
        cy.get('[data-cy-form-input="delayTime"]').find('input').type('a');
        cy.get('[data-cy-form-button="formDelayCtrlSubmit"]').should('be.disabled');
        cy.get('[data-cy-form-input="delayTime"]').find('input').should('have.class', 'ng-invalid');
        cy.get('[data-cy-form-input="delayTime"]').find('mat-error')
        .should('have.text', "Hours to delay is required");
        // Valid - to clear the message
        cy.get('[data-cy-form-input="delayTime"]').find('input').clear();
        cy.get('[data-cy-form-input="delayTime"]').find('input').type('1');
        cy.get('[data-cy-form-button="formDelayCtrlSubmit"]').should('be.enabled');
        // Invalid - decimal
        cy.get('[data-cy-form-input="delayTime"]').find('input').clear();
        cy.get('[data-cy-form-input="delayTime"]').find('input').type('1.2');
        cy.get('[data-cy-form-button="formDelayCtrlSubmit"]').should('be.disabled');
        cy.get('[data-cy-form-input="delayTime"]').find('input').should('have.class', 'ng-invalid');
        cy.get('[data-cy-form-input="delayTime"]').find('mat-error')
        .should('have.text', "Specify a number of hours for the delay (no decimals)");
       
      });
    });
  });

  describe('Volumes table', () => {
    beforeEach(() => {
      cy.wait(['@mockPVCsRequest']);
    });

    it('should have the Volumes table', () => {
      cy.get('[data-cy-table-id="volumes-table"]').should('exist');
      cy.get('[data-cy-table-id="volumes-table"] > tbody > tr')
        .should('have.length', 10);
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
      cy.get('[data-cy-table-id="volumes-table"] > tbody > tr')
        .should('have.length', 10);

      // generic filter
      cy.get('[data-cy-table-filter-id="volumes-table"]').type(
        'default{enter}',
      );
      cy.get('[data-cy-table-id="volumes-table"] > tbody > tr').should(
        'have.length',
        4,
      );

      //clear filters
      cy.get('[matchipremove]').click();
      cy.get('[data-cy-table-id="volumes-table"] > tbody > tr')
        .should('have.length', 10);
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

    it('should open the volume details from the settings menu', () => {
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-pvc-phase-ready-viewer-ready')
        .scrollIntoView();
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('a-pvc-phase-ready-viewer-ready')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="settings"]')
        .click();
      cy.get('div[role="menu"]')
        .should('be.visible')
        .find('button[data-cy-menu-icon-action="pvc_details"]')
        .click({force: true}); // Forcing the click because cypress can randomly fail to do the click by scrolling out of focus

      cy.url().should(
        'eq',
        'http://localhost:4200/volume/details/kubeflow-user/a-pvc-phase-ready-viewer-ready',
      );
    });

    it('should increase the size of a volume', () => {
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('titanic-ml-47xh5-data-m57vq-2md82')
        .scrollIntoView();
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('titanic-ml-47xh5-data-m57vq-2md82')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="settings"]')
        .click();
      cy.get('div[role="menu"]')
        .should('be.visible')
        .find('button[data-cy-menu-icon-action="expand_pvc"]')
        .click({force: true}); // Forcing the click because cypress can randomly fail to do the click by scrolling out of focus
      cy.get('.mat-mdc-dialog-title')
        .should('be.visible')
        .and(
          'have.text',
          'Increase size of volume titanic-ml-47xh5-data-m57vq-2md82',
        );
      // assert default value matches volume's current size
      cy.get('[data-cy-form-input="volumeSize"]')
        .find('mat-select[formControlName="sizeNum"]')
        .should('contain', '32');
      cy.get('[data-cy-form-input="volumeSize"]')
        .click();
      // assert the sizes dropdown
      const sizeArray = [4, 8, 16, 32, 64, 128, 256, 512];
      cy.get('div[role="listbox"]')
        .should('be.visible')
        .find('mat-option')
        .should('have.length', sizeArray.length);
      cy.get('div[role="listbox"]')
        .find('mat-option')
        .each(($option, index) => {
          console.log("test", $option, index);
          expect($option).to.contain(sizeArray[index].toString())

          // assert that the smaller sizes are disabled
          // index 3 matches size '32' which is the size of the selected volume
          if(index <= 3){
            expect($option).to.have.class('mdc-list-item--disabled');
          } else {
            expect($option).to.not.have.class('mdc-list-item--disabled');
          }
        });
      cy.get('body').click() // close sizes dropdown
      cy.get('[data-cy-form-input="volumeSize"]')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="volumeSize"]')
        .find('mat-error')
        .should('have.text', 'New size has to be larger than the current value');

      // assert succesful increase
      cy.get('[data-cy-form-input="volumeSize"]').click().get('mat-option').contains('64').click();
      cy.intercept(
        'PATCH',
        '/api/namespaces/kubeflow-user/pvcs/titanic-ml-47xh5-data-m57vq-2md82/expand',
        { success: true, status: 200 },
      ).as('mockExpandVolume');
      cy.get('[data-cy-form-button="formDialogSubmit"]').click();
      cy.wait('@mockExpandVolume')
        .its('response.statusCode')
        .should('eq', 200);
      cy.get('mat-dialog-container').should('not.exist');
    });

    it('should confirm a large size increase of a volume', () => {
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('titanic-ml-47xh5-data-m57vq-2md82')
        .scrollIntoView();
      cy.get('[data-cy-table-id="volumes-table"]')
        .find(`[data-cy-resource-table-row="Name"]`)
        .contains('titanic-ml-47xh5-data-m57vq-2md82')
        .parent()
        .parent()
        .find('[data-cy-resource-table-action-icon="settings"]')
        .click();
      cy.get('div[role="menu"]')
        .should('be.visible')
        .find('button[data-cy-menu-icon-action="expand_pvc"]')
        .click({force: true}); // Forcing the click because cypress can randomly fail to do the click by scrolling out of focus
      cy.get('[data-cy-form-input="volumeSize"]')
        .click()
        .get('mat-option')
        .contains('128')
        .click();
      cy.get('[data-cy-form-button="formDialogSubmit"]').click();
      cy.get('lib-confirm-dialog')
        .find('.mat-mdc-dialog-title')
        .should('be.visible')
        .and('have.text', 'Are you sure you want to increase the size of titanic-ml-47xh5-data-m57vq-2md82 to 128Gi?');
      cy.get('lib-confirm-dialog')
        .find('.mat-mdc-dialog-actions > button')
        .contains('CANCEL')
        .click();
      // asert that the first popup is still present
      cy.get('.mat-mdc-dialog-title')
        .should('be.visible')
        .and(
          'have.text',
          'Increase size of volume titanic-ml-47xh5-data-m57vq-2md82',
        );
      cy.get('[data-cy-form-input="volumeSize"]')
        .click()
        .get('mat-option')
        .contains('256')
        .click();
      cy.get('[data-cy-form-button="formDialogSubmit"]').click();
      cy.get('lib-confirm-dialog')
        .find('.mat-mdc-dialog-title')
        .should('be.visible')
        .and('have.text', 'Are you sure you want to increase the size of titanic-ml-47xh5-data-m57vq-2md82 to 256Gi?');
      cy.intercept(
        'PATCH',
        '/api/namespaces/kubeflow-user/pvcs/titanic-ml-47xh5-data-m57vq-2md82/expand',
        { success: true, status: 200 },
      ).as('mockExpandVolume');
      cy.get('lib-confirm-dialog')
        .find('.mat-mdc-dialog-actions > button')
        .contains('INCREASE')
        .click();
      cy.wait('@mockExpandVolume')
        .its('response.statusCode')
        .should('eq', 200);
      cy.get('mat-dialog-container').should('not.exist');
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
