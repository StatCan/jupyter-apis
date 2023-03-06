import './handlers';
import './commands';

// types of the custom commands
// Must be declared global to be detected by typescript (allows import/export)
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mock request at '/api/namespaces'
       */
      mockNamespacesRequest(): Chainable<void>;

      /**
       * Custom command to mock request at '/api/namespaces/<namespace>/notebooks'
       * and returns array with mock notebooks []
       */
      mockNotebooksRequest(namespace: string): Chainable<void>;

       /**
       * Custom command to mock request at '/api/namespaces/<namespace>/pvcs'
       * and returns array with mock pvcs []
       */
       mockPVCsRequest(namespace: string): Chainable<void>;

       /**
       * Custom command to mock request at '/api/namespaces/<namespace>/cost/allocation'
       * and returns array with mock cost data
       */
       mockKubecostRequest(namespace: string): Chainable<void>;
    }
  }
}
