import { LinkGroup } from './link-groups-table/types';

export const mockPodGroups: LinkGroup[] = [
  {
    name: 'InferenceService',
    links: [
      {
        name: 'serving-openvaccine-0-486kc (predictor)',
        url:
          '/models/details/kubeflow-user/serving-openvaccine-0-486kc/',
      },
      {
        name: 'serving-openvaccine-0-486kc (transformer)',
        url:
          '/models/details/kubeflow-user/serving-openvaccine-0-486kc/',
      },
    ],
  },
];
