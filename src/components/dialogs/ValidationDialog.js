import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CheckCircle, Cancel } from '@material-ui/icons';
import { useModulesManager, formatMessage, graphqlWithVariables } from '@openimis/fe-core';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    minWidth: '600px',
  },
  sectionTitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
  },
  dataRow: {
    marginBottom: theme.spacing(1),
  },
  label: {
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
  },
  statusChip: {
    marginTop: theme.spacing(1),
  },
  commentField: {
    marginTop: theme.spacing(2),
  },
  actionButtons: {
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
}));

function ValidationDialog({
  open, onClose, data, type, onValidated,
}) {
  const classes = useStyles();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const dispatch = useDispatch();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'validate' or 'reject'
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Determine the mutation based on type
  const mutationMap = {
    sensitization: 'validateSensitizationTraining',
    behavior_change: 'validateBehaviorChange',
    microproject: 'validateMicroproject',
  };

  // Helper function to get category display label
  const getCategoryLabel = (categoryKey) => {
    if (!categoryKey) return '';
    const normalizedKey = categoryKey.toLowerCase();
    const translated = formatMessage(intl, 'merankabandi', `sensitizationTraining.category.${normalizedKey}`);
    if (translated && !translated.includes('.')) return translated;
    return categoryKey.replace(/__/g, ' — ').replace(/_/g, ' ');
  };

  // Helper function to get human-readable modules/topics labels
  const getModulesLabel = (modules) => {
    if (!modules || !Array.isArray(modules) || modules.length === 0) return '';
    return modules.map((m) => {
      const key = m.toLowerCase();
      const translated = formatMessage(intl, 'merankabandi', `sensitizationTraining.category.${key}`);
      if (translated && !translated.includes('.')) return translated;
      return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    }).join(', ');
  };

  const handleValidation = (status) => {
    // Show confirmation dialog first
    setConfirmAction(status);
    setShowConfirmDialog(true);
  };

  const handleConfirmValidation = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);

    const mutationName = mutationMap[type];

    // Map mutation names to their correct input types
    const inputTypeMap = {
      validateSensitizationTraining: 'ValidateSensitizationTrainingMutationInput',
      validateBehaviorChange: 'ValidateBehaviorChangeMutationInput',
      validateMicroproject: 'ValidateMicroProjectMutationInput',
    };

    const inputType = inputTypeMap[mutationName];

    const mutation = `
      mutation ${mutationName}($input: ${inputType}!) {
        ${mutationName}(input: $input) {
          internalId
          clientMutationId
        }
      }
    `;

    const variables = {
      id: data.id || data.uuid,
      status: confirmAction,
      comment: comment || null,
      clientMutationId: `${mutationName}-${Date.now()}`,
    };

    try {
      dispatch(
        graphqlWithVariables(
          mutation,
          { input: variables },
          ['SOCIAL_PROTECTION_MUTATION_REQ', 'SOCIAL_PROTECTION_MUTATION_RESP', 'SOCIAL_PROTECTION_MUTATION_ERR'],
        ),
      );

      // Since graphql action doesn't return a promise, we'll handle success optimistically
      setTimeout(() => {
        setIsSubmitting(false);
        onValidated();
        onClose();
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Validation error:', error);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const renderDataDetails = () => {
    if (!data) return null;

    switch (type) {
      case 'sensitization':
        return (
          <>
            <Typography className={classes.sectionTitle} variant="h6">
              {formatMessage(intl, 'merankabandi', 'validation.trainingDetails')}
            </Typography>
            <Box className={classes.dataRow}>
              <span className={classes.label}>
                {formatMessage(intl, 'merankabandi', 'validation.date')}
                :
              </span>
              {data.sensitizationDate}
            </Box>
            <Box className={classes.dataRow}>
              <span className={classes.label}>
                {formatMessage(intl, 'merankabandi', 'validation.location')}
                :
              </span>
              {data.location?.name}
            </Box>
            <Box className={classes.dataRow}>
              <span className={classes.label}>
                {formatMessage(intl, 'merankabandi', 'validation.category')}
                :
              </span>
              {getCategoryLabel(data.category)}
            </Box>
            {data.modules && data.modules.length > 0 && (
              <Box className={classes.dataRow}>
                <span className={classes.label}>
                  {formatMessage(intl, 'merankabandi', 'validation.topics')}
                  :
                </span>
                {getModulesLabel(data.modules)}
              </Box>
            )}
            <Box className={classes.dataRow}>
              <span className={classes.label}>
                {formatMessage(intl, 'merankabandi', 'validation.facilitator')}
                :
              </span>
              {data.facilitator}
            </Box>
            <Divider />
            <Typography className={classes.sectionTitle} variant="subtitle1">
              {formatMessage(intl, 'merankabandi', 'validation.participants')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.men')}
                    :
                  </span>
                  {data.maleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.women')}
                    :
                  </span>
                  {data.femaleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.twa')}
                    :
                  </span>
                  {data.twaParticipants}
                </Box>
              </Grid>
            </Grid>
            {data.observations && (
              <Box className={classes.dataRow}>
                <span className={classes.label}>
                  {formatMessage(intl, 'merankabandi', 'validation.observations')}
                  :
                </span>
                {data.observations}
              </Box>
            )}
          </>
        );

      case 'behavior_change':
        return (
          <>
            <Typography className={classes.sectionTitle} variant="h6">
              {formatMessage(intl, 'merankabandi', 'validation.behaviorChangeDetails')}
            </Typography>
            <Box className={classes.dataRow}>
              <span className={classes.label}>
                {formatMessage(intl, 'merankabandi', 'validation.date')}
                :
              </span>
              {data.reportDate}
            </Box>
            <Box className={classes.dataRow}>
              <span className={classes.label}>
                {formatMessage(intl, 'merankabandi', 'validation.location')}
                :
              </span>
              {data.location?.name}
            </Box>
            <Divider />
            <Typography className={classes.sectionTitle} variant="subtitle1">
              {formatMessage(intl, 'merankabandi', 'validation.participants')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.men')}
                    :
                  </span>
                  {data.maleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.women')}
                    :
                  </span>
                  {data.femaleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.twa')}
                    :
                  </span>
                  {data.twaParticipants}
                </Box>
              </Grid>
            </Grid>
            {data.comments && (
              <Box className={classes.dataRow}>
                <span className={classes.label}>
                  {formatMessage(intl, 'merankabandi', 'validation.comments')}
                  :
                </span>
                {data.comments}
              </Box>
            )}
          </>
        );

      case 'microproject':
        return (
          <>
            <Typography className={classes.sectionTitle} variant="h6">
              {formatMessage(intl, 'merankabandi', 'validation.microprojectDetails')}
            </Typography>
            <Box className={classes.dataRow}>
              <span className={classes.label}>
                {formatMessage(intl, 'merankabandi', 'validation.date')}
                :
              </span>
              {data.reportDate}
            </Box>
            <Box className={classes.dataRow}>
              <span className={classes.label}>
                {formatMessage(intl, 'merankabandi', 'validation.location')}
                :
              </span>
              {data.location?.name}
            </Box>
            <Divider />
            <Typography className={classes.sectionTitle} variant="subtitle1">
              {formatMessage(intl, 'merankabandi', 'validation.participants')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.men')}
                    :
                  </span>
                  {data.maleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.women')}
                    :
                  </span>
                  {data.femaleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.twa')}
                    :
                  </span>
                  {data.twaParticipants}
                </Box>
              </Grid>
            </Grid>
            <Divider />
            <Typography className={classes.sectionTitle} variant="subtitle1">
              {formatMessage(intl, 'merankabandi', 'validation.projectTypes')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.agriculture')}
                    :
                  </span>
                  {data.agricultureBeneficiaries}
                </Box>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.livestock')}
                    :
                  </span>
                  {data.livestockBeneficiaries}
                </Box>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.commerce')}
                    :
                  </span>
                  {data.commerceServicesBeneficiaries}
                </Box>
              </Grid>
              <Grid item xs={6}>
                {data.livestockGoatBeneficiaries > 0 && (
                  <Box className={classes.dataRow}>
                    <span className={classes.label}>
                      {formatMessage(intl, 'merankabandi', 'validation.goats')}
                      :
                    </span>
                    {data.livestockGoatBeneficiaries}
                  </Box>
                )}
                {data.livestockPigBeneficiaries > 0 && (
                  <Box className={classes.dataRow}>
                    <span className={classes.label}>
                      {formatMessage(intl, 'merankabandi', 'validation.pigs')}
                      :
                    </span>
                    {data.livestockPigBeneficiaries}
                  </Box>
                )}
                {data.livestockRabbitBeneficiaries > 0 && (
                  <Box className={classes.dataRow}>
                    <span className={classes.label}>
                      {formatMessage(intl, 'merankabandi', 'validation.rabbits')}
                      :
                    </span>
                    {data.livestockRabbitBeneficiaries}
                  </Box>
                )}
                {data.livestockPoultryBeneficiaries > 0 && (
                  <Box className={classes.dataRow}>
                    <span className={classes.label}>
                      {formatMessage(intl, 'merankabandi', 'validation.poultry')}
                      :
                    </span>
                    {data.livestockPoultryBeneficiaries}
                  </Box>
                )}
                {data.livestockCattleBeneficiaries > 0 && (
                  <Box className={classes.dataRow}>
                    <span className={classes.label}>
                      {formatMessage(intl, 'merankabandi', 'validation.cattle')}
                      :
                    </span>
                    {data.livestockCattleBeneficiaries}
                  </Box>
                )}
              </Grid>
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        classes={{ paper: classes.dialogPaper }}
        maxWidth="md"
      >
        <DialogTitle>
          {formatMessage(intl, 'merankabandi', 'validation.dialog.title')}
          {data?.validationStatus && (
            <Chip
              label={formatMessage(intl, 'merankabandi', `validation.status.${data.validationStatus.toLowerCase()}`)}
              color={data.validationStatus === 'VALIDATED' ? 'primary' : 'default'}
              size="small"
              className={classes.statusChip}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {renderDataDetails()}

          {/* Show validation history if already validated */}
          {data?.validationStatus && data.validationStatus !== 'PENDING' && (
            <Box mt={2}>
              <Divider />
              <Typography className={classes.sectionTitle} variant="subtitle1">
                {formatMessage(intl, 'merankabandi', 'validation.history')}
              </Typography>
              {data.validatedBy && (
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.dialog.validatedBy')}
                    :
                  </span>
                  {data.validatedBy.username || data.validatedBy}
                </Box>
              )}
              {data.validationDate && (
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.dialog.validatedOn')}
                    :
                  </span>
                  {data.validationDate}
                </Box>
              )}
              {data.validationComment && (
                <Box className={classes.dataRow}>
                  <span className={classes.label}>
                    {formatMessage(intl, 'merankabandi', 'validation.previousComment')}
                    :
                  </span>
                  {data.validationComment}
                </Box>
              )}
            </Box>
          )}

          <TextField
            className={classes.commentField}
            fullWidth
            multiline
            rows={3}
            label={formatMessage(intl, 'merankabandi', 'validation.dialog.comment')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            {formatMessage(intl, 'merankabandi', 'validation.dialog.close')}
          </Button>
          <Box className={classes.actionButtons}>
            <Button
              onClick={() => handleValidation('REJECTED')}
              color="secondary"
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Cancel />}
              disabled={isSubmitting || (data?.validationStatus && data.validationStatus !== 'PENDING')}
            >
              {formatMessage(intl, 'merankabandi', 'validation.dialog.reject')}
            </Button>
            <Button
              onClick={() => handleValidation('VALIDATED')}
              color="primary"
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircle />}
              disabled={isSubmitting || (data?.validationStatus && data.validationStatus !== 'PENDING')}
            >
              {formatMessage(intl, 'merankabandi', 'validation.dialog.validate')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelConfirmation}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {formatMessage(
            intl,
            'merankabandi',
            confirmAction === 'VALIDATED' ? 'validation.confirm.validate.title' : 'validation.confirm.reject.title',
          )}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {formatMessage(
              intl,
              'merankabandi',
              confirmAction === 'VALIDATED' ? 'validation.confirm.validate.message' : 'validation.confirm.reject.message',
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirmation}>
            {formatMessage(intl, 'merankabandi', 'validation.confirm.cancel')}
          </Button>
          <Button
            onClick={handleConfirmValidation}
            color="primary"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={20} />}
          >
            {formatMessage(intl, 'merankabandi', 'validation.confirm.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ValidationDialog;
