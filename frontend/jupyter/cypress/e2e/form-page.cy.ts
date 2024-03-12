describe('New notebook form', () => {
  beforeEach(() => {
    cy.mockDashboardRequest();
    cy.mockGpusRequest();
    cy.mockConfigRequest();
    cy.fixture('settings').then(settings => {
      cy.mockNotebooksRequest(settings.namespace);
      cy.mockPoddefaultsRequest(settings.namespace);
      cy.mockNamespaceMetadataRequest(settings.namespace);
      cy.mockPVCsRequest(settings.namespace);
    });

    cy.visit('/new');
    cy.wait([
      '@mockDashboardRequest',
      '@mockGpusRequest',
      '@mockConfigRequest',
      '@mockNotebooksRequest',
      '@mockPoddefaultsRequest',
      '@mockNamespaceMetadataRequest',
    ]);
  });

  it('should have a "New notebook" title', () => {
    cy.get('[data-cy-toolbar-title]').contains('New notebook').should('exist');
  });

  describe('validate inputs', () => {
    it('notebook name', () => {
      // invalid pattern
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type('test-NOTEBOOK-');
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('mat-error')
        .should(
          'have.text',
          "Name must consist of lowercase alphanumeric characters or '-',\n    start with an alphabetic character, and end with an alphanumeric character.",
        );
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .clear();
      // name too long
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type(
          'abcokkdoekdokjnf9nwerginrfmqnefqwfnniqfnwefijnrejfwnerjifmwermfjwmerifjmwierjmfwiermjfiwmerfjmwiremffwfwf',
        );
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('mat-error')
        .should('have.text', 'Name is too long');
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .clear();
      // name already used
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type('a-dog-breed-katib');
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('mat-error')
        .should(
          'have.text',
          'Notebook Server "a-dog-breed-katib" already exists',
        );
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .clear();
      // name empty
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('mat-error')
        .should('have.text', 'Name cannot be empty');
      // valid input
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type('test-new-notebook');
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .should('have.class', 'ng-valid');
    });

    it('custom image', () => {
      cy.get('[data-cy-advanced-options-button]').click();
      cy.get('[data-cy-form-input="customImageCheck"]')
        .find('input')
        .check({ force: true });
      // invalid pattern
      cy.get('[data-cy-form-input="customImage"]')
        .find('input')
        .type('http://abc.image:v1');
      cy.get('[data-cy-form-input="customImage"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="customImage"]')
        .find('mat-error')
        .should('have.text', 'http:// is not allowed in URLs');
      cy.get('[data-cy-form-input="customImage"]').find('input').clear();
      // empty input
      cy.get('[data-cy-form-input="customImage"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="customImage"]')
        .find('mat-error')
        .should('have.text', 'Custom image is required');
      cy.get('[data-cy-form-input="customImage"]').find('input').clear();
      // valid input
      cy.get('[data-cy-form-input="customImage"]')
        .find('input')
        .type('test/image:latest');
      cy.get('[data-cy-form-input="customImage"]')
        .find('input')
        .should('have.class', 'ng-valid');
    });

    it('minimum cpu', () => {
      cy.get('[data-cy-advanced-options-button]').click();
      cy.get('[data-cy-form-input="cpu"]').find('input').clear();
      // minimum value
      cy.get('[data-cy-form-input="cpu"]').find('input').type('0.1');
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="cpu"]')
        .find('mat-error')
        .should('have.text', 'Specify at least 0.5 CPUs');
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
      // valid value
      cy.get('[data-cy-form-input="cpu"]').find('input').type('4');
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .should('have.class', 'ng-valid');
    });

    it('minimum memory', () => {
      cy.get('[data-cy-advanced-options-button]').click();
      cy.get('[data-cy-form-input="memory"]').find('input').clear();
      // minimum value
      cy.get('[data-cy-form-input="memory"]').find('input').type('0.1');
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="memory"]')
        .find('mat-error')
        .should('have.text', 'Specify at least 1Gi of memory');
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
      // valid value
      cy.get('[data-cy-form-input="memory"]').find('input').type('4');
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .should('have.class', 'ng-valid');
    });

    it('maximum cpu', () => {
      cy.get('[data-cy-advanced-options-button]').click();
      cy.get('[data-cy-form-input="cpuLimit"]').find('input').clear();
      // minimum value
      cy.get('[data-cy-form-input="cpuLimit"]').find('input').type('0.1');
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('mat-error')
        .should('have.text', 'Specify at least 0.5 CPUs');
      cy.get('[data-cy-form-input="cpuLimit"]').find('input').clear();
      // maximum value
      cy.get('[data-cy-form-input="cpuLimit"]').find('input').type('40.0');
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('mat-error')
        .should('have.text', "Can't exceed 14 CPUs");
      cy.get('[data-cy-form-input="cpuLimit"]').find('input').clear();
      // not smaller than minimum cpu
      cy.get('[data-cy-form-input="cpu"]').clear();
      cy.get('[data-cy-form-input="cpu"]').find('input').type('5.0');
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('input')
        .type('4.0', { force: true });
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('mat-error')
        .should('have.text', "Can't be lower than requested CPUs");
      cy.get('[data-cy-form-input="cpuLimit"]').find('input').clear();
      cy.get('[data-cy-form-input="cpu"]').clear();
      cy.get('[data-cy-form-input="cpu"]').find('input').type('0.5');
      // empty value
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('mat-error')
        .should('have.text', 'Specify number of CPUs');
      // valid value
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('input')
        .type('4', { force: true });
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('input')
        .should('have.class', 'ng-valid');
    });

    it('maximum memory', () => {
      cy.get('[data-cy-advanced-options-button]').click();
      cy.get('[data-cy-form-input="memoryLimit"]').find('input').clear();
      // minimum value
      cy.get('[data-cy-form-input="memoryLimit"]').find('input').type('0.1');
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('mat-error')
        .should('have.text', 'Specify at least 1Gi of memory');
      cy.get('[data-cy-form-input="memoryLimit"]').find('input').clear();
      // maximum value
      cy.get('[data-cy-form-input="memoryLimit"]').find('input').type('90.0');
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('mat-error')
        .should('have.text', "Can't exceed 48Gi of memory");
      cy.get('[data-cy-form-input="memoryLimit"]').find('input').clear();
      // not smaller than minimum memory
      cy.get('[data-cy-form-input="memory"]').clear();
      cy.get('[data-cy-form-input="memory"]').find('input').type('20.0');
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('input')
        .type('10.0', { force: true });
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('mat-error')
        .should('have.text', "Can't be lower than requested memory");
      cy.get('[data-cy-form-input="memoryLimit"]').find('input').clear();
      cy.get('[data-cy-form-input="memory"]').clear();
      cy.get('[data-cy-form-input="memory"]').find('input').type('2.0');
      // empty value
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('mat-error')
        .should('have.text', 'Specify amount of memory (e.g. 2Gi)');
      // valid value
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('input')
        .type('4', { force: true });
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('input')
        .should('have.class', 'ng-valid');
    });

    it('workspace volume', () => {
      cy.get('[data-cy-advanced-options-button]').click();
      cy.get('[data-cy-form-input="workspaceVolume"]').click();
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .clear();
      // invalid pattern
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
      // volume name in use
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
      // empty value
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('mat-error')
        .should('have.text', ' Name is required ');
      // delete new volume
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('mat-icon[mattooltip="Delete volume"]')
        .click();
      cy.get(
        '[data-cy-form-input="workspaceVolume"] > mat-expansion-panel',
      ).should('not.exist');
      // add existing volume
      cy.get('[data-cy-form-button="workspaceVolume-new"]').should('exist');
      cy.get('[data-cy-form-button="workspaceVolume-existing"]').should(
        'exist',
      );
      cy.get('[data-cy-form-button="workspaceVolume-existing"]').click();
      cy.get('[data-cy-form-button="workspaceVolume-new"]').should('not.exist');
      cy.get('[data-cy-form-button="workspaceVolume-existing"]').should(
        'not.exist',
      );
      cy.get('[data-cy-form-input="workspaceVolume"] > mat-expansion-panel')
        .find('app-existing-volume')
        .should('exist');
      // existing volume name empty
      cy.get(
        '[data-cy-form-input="workspaceVolume"] > mat-expansion-panel',
      ).click();
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-select')
        .click({ force: true });
      cy.get('body').click();
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="existing-volume"]')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-error')
        .should('have.text', ' Name is required ');
      // existing volume name already in use
      cy.get(
        '[data-cy-form-input="workspaceVolume"] > mat-expansion-panel',
      ).click();
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-select')
        .click({ force: true });
      cy.get('mat-option')
        .contains('titanic-ml-47xh5-data-m57vq-2md82')
        .click({ force: true });
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="existing-volume"]')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-error')
        .should('have.text', ' Is mounted ');
      // existing volume protected b
      cy.get(
        '[data-cy-form-input="workspaceVolume"] > mat-expansion-panel',
      ).click();
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-select')
        .click({ force: true });
    });

    it('workspace volume auto update name', () => {
      cy.get('.lib-advanced-options').find('.toggle-button').click();
      cy.get('[data-cy-form-input="workspaceVolume"]').click();
      // assert volume name auto updates when not dirty
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type('test-notebook');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .invoke('val')
        .should('eq', 'test-notebook-volume');
      // assert volume name doesn't auto update when dirty
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .type('-dirty');
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type('-with-extra');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .invoke('val')
        .should('eq', 'test-notebook-volume-dirty');
    });

    it('data volume', () => {
      cy.get('[data-cy-advanced-options-button]').click();
      cy.get('[data-cy-form-button="dataVolumes-new"]').click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .clear();
      // volume name invalid pattern
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
      // volume name in use
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
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .clear();
      // empty value
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('mat-error')
        .should('have.text', ' Name is required ');
      // mount path invalid pattern
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .type('abc/');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('mat-error')
        .should(
          'have.text',
          ' The accepted locations are /home/jovyan, /opt/openmpp and any of their subdirectorie ',
        );
      // mount path empty value
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('mat-error')
        .should('have.text', ' Mount path is required ');
      // mount path duplicate value
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .type('/home/jovyan/mount1');
      cy.get('[data-cy-form-button="dataVolumes-new"]').click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .clear();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .eq(1)
        .find('input')
        .type('/home/jovyan/mount1');
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
      // delete new volumes
      // deletes the first data volume in the list, then deletes the last remaining data volume
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('mat-icon[mattooltip="Delete volume"]')
        .eq(0)
        .click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('mat-icon[mattooltip="Delete volume"]')
        .click();
      cy.get('[data-cy-form-input="dataVolumes"] > mat-expansion-panel').should(
        'not.exist',
      );
      // add existing volume
      cy.get('[data-cy-form-button="dataVolumes-new"]').should('exist');
      cy.get('[data-cy-form-button="dataVolumes-existing"]').should('exist');
      cy.get('[data-cy-form-button="dataVolumes-existing"]').click();
      cy.get('[data-cy-form-input="dataVolumes"] > mat-expansion-panel')
        .find('app-existing-volume')
        .should('exist');
      // existing volume name empty
      cy.get(
        '[data-cy-form-input="dataVolumes"] > mat-expansion-panel',
      ).click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-select')
        .click({ force: true });
      cy.get('body').click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-error')
        .should('have.text', ' Name is required ');
      // existing volume name already in use
      cy.get(
        '[data-cy-form-input="dataVolumes"] > mat-expansion-panel',
      ).click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-select')
        .click({ force: true });
      cy.get('[role="listbox"] > mat-option')
        .contains('titanic-ml-47xh5-data-m57vq-2md82')
        .click({ force: true });
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-error')
        .should('have.text', ' Is mounted ');
      // existing volume protected b
      cy.get(
        '[data-cy-form-input="dataVolumes"] > mat-expansion-panel',
      ).click();
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .find('mat-select')
        .click({ force: true });
      cy.get('[role="listbox"] > mat-option')
        .contains('test-pro-b-volume')
        .click({ force: true });
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .should('have.class', 'ng-invalid');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="existing-volume"]')
        .should('have.class', 'ng-valid');
    });

    it('data volume auto update name', () => {
      cy.get('.lib-advanced-options').find('.toggle-button').click();
      cy.get('[data-cy-form-button="dataVolumes-new"]').click();
      // assert volume name and mount path auto updates when not dirty
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type('test-notebook');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .invoke('val')
        .should('eq', 'test-notebook-datavol-1');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .invoke('val')
        .should('eq', '/home/jovyan/test-notebook-datavol-1');
      // assert volume name doesn't auto update when dirty
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .type('-dirty');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .invoke('val')
        .should('eq', '/home/jovyan/test-notebook-datavol-1-dirty');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .type('-mount');
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type('-with-extra');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .invoke('val')
        .should('eq', 'test-notebook-datavol-1-dirty');
      cy.get('[data-cy-form-input="dataVolumes"]')
        .find('[data-cy-form-input="mount-path"]')
        .find('input')
        .invoke('val')
        .should('eq', '/home/jovyan/test-notebook-datavol-1-dirty-mount');
    });
  });

  describe('notebook creation', () => {
    it('should create a jupyter notebook', () => {
      // cancel notebook creation
      cy.get('[data-cy-form-button="cancel"]').click();
      cy.url().should('eq', 'http://localhost:4200/');
    });

    it('should create a jupyter notebook', () => {
      cy.get('[data-cy-form-button="submit"]').should('be.disabled');
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type('test-notebook-jupyter');
      cy.get(
        '[data-cy-form-input="serverType"] > mat-button-toggle[value="jupyter"]',
      ).should('have.class', 'mat-button-toggle-checked');

      cy.get('[data-cy-advanced-options-button]').click();
      // assert default values
      cy.get('[data-cy-form-input="serverImage"]')
        .find('.mat-mdc-select-value')
        .should('have.text', 'jupyterlab-cpu');

      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .invoke('val')
        .should('eq', '0.5');
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .invoke('val')
        .should('eq', '2.0');
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('input')
        .invoke('val')
        .should('eq', '4.0');
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('input')
        .invoke('val')
        .should('eq', '4.0');

      cy.get('[data-cy-form-input="gpus"]')
        .find('.mat-mdc-select-value')
        .should('have.text', 'None');
      cy.get('[data-cy-form-input="vendor"]')
        .find('.mat-mdc-select-value')
        .should('have.text', 'NVIDIA');

      cy.get(
        '[data-cy-form-input="workspaceVolume"] > mat-expansion-panel',
      ).should('exist');
      cy.get('[data-cy-form-input="workspaceVolume"]')
        .find('[data-cy-form-input="volume-name"]')
        .find('input')
        .invoke('val')
        .should('eq', 'test-notebook-jupyter-volume');
      cy.get('[data-cy-form-input="dataVolumes"] > mat-expansion-panel').should(
        'not.exist',
      );

      cy.get('[data-cy-form-input="language"]')
        .find('.mat-mdc-select-value')
        .should('have.text', 'English');
      // submit the notebook
      cy.get('[data-cy-form-button="submit"]').should('be.enabled');
      cy.intercept('POST', 'api/namespaces/kubeflow-user/notebooks', {
        success: true,
        status: 200,
      }).as('mockSubmitNotebook');
      cy.get('[data-cy-form-button="submit"]').click();
      cy.wait('@mockSubmitNotebook');
      cy.url().should('eq', 'http://localhost:4200/');
    });

    it('should create a SAS notebook', () => {
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type('test-notebook-sas');
      // select sas notebook
      cy.get(
        '[data-cy-form-input="serverType"] > mat-button-toggle[value="group-three"]',
      ).click();
      // submit the notebook
      cy.get('[data-cy-form-button="submit"]').should('be.enabled');
      cy.intercept('POST', 'api/namespaces/kubeflow-user/notebooks', {
        success: true,
        status: 200,
      }).as('mockSubmitNotebook');
      cy.get('[data-cy-form-button="submit"]').click();
      cy.wait('@mockSubmitNotebook');
      cy.url().should('eq', 'http://localhost:4200/');
      // mock non-sas namespace
      cy.intercept('GET', '/api/namespaces/kubeflow-user', {
        success: true,
        status: 200,
        user: null,
        namespace: {
          metadata: {
            name: 'kubeflow-user',
            creationTimestamp: null,
            labels: {
              'app.kubernetes.io/part-of': 'kubeflow-profile',
              'istio-injection': 'enabled',
              'katib-metricscollector-injection': 'enabled',
              'kubernetes.io/metadata.name': 'kubeflow-user',
              'pipelines.kubeflow.org/enabled': 'false',
              'serving.kubeflow.org/inferenceservice': 'enabled',
              'state.aaw.statcan.gc.ca/exists-internal-blob-storage': 'false',
              'state.aaw.statcan.gc.ca/exists-non-cloud-main-user': 'false',
              'state.aaw.statcan.gc.ca/exists-non-sas-notebook-user': 'true',
              'state.aaw.statcan.gc.ca/has-sas-notebook-feature': 'false',
              'state.aaw.statcan.gc.ca/non-employee-users': 'false',
            },
          },
          spec: {},
          status: {},
        },
      }).as('mockNamespaceMetadataRequest');
      cy.get('[data-cy-toolbar-button="New Notebook"]').click();
      cy.wait('@mockNamespaceMetadataRequest');
      // assert that the sas image is disabled
      cy.get(
        '[data-cy-form-input="serverType"] > mat-button-toggle[value="group-three"] > button',
      ).should('be.disabled');
    });

    it('should create a jupyter GPU notebook', () => {
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type('test-notebook-gpu');
      cy.get('[data-cy-advanced-options-button]').click();
      // select different jupyter image
      cy.get('[data-cy-form-input="serverImage"]').click();
      cy.get('[role="listbox"] > mat-option')
        .contains('jupyterlab-tensorflow')
        .click();
      // set a gpu
      cy.get('[data-cy-form-input="vendor"]')
        .find('mat-select')
        .should('have.class', 'mat-mdc-select-disabled');
      cy.get('[data-cy-form-input="gpus"]').click();
      cy.get('[role="listbox"] > mat-option').should('have.length', 2);
      cy.get('[role="listbox"] > mat-option').contains('1').click();
      cy.get('[data-cy-form-input="vendor"]')
        .find('mat-select')
        .should('not.have.class', 'mat-mdc-select-disabled');
      cy.get('[data-cy-form-input="vendor"]').click();
      cy.get('[role="listbox"] > mat-option').should('have.length', 1);
      cy.get('[role="listbox"] > mat-option').contains('NVIDIA').click();
      cy.get('[data-cy-form-input="cpu"]')
        .find('input')
        .invoke('val')
        .should('eq', '4.0');
      cy.get('[data-cy-form-input="memory"]')
        .find('input')
        .invoke('val')
        .should('eq', '96.0');
      cy.get('[data-cy-form-input="cpuLimit"]')
        .find('input')
        .invoke('val')
        .should('eq', '4.0');
      cy.get('[data-cy-form-input="memoryLimit"]')
        .find('input')
        .invoke('val')
        .should('eq', '96.0');
      // submit the notebook
      cy.get('[data-cy-form-button="submit"]').should('be.enabled');
      cy.intercept('POST', 'api/namespaces/kubeflow-user/notebooks', {
        success: true,
        status: 200,
      }).as('mockSubmitNotebook');
      cy.get('[data-cy-form-button="submit"]').click();
      cy.wait('@mockSubmitNotebook');
      cy.url().should('eq', 'http://localhost:4200/');
    });

    it('should create a custom image notebook', () => {
      cy.get('lib-name-input[resourcename="Notebook Server"]')
        .find('input')
        .type('test-notebook-custom');
      cy.get('[data-cy-advanced-options-button]').click();
      // set custom image
      cy.get('[data-cy-form-input="customImageCheck"]')
        .find('input')
        .check({ force: true });
      cy.get('[data-cy-form-input="customImage"]')
        .find('input')
        .type('test/image:latest');
      // submit the notebook
      cy.get('[data-cy-form-button="submit"]').should('be.enabled');
      cy.intercept('POST', 'api/namespaces/kubeflow-user/notebooks', {
        success: true,
        status: 200,
      }).as('mockSubmitNotebook');
      cy.get('[data-cy-form-button="submit"]').click();
      cy.wait('@mockSubmitNotebook');
      cy.url().should('eq', 'http://localhost:4200/');
    });
  });
});
