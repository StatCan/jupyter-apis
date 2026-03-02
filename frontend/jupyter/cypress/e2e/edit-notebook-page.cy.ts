describe('Edit notebook form', () => {
  beforeEach(() => {
    cy.mockDashboardRequest();
    cy.mockConfigRequest();
    cy.mockGetNotebookRequest('kubeflow-user', 'test-notebook');
    cy.fixture('settings').then(settings => {
      cy.mockNotebooksRequest(settings.namespace);
      cy.mockPVCsRequest(settings.namespace);
    });

    cy.visit('/notebook/edit/kubeflow-user/test-notebook');

    cy.wait([
      '@mockConfigRequest',
      '@mockGetNotebookRequest',
      '@mockNotebooksRequest',
    ]);
  });

  it('should have a "New notebook" title', () => {
    cy.get('[data-cy-toolbar-title]').contains('Editing notebook test-notebook').should('exist');
  });

  it('image', () => {
    // icon
    cy.get('[data-mat-icon-name="jupyter-icon"]').should('exist');
    cy.get('[data-mat-icon-name="sas-icon"]').should('not.exist');
    // value
    cy.get('[data-cy-image-name]').contains('k8scc01covidacr.azurecr.io/jupyterlab-cpu:v1').should('exist');
  });

  describe('validate inputs', () => {
    it('requested cpu', () => {
      // default value
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .should('have.value', '0.5');
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .should('have.class', 'ng-valid');
      cy.get('[data-cy-form-input="cpu"]').find('input').clear();
      // minimum value
      cy.get('[data-cy-form-input="cpu"]').find('input').type('0.01');
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="cpu"]')
        .find('mat-error')
        .should('have.text', 'Specify at least 0.1 CPUs');
      cy.get('[data-cy-form-input="cpu"]').find('input').clear();
      // maximum value
      cy.get('[data-cy-form-input="cpu"]').find('input').type('40.0');
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="cpu"]')
        .find('mat-error')
        .should('have.text', "Can't exceed 14 CPUs");
      cy.get('[data-cy-form-input="cpu"]').find('input').clear();
      // empty value
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="cpu"]')
        .find('mat-error')
        .should('have.text', 'Specify number of CPUs');
      // invalid value
      cy.get('[data-cy-form-input="cpu"]').find('input').type('abcd');
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="cpu"]')
        .find('mat-error')
        .should('have.text', 'Specify number of CPUs');
      // valid value
      cy.get('[data-cy-form-input="cpu"]').find('input').type('4');
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .should('have.class', 'ng-valid');
    });

    it('requested memory', () => {
      // default value
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .should('have.value', '2');
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .should('have.class', 'ng-valid');
      cy.get('[data-cy-form-input="memory"]').find('input').clear();
      // minimum value
      cy.get('[data-cy-form-input="memory"]').find('input').type('0.1');
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="memory"]')
        .find('mat-error')
        .should('have.text', 'Specify at least 0.5Gi of memory');
      cy.get('[data-cy-form-input="memory"]').find('input').clear();
      // maximum value
      cy.get('[data-cy-form-input="memory"]').find('input').type('90.0');
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="memory"]')
        .find('mat-error')
        .should('have.text', "Can't exceed 48Gi of memory");
      cy.get('[data-cy-form-input="memory"]').find('input').clear();
      // empty value
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="memory"]')
        .find('mat-error')
        .should('have.text', 'Specify amount of memory (e.g. 2Gi)');
      // invalid value
      cy.get('[data-cy-form-input="memory"]').find('input').type('abcd');
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="memory"]')
        .find('mat-error')
        .should('have.text', 'Specify amount of memory (e.g. 2Gi)');
      // valid value
      cy.get('[data-cy-form-input="memory"]').find('input').type('4');
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .should('have.class', 'ng-valid');
    });

    it('workspace volume', () => {
      // existing volume header
      cy.get('[data-cy-form-input="workspaceVolume"] > mat-expansion-panel')
        .find('mat-panel-title')
        .should('have.text', ' Existing volume ');
      cy.get('[data-cy-form-input="workspaceVolume"] > mat-expansion-panel')
        .find('mat-panel-description')
        .should('contain.text', ' test-notebook-volume ');
      cy.get(
        '[data-cy-form-input="workspaceVolume"] > mat-expansion-panel',
      ).click();
      // existing volume inputs
      cy.get('[data-cy-form-input="workspaceVolume"] > mat-expansion-panel')
        .find('app-existing-volume')
        .should('exist');
      cy.get('[data-cy-form-input="workspaceVolume"] > mat-expansion-panel')
        .find('app-existing-volume')
        .find('mat-select')
        .should('have.text', "test-notebook-volume");
      cy.get('[data-cy-form-input="workspaceVolume"] > mat-expansion-panel')
        .find('[data-cy-form-input="mount-path"] > p')
        .should('have.text', " /home/jovyan ");
      // existing volume name already in use
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-select')
        .click();
      cy.get('mat-option')
        .contains('titanic-ml-47xh5-data-m57vq-2md82')
        .click();
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="existing-volume"]')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-error')
        .should('have.text', ' Already mounted ');
      // existing volume delete
      cy.get('[data-cy-form-button="workspaceVolume-new"]').should('not.exist');
      cy.get('[data-cy-form-button="workspaceVolume-existing"]').should(
        'not.exist',
      );
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('mat-icon[mattooltip="Delete volume"]')
        .click();
      cy.get('[data-cy-form-button="workspaceVolume-new"]').should('exist');
      cy.get('[data-cy-form-button="workspaceVolume-existing"]').should(
        'exist',
      );
      cy.get(
        '[data-cy-form-input="workspaceVolume"] > mat-expansion-panel',
      ).should('not.exist');

      // new volume create
      cy.get('[data-cy-form-button="workspaceVolume-new"]').click();
      cy.get('[data-cy-form-button="workspaceVolume-new"]').should('not.exist');
      cy.get('[data-cy-form-button="workspaceVolume-existing"]').should(
        'not.exist',
      );
      // new volume header
      cy.get('[data-cy-form-input="workspaceVolume"] > mat-expansion-panel')
        .find('mat-panel-title')
        .should('have.text', ' New volume ');
      cy.get('[data-cy-form-input="workspaceVolume"] > mat-expansion-panel')
        .find('mat-panel-description')
        .should('contain.text', 'test-notebook-workspace, 16Gi');
      // new volume empty name value
      cy.get('[data-cy-form-input="workspaceVolume"]').click();
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('mat-error')
        .should('have.text', ' Name is required ');
      // new volume name invalid pattern
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .type('-volume-');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('mat-error')
        .should(
          'have.text',
          " The volume name can only contain lowercase alphanumeric characters,\n       '-' or '.', and must start and end with an alphanumeric character ",
        );
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .clear();
      // new volume name in use
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .type('dog-breed-nwmrc-tutorial-dog-breed-workspace-24ntl-jcjlv');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('mat-error')
        .should('have.text', ' Already mounted ');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .clear();
      // new volume name valid
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .type('my-workspace-volume');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .should('have.class', 'ng-valid');
      // new volume mount path
      cy.get('[data-cy-form-input="workspaceVolume"] > mat-expansion-panel')
        .find('[data-cy-form-input="mount-path"] > p')
        .should('have.text', " /home/jovyan ");
      // new volume size
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('app-volume-size')
        .find('mat-select')
        .click();
      cy.get('mat-option')
        .contains('4')
        .click();
      cy.get('[data-cy-form-input="workspaceVolume"] > mat-expansion-panel')
        .find('mat-panel-description')
        .should('contain.text', 'my-workspace-volume, 4Gi');
      // new volume delete
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('mat-icon[mattooltip="Delete volume"]')
        .click();
      cy.get('[data-cy-form-button="workspaceVolume-new"]').should('exist');
      cy.get('[data-cy-form-button="workspaceVolume-existing"]').should(
        'exist',
      );
      cy.get(
        '[data-cy-form-input="workspaceVolume"] > mat-expansion-panel',
      ).should('not.exist');
    });

    it('data volumes', () => {
      // verify default existing volume
      // existing volume header
      cy.get('[data-cy-form-input="dataVolumes"] > mat-expansion-panel')
        .find('mat-panel-title')
        .should('have.text', ' Existing volume ');
      cy.get('[data-cy-form-input="dataVolumes"] > mat-expansion-panel')
        .find('mat-panel-description')
        .should('contain.text', ' test-notebook-data ');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-select')
        .should('contain.text', "test-notebook-data");
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .should('have.value', '/home/jovyan/test-notebook-data');
      // add existing volume
      cy.get('[data-cy-form-button="dataVolumes-new"]').should('exist');
      cy.get('[data-cy-form-button="dataVolumes-existing"]').should('exist');
      cy.get('[data-cy-form-button="dataVolumes-existing"]').click();
      cy.get('[data-cy-form-input="dataVolumes"] > mat-expansion-panel')
        .find('mat-panel-title')
        .eq(1)
        .should('have.text', ' Existing volume ');
      // existing volume name empty
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .eq(1)
        .find('mat-select')
        .click();
      cy.get('body').click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .eq(1)
        .find('mat-error')
        .should('have.text', ' Name is required ');
      // existing volume name already in use
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .eq(1)
        .find('mat-select')
        .click();
      cy.get('[role="listbox"] > mat-option')
        .contains('titanic-ml-47xh5-data-m57vq-2md82')
        .click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .eq(1)
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .eq(1)
        .find('mat-error')
        .should('have.text', ' Already mounted ');
      // existing volume valid value
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .eq(1)
        .find('mat-select')
        .click();
      cy.get('[role="listbox"] > mat-option')
        .contains('a-pvc-phase-warning-viewer-ready')
        .click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .eq(1)
        .should('have.class', 'ng-valid');
      cy.get('[data-cy-form-input="dataVolumes"] > mat-expansion-panel')
        .eq(1)  
        .find('mat-panel-description')
        .should('contain.text', ' a-pvc-phase-warning-viewer-ready ');
      // existing volume mount path empty value
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('mat-error')
        .should('have.text', ' Mount path is required ');
      // existing volume mount path invalid pattern
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .type('abc/');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('mat-error')
        .should(
          'have.text',
          ' The accepted locations are /home/jovyan or any of its subdirectories ',
        );
      // existing volume mount path duplicate value
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .type('/home/jovyan');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('mat-error')
        .should('have.text', ' This mount path is already in use ');
      // existing volume mount path valid value
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .type('/home/jovyan/a-pvc-phase-warning-viewer-ready');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .should('have.class', 'ng-valid');
      // new volume
      cy.get('[data-cy-form-button="dataVolumes-new"]').click();
      cy.get('[data-cy-form-input="dataVolumes"] > mat-expansion-panel')
        .eq(2)
        .find('mat-panel-title')
        .should('have.text', ' New volume ');
      cy.get('[data-cy-form-input="dataVolumes"] > mat-expansion-panel')
        .eq(2)  
        .find('mat-panel-description')
        .should('contain.text', ' test-notebook-datavol-3, 16Gi ');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('input')
        .should('have.value', '/home/jovyan/test-notebook-datavol-3');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .should('have.value', 'test-notebook-datavol-3');
        // new volume empty name value
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('mat-error')
        .should('have.text', ' Name is required ');
      // new volume name invalid pattern
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .type('-volume-');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('mat-error')
        .should(
          'have.text',
          " The volume name can only contain lowercase alphanumeric characters,\n       '-' or '.', and must start and end with an alphanumeric character ",
        );
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .clear();
      // new volume name in use
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .type('dog-breed-nwmrc-tutorial-dog-breed-workspace-24ntl-jcjlv');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('mat-error')
        .should('have.text', ' Already mounted ');
      // new volume mount path empty value
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('mat-error')
        .should('have.text', ' Mount path is required ');
      // new volume mount path invalid pattern
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('input')
        .type('abc/');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('mat-error')
        .should(
          'have.text',
          ' The accepted locations are /home/jovyan or any of its subdirectories ',
        );
      // new volume mount path duplicate value
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('input')
        .type('/home/jovyan/a-pvc-phase-warning-viewer-ready');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(2)
        .find('mat-error')
        .should('have.text', ' This mount path is already in use ');
      // new volume size
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('app-volume-size')
        .find('mat-select')
        .click();
      cy.get('mat-option')
        .contains('4')
        .click();
      cy.get('[data-cy-form-input="dataVolumes"] > mat-expansion-panel')
        .find('mat-panel-description')
        .eq(2)
        .should('contain.text', 'dog-breed-nwmrc-tutorial-dog-breed-workspace-24ntl-jcjlv, 4Gi');
      // delete data volumes
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('mat-icon[mattooltip="Delete volume"]')
        .eq(2)
        .click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('mat-icon[mattooltip="Delete volume"]')
        .eq(1)
        .click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('mat-icon[mattooltip="Delete volume"]')
        .eq(0)
        .click();
      cy.get('[data-cy-form-input="dataVolumes"] > mat-expansion-panel').should(
        'not.exist',
      );
    });
  });

  describe('edit notebook use cases', () => {
    it('should cancel notebook edit', () => {
      cy.get('[data-cy-form-button="cancel"]').click();
      cy.url().should('eq', 'http://localhost:4200/');
    });

    it('should edit nothing', () => {
      // submit the notebook
      cy.get('[data-cy-form-button="submit"]').should('be.enabled');
      cy.intercept('POST', 'api/namespaces/kubeflow-user/notebooks/test-notebook', {
        success: true,
        status: 200,
      }).as('mockSubmitNotebook');
      cy.get('[data-cy-form-button="submit"]').click();
      cy.wait('@mockSubmitNotebook');
      cy.url().should('eq', 'http://localhost:4200/');
    });

    it('should update cpu and memory', () => {
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .type('1');
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .type('4');

      // submit the notebook
      cy.get('[data-cy-form-button="submit"]').should('be.enabled');
      cy.intercept('POST', 'api/namespaces/kubeflow-user/notebooks/test-notebook', {
        success: true,
        status: 200,
      }).as('mockSubmitNotebook');
      cy.get('[data-cy-form-button="submit"]').click();
      cy.wait('@mockSubmitNotebook');
      cy.url().should('eq', 'http://localhost:4200/');
    });

    it('should add a new data volume', () => {
      // testing with a notebook that has no volume
      cy.intercept('GET', `/api/namespaces/kubeflow-user/notebooks/test-notebook`, {
        fixture: 'notebook_no_volume',
      }).as('mockGetNotebookRequestNoVol');
      cy.visit('/notebook/edit/kubeflow-user/test-notebook');
      cy.wait('@mockGetNotebookRequestNoVol');
      
      cy.get('[data-cy-form-button="dataVolumes-new"]').click();

      // submit the notebook
      cy.get('[data-cy-form-button="submit"]').should('be.enabled');
      cy.intercept('POST', 'api/namespaces/kubeflow-user/notebooks/test-notebook', {
        success: true,
        status: 200,
      }).as('mockSubmitNotebook');
      cy.get('[data-cy-form-button="submit"]').click();
      cy.wait('@mockSubmitNotebook');
      cy.url().should('eq', 'http://localhost:4200/');
    });

    it('should update a data volume mount path', () => {
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .type('/my_new_dir');

      // submit the notebook
      cy.get('[data-cy-form-button="submit"]').should('be.enabled');
      cy.intercept('POST', 'api/namespaces/kubeflow-user/notebooks/test-notebook', {
        success: true,
        status: 200,
      }).as('mockSubmitNotebook');
      cy.get('[data-cy-form-button="submit"]').click();
      cy.wait('@mockSubmitNotebook');
      cy.url().should('eq', 'http://localhost:4200/');
    });

    it('should add new workspace volume and move the old one to data volumes', () => {
      // delete workspace
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('mat-icon[mattooltip="Delete volume"]')
        .click();
      // create new workspace
      cy.get('[data-cy-form-button="workspaceVolume-new"]').click();
      // change size of workspace
      cy.get('[data-cy-form-input="workspaceVolume"]').click();
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('app-volume-size')
        .find('mat-select')
        .click();
      cy.get('mat-option')
        .contains('32')
        .click();
      // create existing data
      cy.get('[data-cy-form-button="dataVolumes-existing"]').click();
      // select old workspace for existing
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .eq(1)
        .find('mat-select')
        .click();
      cy.get('[role="listbox"] > mat-option')
        .contains('test-notebook-volume')
        .click();

      // submit the notebook
      cy.get('[data-cy-form-button="submit"]').should('be.enabled');
      cy.intercept('POST', 'api/namespaces/kubeflow-user/notebooks/test-notebook', {
        success: true,
        status: 200,
      }).as('mockSubmitNotebook');
      cy.get('[data-cy-form-button="submit"]').click();
      cy.wait('@mockSubmitNotebook');
      cy.url().should('eq', 'http://localhost:4200/');
    });
  });
});
