/**
 * Searcher column contributions for the beneficiary photo.
 *
 * Registered against the upstream contribution keys (defined in
 * `openimis-fe-individual_js/src/constants.js` and consumed by
 * `openimis-fe-core_js`'s `<Searcher>` via `columnsContributionKey`):
 *
 *   - individual.IndividualSearcher.columns       (item arg = `individual`)
 *   - individual.GroupIndividualSearcher.columns  (item arg = `groupIndividual`)
 *
 * Contribution object shape (per Searcher._mergeHeaders/_mergeItemFormatters):
 *   { header: string, formatter: (item) => ReactNode }
 *
 * The column displays the beneficiary photo only for the PRIMARY recipient
 * of a household (other members render blank). Photo URL hits the BE route
 * defined in openimis-be-merankabandi_py/merankabandi/urls.py:
 *   /api/merankabandi/beneficiary-photo/photo/<individual_uuid>/
 */
import React from 'react';
import { BENEFICIARY_PHOTO_URL } from '../../constants';

const PHOTO_STYLE = { height: 100, borderRadius: 4 };

function PhotoCell({ individualId }) {
  return (
    <img
      src={`${BENEFICIARY_PHOTO_URL}/${individualId}/`}
      alt="beneficiaire"
      style={PHOTO_STYLE}
    />
  );
}

const isPrimary = (groupIndividualEdge) => (
  groupIndividualEdge?.node?.recipientType === 'PRIMARY'
);

/**
 * Contribution for `individual.IndividualSearcher.columns` — formatter
 * receives the `individual` itself, with PRIMARY-recipient lookup via the
 * embedded `groupindividuals.edges` collection.
 */
export const individualPhotoColumnContrib = {
  header: 'Photo',
  formatter: (individual) => (
    isPrimary(individual?.groupindividuals?.edges?.[0])
      ? <PhotoCell individualId={individual.id} />
      : ''
  ),
};

/**
 * Contribution for `individual.GroupIndividualSearcher.columns` — formatter
 * receives a `groupIndividual` with the recipient flag inline and the
 * individual reference at `.individual.id`.
 */
export const groupIndividualPhotoColumnContrib = {
  header: 'Photo',
  formatter: (groupIndividual) => (
    groupIndividual?.recipientType === 'PRIMARY'
      ? <PhotoCell individualId={groupIndividual.individual.id} />
      : ''
  ),
};

/**
 * Contribution for `socialProtection.BenefitPlanGroupBeneficiariesSearcher.columns`
 * — formatter receives a `groupBeneficiary` row, whose group's PRIMARY
 * recipient is found via the nested `group.groupIndividuals.edges` collection
 * (one PRIMARY per household).
 */
export const benefitPlanGroupBeneficiaryPhotoColumnContrib = {
  header: 'Photo',
  formatter: (groupBeneficiary) => {
    const edges = groupBeneficiary?.group?.groupIndividuals?.edges
      || groupBeneficiary?.group?.groupindividuals?.edges  // GraphQL casing fallback
      || [];
    const primary = edges.find((e) => e?.node?.recipientType === 'PRIMARY');
    if (!primary) return '';
    return <PhotoCell individualId={primary.node.individual.id} />;
  },
};
