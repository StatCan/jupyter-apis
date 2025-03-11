import './commands';

// types of the custom commands
// Must be declared global to be detected by typescript (allows import/export)
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mock request at '/dashboard_lib.bundle.js'
       */
      mockDashboardRequest(): Chainable<void>;

      /**
       * Custom command to select all-namespaces option from the dropdown
       */
      selectAllNamespaces(): Chainable;

      /**
       * Custom command to mock request at '/api/namespaces'
       */
      mockNamespacesRequest(): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>'
       * to return metadata information for the given namespace
       */
      mockNamespaceMetadataRequest(namespace: string): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/notebooks'
       * and returns array with mock notebooks []
       */
      mockNotebooksRequest(namespace: string): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/notebooks'
       * for each namespace of namespaces fixture and returns array with mock notebooks []
       */
      mockNotebooksAllNamespacesRequest(namespace: string): Chainable<void>;

      /**
       * Custom command to mock requests at '/api/storageclasses'
       */
      mockStorageClassesRequests(): Chainable<void>;

      /**
       * Custom command to mock requests at '/api/storageclasses/default'
       * and returns parameter defaultStorageClass
       */
      mockDefaultStorageClassRequest(): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/poddefaults'
       * and returns a mock array of PodDefaults for the given namespace
       */
      mockPoddefaultsRequest(namespace: string): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/pvcs'
       * and returns array with mock PVCs []
       * @example cy.mockPVCsRequest()
       */
      mockPVCsRequest(namespace: string): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/cost/allocation'
       * and returns array with mock cost data
       */
      mockKubecostRequest(namespace: string): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/pvcs/<pvc>'
       * and returns a mock pvc and array of associated namespaces for the given volume
       */
      mockGetPvcRequest(namespace: string, pvc: string): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/pvcs/<pvc>/pods'
       * and returns a mock pod for the given volume in the given namespace
       */
      mockGetPvcPodsRequest(namespace: string, pvc: string): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/pvcs/<volume>/events'
       * and returns a list of mock events for the given volume in the given namespace
       */
      mockGetPvcEventsRequest(namespace: string, pvc: string): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/notebooks/<notebook>'
       * and returns a mock notebook object for the given notebook in the given namespace
       */
      mockGetNotebookRequest(
        namespace: string,
        notebook: string,
      ): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/notebooks/<notebook>/pod'
       * and returns a mock pod for the given notebook in the given namespace
       */
      mockGetNotebookPodRequest(
        namespace: string,
        notebook: string,
      ): Chainable<void>;

      /**
       * Custom command to mock request at 'api/namespaces/<namespace>/notebooks/<notebook>/pod/<pod>/logs'
       * and returns a mock array of logs for the given notebook in the given namespace
       */
      mockGetNotebookLogsRequest(
        namespace: string,
        notebook: string,
        pod: string,
      ): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/notebooks/<notebook>/events'
       * and returns a mock array of events for the given notebook in the given namespace
       */
      mockGetNotebookEventsRequest(
        namespace: string,
        notebook: string,
      ): Chainable<void>;
    }
  }
}
