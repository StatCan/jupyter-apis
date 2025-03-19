/// <reference types="cypress" />

Cypress.Commands.add('selectAllNamespaces', () => {
  cy.log(`Selecting all namespaces`);

  // click and select 'All namespaces' option
  cy.get('[data-cy-namespace-selector-dropdown]').click();
  cy.get(`[data-cy-all-namespaces]`).click();
});

Cypress.Commands.add('mockDashboardRequest', () => {
  cy.intercept('GET', '/dashboard_lib.bundle.js', { body: [] }).as(
    'mockDashboardRequest',
  );
});

Cypress.Commands.add('mockNamespacesRequest', () => {
  cy.intercept('GET', '/api/namespaces', {
    fixture: 'namespaces',
  }).as('mockNamespacesRequest');
});

Cypress.Commands.add('mockNamespaceMetadataRequest', namespace => {
  cy.intercept('GET', `/api/namespaces/${namespace}`, {
    fixture: 'namespaceMetadata',
  }).as('mockNamespaceMetadataRequest');
});

Cypress.Commands.add('mockNotebooksRequest', namespace => {
  cy.intercept('GET', `/api/namespaces/${namespace}/notebooks`, {
    fixture: 'notebooks',
  }).as('mockNotebooksRequest');
});

Cypress.Commands.add('mockNotebooksAllNamespacesRequest', settingsNamespace => {
  cy.fixture('namespaces').then(res => {
    for (const namespace of res.namespaces) {
      if (namespace === settingsNamespace) {
        continue;
      }
      cy.intercept('GET', `/api/namespaces/${namespace}/notebooks`, {
        notebooks: [],
      });
    }
  });
});

Cypress.Commands.add('mockStorageClassesRequests', () => {
  cy.intercept('GET', '/api/storageclasses', {
    storageClasses: ['standard']
  }).as('mockStorageClassesRequests');
});

Cypress.Commands.add('mockDefaultStorageClassRequest', () => {
  cy.intercept('GET', '/api/storageclasses/default', {
    success: true,
    status: 200,
    user: null,
    defaultStorageClass: 'default',
  }).as('mockDefaultStorageClassRequest');
});

Cypress.Commands.add('mockConfigRequest', () => {
  cy.intercept('GET', '/api/config', {
    fixture: 'config',
  }).as('mockConfigRequest');
});

Cypress.Commands.add('mockPoddefaultsRequest', namespace => {
  cy.intercept('GET', `/api/namespaces/${namespace}/poddefaults`, {
    fixture: 'poddefaults',
  }).as('mockPoddefaultsRequest');
});

Cypress.Commands.add('mockPVCsRequest', namespace => {
  cy.intercept('GET', `/api/namespaces/${namespace}/pvcs`, {
    fixture: 'pvcs',
  }).as('mockPVCsRequest');
});

Cypress.Commands.add('mockKubecostRequest', namespace => {
  cy.intercept(
    'GET',
    `/api/namespaces/${namespace}/cost/allocation?aggregation=namespace&namespace=${namespace}&window=today`,
    {
      fixture: 'cost',
    },
  ).as('mockKubecostRequest');
});

Cypress.Commands.add('mockGetPvcRequest', (namespace, pvc) => {
  cy.intercept('GET', `/api/namespaces/${namespace}/pvcs/${pvc}`, {
    fixture: 'pvc',
  }).as('mockGetPvcRequest');
});

Cypress.Commands.add('mockGetPvcPodsRequest', (namespace, pvc) => {
  cy.intercept('GET', `/api/namespaces/${namespace}/pvcs/${pvc}/pods`, {
    fixture: 'pvcPods',
  }).as('mockGetPvcPodsRequest');
});

Cypress.Commands.add('mockGetPvcEventsRequest', (namespace, pvc) => {
  cy.intercept('GET', `/api/namespaces/${namespace}/pvcs/${pvc}/events`, {
    fixture: 'pvcEvents',
  }).as('mockGetPvcEventsRequest');
});

Cypress.Commands.add('mockGetNotebookRequest', (namespace, notebook) => {
  cy.intercept('GET', `/api/namespaces/${namespace}/notebooks/${notebook}`, {
    fixture: 'notebook',
  }).as('mockGetNotebookRequest');
});

Cypress.Commands.add('mockGetNotebookPodRequest', (namespace, notebook) => {
  cy.intercept(
    'GET',
    `/api/namespaces/${namespace}/notebooks/${notebook}/pod`,
    {
      fixture: 'notebookPod',
    },
  ).as('mockGetNotebookPodRequest');
});

Cypress.Commands.add(
  'mockGetNotebookLogsRequest',
  (namespace, notebook, pod) => {
    cy.intercept(
      'GET',
      `api/namespaces/${namespace}/notebooks/${notebook}/pod/${pod}/logs`,
      {
        fixture: 'notebookLogs',
      },
    ).as('mockGetNotebookLogsRequest');
  },
);

Cypress.Commands.add('mockGetNotebookEventsRequest', (namespace, notebook) => {
  cy.intercept(
    'GET',
    `/api/namespaces/${namespace}/notebooks/${notebook}/events`,
    {
      fixture: 'notebookEvents',
    },
  ).as('mockGetNotebookEventsRequest');
});
