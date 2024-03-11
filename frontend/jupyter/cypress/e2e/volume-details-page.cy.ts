describe('Volume Details Page', () => {
  beforeEach(() => {
    cy.mockGetPvcRequest('kubeflow-user', 'test-volume');
    cy.mockGetPvcPodsRequest('kubeflow-user', 'test-volume');
    cy.visit('/volume/details/kubeflow-user/test-volume');
    cy.wait(['@mockGetPvcRequest', '@mockGetPvcPodsRequest']);
  });

  it('should open volume details page', () => {
    // assert overview tab
    cy.get('[data-cy-toolbar-title]').should('have.text', ' Volume details ');
    cy.get('.volume-name').should('have.text', 'test-volume');
    cy.get(
      'lib-details-list-item[key="Access modes"] > .list-entry-row > .list-entry-value > mat-chip-listbox > div > mat-chip-option',
    ).should('have.text', ' ReadWriteOnce ');
    cy.get(
      'lib-details-list-item[key="Size"] > .list-entry-row > .list-entry-value > div',
    ).should('have.text', ' 16Gi\n');
    cy.get(
      'lib-details-list-item[key="Storage class"] > .list-entry-row > .list-entry-value > div',
    ).should('have.text', ' default\n');
    cy.get(
      'lib-details-list-item[key="Volume mode"] > .list-entry-row > .list-entry-value > div',
    ).should('have.text', ' Filesystem\n');
    cy.get(
      'lib-details-list-item[key="Volume name"] > .list-entry-row > .list-entry-value > div',
    ).should('have.text', ' pvc-a9dd7d1a-c4c0-4b36-9302-beb8cccbcfbd\n');
    cy.get(
      'lib-content-list-item[key="Used by notebooks"] > .list-entry-row > div.container > lib-urls > a',
    )
      .should('have.text', ' test\n')
      .and('have.attr', 'href')
      .and('eq', '/notebook/details/kubeflow-user/test');
    cy.get(
      'lib-content-list-item[key="Pods Mounted"] > .list-entry-row > div.container > app-link-groups-table > div > .group-key',
    ).should('have.text', 'Notebooks');
    cy.get(
      'lib-content-list-item[key="Pods Mounted"] > .list-entry-row > div.container > app-link-groups-table > div > .link-group-container > lib-urls > a',
    )
      .should('have.text', ' test\n')
      .and('have.attr', 'href')
      .and('eq', '/notebook/details/kubeflow-user/test');
    // assert events tab
    cy.mockGetPvcEventsRequest('kubeflow-user', 'test-volume');
    cy.get('div[role="tab"]').eq(1).click();
    cy.wait('@mockGetPvcEventsRequest');
    cy.get('tbody > tr').should('have.length', 2);
    // assert yaml tab
    cy.get('div[role="tab"]').eq(2).click();
    cy.get('div.monaco-editor').should('exist');
  });

  it('should delete colume from volume details page', () => {
    // assert that delete is disabled on volumes attached
    cy.get('[data-cy-toolbar-button="DELETE"]').should('be.disabled');
    // aseert that delete button can delete
    cy.intercept('GET', `/api/namespaces/kubeflow-user/pvcs/test-volume2`, {
      success: true,
      status: 200,
      user: null,
      pvc: {
        metadata: {
          name: 'test-volume2',
          namespace: 'kubeflow-user',
        },
        spec: {
          accessModes: ['ReadWriteOnce'],
          resources: {
            requests: {
              storage: '16Gi',
            },
          },
          volumeName: 'pvc-abc-def',
          storageClassName: 'default',
          volumeMode: 'Filesystem',
        },
        status: {
          phase: 'Bound',
          accessModes: ['ReadWriteOnce'],
          capacity: {
            storage: '16Gi',
          },
        },
      },
      notebooks: [],
    }).as('mockGetPvcRequest2');
    cy.mockGetPvcPodsRequest('kubeflow-user', 'test-volume2');
    cy.visit('/volume/details/kubeflow-user/test-volume2');
    cy.wait(['@mockGetPvcRequest2', '@mockGetPvcPodsRequest']);
    cy.get('[data-cy-toolbar-button="DELETE"]').should('be.enabled');
    cy.get('[data-cy-toolbar-button="DELETE"]').click();
    cy.get('mat-dialog-container').should('exist');
    cy.get('.mat-mdc-dialog-title').should(
      'have.text',
      'Are you sure you want to delete this volume? test-volume2',
    );
    cy.get('[ng-reflect-dialog-result="cancel"]').click();
    cy.get('mat-dialog-container').should('not.exist');
    cy.get('[data-cy-toolbar-button="DELETE"]').click();
    cy.intercept('DELETE', '/api/namespaces/kubeflow-user/pvcs/test-volume2', {
      success: true,
      status: 200,
    }).as('mockDeleteVolumeRequest');
    cy.get('[ng-reflect-color="warn"]').click();
    cy.wait('@mockDeleteVolumeRequest');
    cy.url().should('eq', 'http://localhost:4200/');
  });
});
