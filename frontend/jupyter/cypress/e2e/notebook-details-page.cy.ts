describe('Notebook Details Page', () => {
  beforeEach(() => {
    cy.mockGetNotebookRequest('kubeflow-user', 'test-notebook');
    cy.intercept(
      'GET',
      `/api/namespaces/kubeflow-user/notebooks/test-notebook/pod`,
      {
        statusCode: 404,
      },
    ).as('mockGetNotebookPodRequest');
    cy.mockPoddefaultsRequest('kubeflow-user');
    cy.visit('/notebook/details/kubeflow-user/test-notebook');
    cy.wait([
      '@mockGetNotebookRequest',
      '@mockGetNotebookPodRequest',
      '@mockPoddefaultsRequest',
    ]);
  });

  it('should open notebook details page', () => {
    cy.get('[data-cy-toolbar-title]').should('have.text', ' Notebook details ');
    cy.get('.notebook-name').should('have.text', 'test-notebook');
    // assert overview tab
    cy.get('lib-content-list-item[key="Volumes"]')
      .find('app-volumes')
      .get('.vol-group-container')
      .should('exist');
    cy.get('lib-content-list-item[key="Volumes"]')
      .find('app-volumes')
      .get('.vol-group-container > lib-urls > a')
      .should('have.text', ' test-notebook-volume\n')
      .should('have.attr', 'href')
      .and('eq', '/volume/details/kubeflow-user/test-notebook-volume');
    cy.get(
      'lib-details-list-item[key="Shared memory enabled"] > .list-entry-row > .list-entry-value > div',
    ).should('have.text', ' No\n');
    cy.get(
      'lib-content-list-item[key="Configurations"] > .list-entry-row > .container > app-configurations',
    ).should('have.text', ' No configurations available for this notebook. ');
    cy.get(
      'lib-details-list-item[key="Type"] > .list-entry-row > .list-entry-value > div',
    ).should('have.text', ' JupyterLab\n');
    cy.get(
      'lib-details-list-item[key="Minimum CPU"] > .list-entry-row > .list-entry-value > div',
    ).should('have.text', ' 500m\n');
    cy.get(
      'lib-details-list-item[key="Maximum CPU"] > .list-entry-row > .list-entry-value > div',
    ).should('have.text', ' 4\n');
    cy.get(
      'lib-details-list-item[key="Minimum memory"] > .list-entry-row > .list-entry-value > div',
    ).should('have.text', ' 2Gi\n');
    cy.get(
      'lib-details-list-item[key="Maximum memory"] > .list-entry-row > .list-entry-value > div',
    ).should('have.text', ' 4Gi\n');
    cy.get(
      'lib-details-list-item[key="Image"] > .list-entry-row > .list-entry-value > div',
    ).should(
      'have.text',
      ' k8scc01covidacr.azurecr.io/jupyterlab-cpu:v1\n content_copy ',
    );
    cy.get(
      'lib-content-list-item[key="Environment"] > .list-entry-row > .container > lib-variables-group-table > .env-group-container > .group-key',
    ).should('have.text', 'Notebook CR');
    cy.get(
      'lib-content-list-item[key="Environment"] > .list-entry-row > .container > lib-variables-group-table > .env-group-container > mat-chip-listbox',
    ).should('have.text', ' KF_LANG: en ');
    cy.get('lib-conditions-table[title="Conditions"]').should('exist');
    cy.get('lib-conditions-table[title="Conditions"]')
      .find('tbody > tr > td')
      .should('have.text', 'No rows to display');
    // assert log tab
    cy.get('div[role="tab"]').eq(1).click();
    cy.get('lib-panel > .panel-body > .panel-message').should(
      'have.text',
      '   No logs were found for this Notebook. ',
    );
    // assert events tab
    cy.intercept(
      'GET',
      '/api/namespaces/kubeflow-user/notebooks/test-notebook/events',
      {
        success: true,
        status: 200,
        events: [],
      },
    ).as('mockNotebookEventsRequest');
    cy.get('div[role="tab"]').eq(2).click();
    cy.wait('@mockNotebookEventsRequest');
    cy.get('tbody > tr > td').should('have.text', 'No rows to display');
    // assert yaml tab
    cy.get('div[role="tab"]').eq(3).click();
    cy.get('div.monaco-editor').should('exist');
    cy.get('div.monaco-editor').contains('name: test-notebook').should('exist');
    cy.get('mat-select').click();
    cy.get('mat-option[value="pod"]').click();
    cy.get('div.monaco-editor').should('exist');
    cy.get('div.monaco-editor')
      .contains('No pod available for this notebook.')
      .should('exist');
  });

  it('should start notebook from details page', () => {
    cy.get('[data-cy-toolbar-button="CONNECT"]').should('be.disabled');
    cy.get('[data-cy-toolbar-button="START"]').should('be.enabled');
    cy.get('[data-cy-toolbar-button="STOP"]').should('not.exist');
    cy.get('[data-cy-toolbar-button="DELETE"]').should('be.enabled');
    cy.get('lib-status-icon > mat-icon').should('have.text', ' stop_circle\n');
    // start the notebook
    cy.intercept(
      'PATCH',
      '/api/namespaces/kubeflow-user/notebooks/test-notebook',
      { success: true, status: 200 },
    ).as('mockStartNotebookRequest');
    cy.get('[data-cy-toolbar-button="START"]').click();
    cy.wait('@mockStartNotebookRequest');
    cy.intercept(
      'GET',
      `/api/namespaces/kubeflow-user/notebooks/test-notebook`,
      {
        fixture: 'runningNotebook',
      },
    ).as('mockGetNotebookRequest');
    cy.mockGetNotebookPodRequest('kubeflow-user', 'test-notebook');
    cy.wait(['@mockGetNotebookRequest', '@mockGetNotebookPodRequest']);
    // assert changes with now running notebook
    cy.get('[data-cy-toolbar-button="CONNECT"]').should('be.enabled');
    cy.get('[data-cy-toolbar-button="STOP"]').should('exist').and('be.enabled');
    cy.get('[data-cy-toolbar-button="START"]').should('not.exist');
    cy.get('lib-status-icon > mat-icon').should('have.text', ' check_circle\n');
    cy.get('lib-conditions-table[title="Conditions"]')
      .find('tbody > tr')
      .should('have.length', 4);

    cy.mockGetNotebookLogsRequest('kubeflow-user', 'test-notebook', 'test-pod');
    cy.get('div[role="tab"]').eq(1).click();
    cy.wait('@mockGetNotebookLogsRequest');
    cy.get('cdk-virtual-scroll-viewport').should(
      'have.text',
      '0 Test logs - messages are messages. 1 abc 2 one two three 3  ',
    );

    cy.mockGetNotebookEventsRequest('kubeflow-user', 'test-notebook');
    cy.get('div[role="tab"]').eq(2).click();
    cy.wait('@mockGetNotebookEventsRequest');
    cy.get('tbody > tr').should('have.length', 2);

    cy.get('div[role="tab"]').eq(3).click();
    cy.get('div.monaco-editor').should('exist');
    cy.get('div.monaco-editor').contains('name: test-notebook').should('exist');
    cy.get('mat-select').click();
    cy.get('mat-option[value="pod"]').click();
    cy.get('div.monaco-editor').should('exist');
    cy.get('div.monaco-editor').contains('name: test-pod').should('exist');
  });

  it('should stop notebook from details page', () => {
    // have a running notebook
    cy.intercept(
      'GET',
      `/api/namespaces/kubeflow-user/notebooks/test-notebook`,
      {
        fixture: 'runningNotebook',
      },
    ).as('mockGetNotebookRequest');
    cy.mockGetNotebookPodRequest('kubeflow-user', 'test-notebook');
    cy.wait(['@mockGetNotebookRequest', '@mockGetNotebookPodRequest']);
    // stop the notebook
    cy.get('[data-cy-toolbar-button="STOP"]').click();
    cy.get('.mat-mdc-dialog-title')
      .should('be.visible')
      .and(
        'have.text',
        'Are you sure you want to stop this notebook server? test-notebook',
      );
    cy.get('.mat-mdc-dialog-actions > button').contains('CANCEL').click();
    cy.get('mat-dialog-container').should('not.exist');
    cy.get('[data-cy-toolbar-button="STOP"]').click();
    cy.intercept(
      'PATCH',
      '/api/namespaces/kubeflow-user/notebooks/test-notebook',
      { success: true, status: 200 },
    ).as('mockStartNotebookRequest');
    cy.get('.mat-mdc-dialog-actions > button').contains('STOP').click();
    cy.wait('@mockStartNotebookRequest');

    cy.mockGetNotebookRequest('kubeflow-user', 'test-notebook');
    cy.intercept(
      'GET',
      `/api/namespaces/kubeflow-user/notebooks/test-notebook/pod`,
      {
        statusCode: 404,
      },
    ).as('mockGetNotebookPodRequest');
    cy.wait(['@mockGetNotebookRequest', '@mockGetNotebookPodRequest']);

    cy.get('[data-cy-toolbar-button="START"]').should('be.enabled');
    cy.get('[data-cy-toolbar-button="STOP"]').should('not.exist');
    cy.get('lib-status-icon > mat-icon').should('have.text', ' stop_circle\n');
    cy.get('lib-conditions-table[title="Conditions"]')
      .find('tbody > tr > td')
      .should('have.text', 'No rows to display');
  });

  it('should delete notebook from details page', () => {
    cy.get('[data-cy-toolbar-button="DELETE"]').should('be.enabled');
    cy.get('[data-cy-toolbar-button="DELETE"]').click();

    cy.get('.mat-mdc-dialog-title')
      .should('be.visible')
      .and(
        'have.text',
        'Are you sure you want to delete this notebook server? test-notebook',
      );
    cy.get('.mat-mdc-dialog-actions > button').contains('CANCEL').click();
    cy.get('mat-dialog-container').should('not.exist');
    cy.get('[data-cy-toolbar-button="DELETE"]').click();

    cy.intercept(
      'DELETE',
      '/api/namespaces/kubeflow-user/notebooks/test-notebook',
      {
        success: true,
        status: 200,
      },
    ).as('mockDeleteNotebookRequest');
    cy.get('.mat-mdc-dialog-actions > button').contains('DELETE').click();
    cy.wait('@mockDeleteNotebookRequest');
    cy.url().should('eq', 'http://localhost:4200/');
  });
});
