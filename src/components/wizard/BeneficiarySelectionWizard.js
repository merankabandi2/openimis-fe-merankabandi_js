import React, { useState } from 'react';
import {
  Stepper, Step, StepLabel, Button, Typography, Box, Paper,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';
import {
  withModulesManager, formatMessage, PublishedComponent, journalize,
} from '@openimis/fe-core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { importSurveyData, triggerPmtCalculation } from '../../wizard-actions';
import { MODULE_NAME } from '../../constants';

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
  importSurveyData, triggerPmtCalculation,
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
    // TODO: add file upload or path input UI
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
            {/* TODO: embed BenefitPlanBeneficiariesSearcher filtered by POTENTIAL status */}
            <Box mt={2}>
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
            {/* TODO: embed BenefitPlanBeneficiariesSearcher with bulk retain/reject */}
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {formatMessage(intl, MODULE_NAME, 'wizard.summary.title')}
            </Typography>
            <Paper style={{ padding: 16, marginTop: 8 }}>
              <Typography variant="body1">
                <strong>{benefitPlan?.name}</strong> ({benefitPlan?.code})
              </Typography>
              <Typography variant="body2">
                {selectedLocation?.name || formatMessage(intl, MODULE_NAME, 'wizard.summary.allLocations')}
              </Typography>
            </Paper>
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

const mapDispatchToProps = (dispatch) => bindActionCreators(
  { importSurveyData, triggerPmtCalculation },
  dispatch,
);

export default withModulesManager(
  injectIntl(withStyles(styles)(connect(null, mapDispatchToProps)(BeneficiarySelectionWizard)))
);
