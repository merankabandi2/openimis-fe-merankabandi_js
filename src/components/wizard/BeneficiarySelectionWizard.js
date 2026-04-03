import React, { useState, useMemo } from 'react';
import {
  Stepper, Step, StepLabel, Button, Typography, Box,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import {
  withModulesManager, withHistory, formatMessage, PublishedComponent,
} from '@openimis/fe-core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import AssessmentIcon from '@material-ui/icons/Assessment';
import {
  importSurveyData, triggerPmtCalculation,
} from '../../wizard-actions';
import { MODULE_NAME } from '../../constants';
import WizardBeneficiaryList from './WizardBeneficiaryList';
import WizardValidationPanel from './WizardValidationPanel';
import WizardSummaryPanel from './WizardSummaryPanel';
import WizardPreCollectePanel from './WizardPreCollectePanel';
import WizardQuotaSelectionPanel from './WizardQuotaSelectionPanel';

const styles = (theme) => ({
  root: { width: '100%', padding: theme.spacing(3) },
  stepper: { backgroundColor: 'transparent', padding: theme.spacing(3, 0, 5) },
  content: {
    padding: theme.spacing(3),
    minHeight: 400,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
  actions: { display: 'flex', justifyContent: 'flex-end', marginTop: theme.spacing(3) },
  button: { marginLeft: theme.spacing(1) },
});

function BeneficiarySelectionWizard({
  intl, classes, benefitPlan, dispatch, history,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const targeting = benefitPlan?.jsonExt?.targeting || {};
  const {
    use_precollecte: usePrecollecte = false,
    use_quotas: useQuotas = false,
    require_community_validation: requireCommunityValidation = false,
    selection_method: selectionMethod = 'all',
  } = targeting;

  const steps = useMemo(() => {
    const s = [];
    if (usePrecollecte) {
      s.push({ key: 'precollecte', label: formatMessage(intl, MODULE_NAME, 'wizard.step.precollecte') });
    }
    s.push({ key: 'geographic', label: formatMessage(intl, MODULE_NAME, 'wizard.step.geographic') });
    if (selectionMethod === 'pmt') {
      s.push({ key: 'pmt', label: formatMessage(intl, MODULE_NAME, 'wizard.step.pmt') });
    }
    if (useQuotas) {
      s.push({ key: 'quota', label: formatMessage(intl, MODULE_NAME, 'wizard.step.quota') });
    }
    if (selectionMethod === 'criteria') {
      s.push({ key: 'criteria', label: formatMessage(intl, MODULE_NAME, 'wizard.step.criteria') });
    }
    if (requireCommunityValidation) {
      s.push({ key: 'validation', label: formatMessage(intl, MODULE_NAME, 'wizard.step.validation') });
    }
    s.push({ key: 'summary', label: formatMessage(intl, MODULE_NAME, 'wizard.step.summary') });
    return s;
  }, [intl, usePrecollecte, useQuotas, requireCommunityValidation, selectionMethod]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleImportSurvey = async () => {
    setSubmitting(true);
    try {
      await dispatch(importSurveyData(benefitPlan.id, '/data/survey.csv'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCalculatePMT = async () => {
    setSubmitting(true);
    try {
      await dispatch(triggerPmtCalculation(benefitPlan.id));
    } finally {
      setSubmitting(false);
    }
  };

  const currentStepKey = steps[activeStep]?.key;

  const renderStep = () => {
    switch (currentStepKey) {
      case 'precollecte':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {formatMessage(intl, MODULE_NAME, 'wizard.precollecte.title')}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {formatMessage(intl, MODULE_NAME, 'wizard.precollecte.description')}
            </Typography>
            <WizardPreCollectePanel
              benefitPlanId={benefitPlan?.id}
              selectedLocation={selectedLocation}
              dispatch={dispatch}
            />
          </Box>
        );
      case 'geographic':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {formatMessage(intl, MODULE_NAME, 'wizard.geographic.title')}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {formatMessage(intl, MODULE_NAME, 'wizard.geographic.description')}
            </Typography>
            <PublishedComponent
              pubRef="location.LocationPicker"
              onChange={setSelectedLocation}
              value={selectedLocation}
            />
            <Box mt={2}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CloudUploadIcon />}
                onClick={handleImportSurvey}
                disabled={submitting}
              >
                {formatMessage(intl, MODULE_NAME, 'wizard.action.importSurvey')}
              </Button>
            </Box>
          </Box>
        );
      case 'pmt':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {formatMessage(intl, MODULE_NAME, 'wizard.pmt.title')}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {formatMessage(intl, MODULE_NAME, 'wizard.pmt.description')}
            </Typography>
            <Box mt={2} mb={2}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AssessmentIcon />}
                onClick={handleCalculatePMT}
                disabled={submitting}
              >
                {formatMessage(intl, MODULE_NAME, 'wizard.action.calculatePMT')}
              </Button>
            </Box>
            <WizardBeneficiaryList
              benefitPlanId={benefitPlan?.id}
              selectedLocation={selectedLocation}
              dispatch={dispatch}
            />
          </Box>
        );
      case 'quota':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {formatMessage(intl, MODULE_NAME, 'wizard.quota.title')}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {formatMessage(intl, MODULE_NAME, 'wizard.quota.description')}
            </Typography>
            <WizardQuotaSelectionPanel
              benefitPlanId={benefitPlan?.id}
              dispatch={dispatch}
            />
          </Box>
        );
      case 'criteria':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {formatMessage(intl, MODULE_NAME, 'wizard.criteria.title')}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {formatMessage(intl, MODULE_NAME, 'wizard.criteria.description')}
            </Typography>
            <WizardBeneficiaryList
              benefitPlanId={benefitPlan?.id}
              selectedLocation={selectedLocation}
              dispatch={dispatch}
            />
          </Box>
        );
      case 'validation':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {formatMessage(intl, MODULE_NAME, 'wizard.validation.title')}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {formatMessage(intl, MODULE_NAME, 'wizard.validation.description')}
            </Typography>
            <WizardValidationPanel
              benefitPlanId={benefitPlan?.id}
              selectedLocation={selectedLocation}
              dispatch={dispatch}
            />
          </Box>
        );
      case 'summary':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {formatMessage(intl, MODULE_NAME, 'wizard.summary.title')}
            </Typography>
            <WizardSummaryPanel
              benefitPlan={benefitPlan}
              selectedLocation={selectedLocation}
              dispatch={dispatch}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" align="center" gutterBottom color="primary">
        {formatMessage(intl, MODULE_NAME, 'wizard.title')}
      </Typography>
      <Stepper activeStep={activeStep} className={classes.stepper} alternativeLabel>
        {steps.map((step) => (
          <Step key={step.key}><StepLabel>{step.label}</StepLabel></Step>
        ))}
      </Stepper>
      <div className={classes.content}>{renderStep()}</div>
      <div className={classes.actions}>
        <Button disabled={activeStep === 0} onClick={handleBack} className={classes.button}>
          {formatMessage(intl, MODULE_NAME, 'wizard.back')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? () => history.push('/socialProtection/benefitPlans') : handleNext}
          className={classes.button}
          disabled={submitting}
        >
          {activeStep === steps.length - 1
            ? formatMessage(intl, MODULE_NAME, 'wizard.finish')
            : formatMessage(intl, MODULE_NAME, 'wizard.next')}
        </Button>
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default withHistory(withModulesManager(
  injectIntl(withStyles(styles)(connect(null, mapDispatchToProps)(BeneficiarySelectionWizard)))
));
