import React, { useState } from 'react';
import {
  Stepper, Step, StepLabel, Button, Typography, Box,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';
import {
  withModulesManager, formatMessage, PublishedComponent,
} from '@openimis/fe-core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { importSurveyData, triggerPmtCalculation } from '../../wizard-actions';
import { MODULE_NAME } from '../../constants';
import WizardBeneficiaryList from './WizardBeneficiaryList';
import WizardValidationPanel from './WizardValidationPanel';
import WizardSummaryPanel from './WizardSummaryPanel';

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
  intl, classes, benefitPlan, dispatch,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    formatMessage(intl, MODULE_NAME, 'wizard.step.geographic'),
    formatMessage(intl, MODULE_NAME, 'wizard.step.pmt'),
    formatMessage(intl, MODULE_NAME, 'wizard.step.validation'),
    formatMessage(intl, MODULE_NAME, 'wizard.step.summary'),
  ];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleImportSurvey = () => {
    setSubmitting(true);
    dispatch(importSurveyData(benefitPlan.id, '/data/survey.csv'));
    setSubmitting(false);
  };

  const handleCalculatePMT = () => {
    setSubmitting(true);
    dispatch(triggerPmtCalculation(benefitPlan.id));
    setSubmitting(false);
  };

  const renderStep = (step) => {
    switch (step) {
      case 0:
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
      case 1:
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
      case 2:
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
      case 3:
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
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      <div className={classes.content}>{renderStep(activeStep)}</div>
      <div className={classes.actions}>
        <Button disabled={activeStep === 0} onClick={handleBack} className={classes.button}>
          {formatMessage(intl, MODULE_NAME, 'wizard.back')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? () => {} : handleNext}
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
  ...bindActionCreators({ importSurveyData, triggerPmtCalculation }, dispatch),
});

export default withModulesManager(
  injectIntl(withStyles(styles)(connect(null, mapDispatchToProps)(BeneficiarySelectionWizard)))
);
