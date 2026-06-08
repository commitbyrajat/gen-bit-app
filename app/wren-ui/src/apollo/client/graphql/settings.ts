import { gql } from '@apollo/client';

export const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      productVersion
      dataSource {
        type
        properties
        sampleDataset
      }
      language
      tenancy {
        tenant {
          id
          name
          slug
          status
        }
        workspace {
          id
          name
          slug
          status
        }
        project {
          id
          displayName
          type
        }
      }
    }
  }
`;

export const RESET_CURRENT_PROJECT = gql`
  mutation ResetCurrentProject {
    resetCurrentProject
  }
`;

export const UPDATE_CURRENT_PROJECT = gql`
  mutation UpdateCurrentProject($data: UpdateCurrentProjectInput!) {
    updateCurrentProject(data: $data)
  }
`;
