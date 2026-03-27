/**
 * Hooks for Geography module data fetching.
 * - useGeographyLocationDetail: fetches detail for a single location (province/commune/colline)
 * - useGeographyProvincesSummary: fetches summary rows for all provinces
 */

import { useGraphqlQuery } from '@openimis/fe-core';
import { useMemo } from 'react';

// ---------------------------------------------------------------------------
// Query: single-location detail (used by LocationDetailPage)
// ---------------------------------------------------------------------------
const GEOGRAPHY_LOCATION_DETAIL_QUERY = `
  query GeographyLocationDetail(
    $locationId: Int!
    $benefitPlanId: String
    $year: Int
  ) {
    geographyLocationDetail(
      locationId: $locationId
      benefitPlanId: $benefitPlanId
      year: $year
    ) {
      location {
        id
        uuid
        code
        name
        type
        parent {
          id
          uuid
          code
          name
          type
          parent {
            id
            uuid
            code
            name
            type
          }
        }
      }
      totalHouseholds
      totalIndividuals
      totalBeneficiaries
      totalAmountDisbursed
      paymentCycleCount
      paymentRate
      children {
        id
        uuid
        code
        name
        type
        totalHouseholds
        totalBeneficiaries
        totalAmountDisbursed
        paymentRate
        childCount
      }
      activePrograms {
        id
        name
        beneficiaryCount
        householdCount
        amountDisbursed
        cycleCount
        status
      }
      paymentHistory {
        cycleName
        date
        amountPaid
        beneficiaryCount
        paymentSource
      }
      paymentPoints {
        id
        paymentPointName
        benefitPlanName
        isInherited
      }
      households {
        groupUuid
        headOfHouseholdName
        socialId
        status
        pmtScore
        memberCount
        lastPaymentDate
        lastPaymentAmount
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Query: provinces summary (used by ProvincesPage / ProvinceMapTable)
// ---------------------------------------------------------------------------
const GEOGRAPHY_PROVINCES_SUMMARY_QUERY = `
  query GeographyProvincesSummary(
    $benefitPlanId: String
    $year: Int
  ) {
    geographyProvincesSummary(
      benefitPlanId: $benefitPlanId
      year: $year
    ) {
      id
      uuid
      code
      name
      totalHouseholds
      totalIndividuals
      totalBeneficiaries
      totalAmountDisbursed
      paymentCycleCount
      paymentRate
      agencyCount
    }
  }
`;

// ---------------------------------------------------------------------------
// Hook: location detail
// ---------------------------------------------------------------------------
export const useGeographyLocationDetail = (locationId, benefitPlanId, year) => {
  const variables = useMemo(() => {
    const vars = { locationId: parseInt(locationId, 10) };
    if (benefitPlanId) vars.benefitPlanId = benefitPlanId;
    if (year) vars.year = parseInt(year, 10);
    return vars;
  }, [locationId, benefitPlanId, year]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGraphqlQuery(
    GEOGRAPHY_LOCATION_DETAIL_QUERY,
    variables,
    { skip: !locationId },
  );

  const detail = data?.geographyLocationDetail || null;

  return {
    detail,
    location: detail?.location || null,
    children: detail?.children || [],
    activePrograms: detail?.activePrograms || [],
    paymentHistory: detail?.paymentHistory || [],
    paymentPoints: detail?.paymentPoints || [],
    households: detail?.households || [],
    isLoading,
    error,
    refetch,
  };
};

// ---------------------------------------------------------------------------
// Hook: provinces summary
// ---------------------------------------------------------------------------
export const useGeographyProvincesSummary = (benefitPlanId, year) => {
  const variables = useMemo(() => {
    const vars = {};
    if (benefitPlanId) vars.benefitPlanId = benefitPlanId;
    if (year) vars.year = parseInt(year, 10);
    return vars;
  }, [benefitPlanId, year]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGraphqlQuery(
    GEOGRAPHY_PROVINCES_SUMMARY_QUERY,
    variables,
    { skip: false },
  );

  return {
    provinces: data?.geographyProvincesSummary || [],
    isLoading,
    error,
    refetch,
  };
};
