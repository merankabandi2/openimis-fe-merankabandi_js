import {
  formatPageQuery,
  graphql,
} from '@openimis/fe-core';
const uuidv4 = () => crypto.randomUUID();

// Action types
export const RESULT_FRAMEWORK_SNAPSHOTS_REQ = 'MERANKABANDI_RESULT_FRAMEWORK_SNAPSHOTS_REQ';
export const RESULT_FRAMEWORK_SNAPSHOTS_RESP = 'MERANKABANDI_RESULT_FRAMEWORK_SNAPSHOTS_RESP';
export const RESULT_FRAMEWORK_SNAPSHOTS_ERR = 'MERANKABANDI_RESULT_FRAMEWORK_SNAPSHOTS_ERR';

export const CALCULATE_INDICATOR_VALUE_REQ = 'MERANKABANDI_CALCULATE_INDICATOR_VALUE_REQ';
export const CALCULATE_INDICATOR_VALUE_RESP = 'MERANKABANDI_CALCULATE_INDICATOR_VALUE_RESP';
export const CALCULATE_INDICATOR_VALUE_ERR = 'MERANKABANDI_CALCULATE_INDICATOR_VALUE_ERR';

export const CREATE_SNAPSHOT_REQ = 'MERANKABANDI_CREATE_SNAPSHOT_REQ';
export const CREATE_SNAPSHOT_RESP = 'MERANKABANDI_CREATE_SNAPSHOT_RESP';
export const CREATE_SNAPSHOT_ERR = 'MERANKABANDI_CREATE_SNAPSHOT_ERR';

export const GENERATE_DOCUMENT_REQ = 'MERANKABANDI_GENERATE_DOCUMENT_REQ';
export const GENERATE_DOCUMENT_RESP = 'MERANKABANDI_GENERATE_DOCUMENT_RESP';
export const GENERATE_DOCUMENT_ERR = 'MERANKABANDI_GENERATE_DOCUMENT_ERR';

export const FINALIZE_SNAPSHOT_REQ = 'MERANKABANDI_FINALIZE_SNAPSHOT_REQ';
export const FINALIZE_SNAPSHOT_RESP = 'MERANKABANDI_FINALIZE_SNAPSHOT_RESP';
export const FINALIZE_SNAPSHOT_ERR = 'MERANKABANDI_FINALIZE_SNAPSHOT_ERR';

export function fetchResultFrameworkSnapshots(filters) {
  const query = `
    query ($first: Int, $last: Int, $after: String, $before: String, $orderBy: [String],
           $status: String, $name_Icontains: String) {
      resultFrameworkSnapshot(
        first: $first, last: $last, after: $after, before: $before, orderBy: $orderBy,
        status: $status, name_Icontains: $name_Icontains
      ) {
        totalCount
        pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor }
        edges {
          node {
            id
            name
            description
            snapshotDate
            status
            createdBy { username }
            documentPath
            data
          }
        }
      }
    }
  `;

  const payload = formatPageQuery(
    'resultFrameworkSnapshot',
    filters.first || 10,
    filters.after,
    filters.before,
    filters.orderBy || ['-snapshotDate'],
  );

  return graphql(
    query,
    { ...payload, ...filters },
    RESULT_FRAMEWORK_SNAPSHOTS_REQ,
    RESULT_FRAMEWORK_SNAPSHOTS_RESP,
    RESULT_FRAMEWORK_SNAPSHOTS_ERR,
  );
}

export function calculateIndicatorValue(indicatorId, dateFrom, dateTo, locationId) {
  const query = `
    query ($indicatorId: Int!, $dateFrom: Date, $dateTo: Date, $locationId: ID) {
      calculateIndicatorValue(
        indicatorId: $indicatorId,
        dateFrom: $dateFrom,
        dateTo: $dateTo,
        locationId: $locationId
      ) {
        value
        calculationType
        systemValue
        manualValue
        error
        date
        genderBreakdown
      }
    }
  `;

  return graphql(
    query,
    { indicatorId, dateFrom, dateTo, locationId },
    CALCULATE_INDICATOR_VALUE_REQ,
    CALCULATE_INDICATOR_VALUE_RESP,
    CALCULATE_INDICATOR_VALUE_ERR,
  );
}

export function createResultFrameworkSnapshot(name, description, dateFrom, dateTo) {
  const clientMutationId = uuidv4();
  const mutation = `
    mutation {
      createResultFrameworkSnapshot(input: {
        clientMutationId: "${clientMutationId}"
        name: "${name}"
        ${description ? `description: "${description}"` : ''}
        ${dateFrom ? `dateFrom: "${dateFrom}"` : ''}
        ${dateTo ? `dateTo: "${dateTo}"` : ''}
      }) {
        internalId
        clientMutationId
      }
    }
  `;
  return graphql(
    mutation,
    {},
    CREATE_SNAPSHOT_REQ,
    CREATE_SNAPSHOT_RESP,
    CREATE_SNAPSHOT_ERR,
  );
}

export function generateResultFrameworkDocument(snapshotId, format, dateFrom, dateTo) {
  const mutation = `
    mutation ($snapshotId: ID, $format: String, $dateFrom: Date, $dateTo: Date) {
      generateResultFrameworkDocument(
        snapshotId: $snapshotId,
        format: $format,
        dateFrom: $dateFrom,
        dateTo: $dateTo
      ) {
        success
        message
        documentUrl
      }
    }
  `;

  return graphql(
    mutation,
    { snapshotId, format: format || 'docx', dateFrom, dateTo },
    GENERATE_DOCUMENT_REQ,
    GENERATE_DOCUMENT_RESP,
    GENERATE_DOCUMENT_ERR,
  );
}

export function finalizeSnapshot(snapshotId) {
  const clientMutationId = uuidv4();
  const mutation = `
    mutation {
      finalizeSnapshot(input: {
        clientMutationId: "${clientMutationId}"
        snapshotId: "${snapshotId}"
      }) {
        internalId
        clientMutationId
      }
    }
  `;
  return graphql(
    mutation,
    {},
    FINALIZE_SNAPSHOT_REQ,
    FINALIZE_SNAPSHOT_RESP,
    FINALIZE_SNAPSHOT_ERR,
  );
}

export function clearResultFrameworkSnapshots() {
  return (dispatch) => {
    dispatch({ type: RESULT_FRAMEWORK_SNAPSHOTS_RESP, payload: null });
  };
}
