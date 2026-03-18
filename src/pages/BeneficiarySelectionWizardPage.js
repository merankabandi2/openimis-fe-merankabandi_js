import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withHistory, withModulesManager, graphql, formatPageQuery, decodeId } from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
import { CircularProgress, Box } from '@material-ui/core';
import BeneficiarySelectionWizard from '../components/wizard/BeneficiarySelectionWizard';

const styles = (theme) => ({
  page: theme.page,
});

const BENEFIT_PLAN_PROJECTION = [
  'id', 'code', 'name', 'type', 'maxBeneficiaries',
  'beneficiaryDataSchema', 'jsonExt',
];

function BeneficiarySelectionWizardPage({
  classes, modulesManager, match, dispatch,
}) {
  const [benefitPlan, setBenefitPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const benefitPlanUuid = match?.params?.benefit_plan_uuid;

  useEffect(() => {
    if (benefitPlanUuid) {
      const payload = formatPageQuery(
        'benefitPlan',
        [`id: "${benefitPlanUuid}"`],
        BENEFIT_PLAN_PROJECTION,
      );
      dispatch(graphql(payload, 'MERANKABANDI_WIZARD_BENEFIT_PLAN'))
        .then((resp) => {
          const edges = resp?.payload?.data?.benefitPlan?.edges;
          if (edges?.length) {
            const node = edges[0].node;
            setBenefitPlan({ ...node, id: decodeId(node.id) });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [benefitPlanUuid]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className={classes.page}>
      <BeneficiarySelectionWizard benefitPlan={benefitPlan} />
    </div>
  );
}

export default withHistory(
  withModulesManager(injectIntl(withStyles(styles)(
    connect()(BeneficiarySelectionWizardPage)
  )))
);
