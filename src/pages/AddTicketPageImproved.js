/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-vars */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Grid, Paper, Typography, Divider, IconButton, FormControlLabel, Checkbox, 
  Select, MenuItem, FormControl, InputLabel, Stepper, Step, StepLabel, 
  Button, Collapse, Card, CardContent, Box, Chip, TextField, Tooltip,
} from '@material-ui/core';
import { 
  Save, ArrowBack, ArrowForward, Person, LocationOn, 
  Category, Phone, Assignment, CheckCircle, ExpandMore, ExpandLess,
} from '@material-ui/icons';
import {
  TextInput, NumberInput, journalize, PublishedComponent, FormattedMessage, formatMessage,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { createTicket } from '../grievance-actions';
import GrievantTypePicker from '../pickers/GrievantTypePicker';
import CascadingCategoryPicker from '../components/grievance/CascadingCategoryPicker';

const MODULE_NAME = 'grievanceSocialProtection';

const styles = (theme) => ({
  paper: {
    ...theme.paper.paper,
    margin: theme.spacing(2),
  },
  pageTitle: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    marginBottom: theme.spacing(2),
  },
  section: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  sectionIcon: {
    marginRight: theme.spacing(1),
  },
  item: {
    marginBottom: theme.spacing(2),
  },
  requiredField: {
    '& label::after': {
      content: '" *"',
      color: theme.palette.error.main,
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
  },
  submitButton: {
    marginLeft: theme.spacing(1),
  },
  statusChip: {
    marginLeft: theme.spacing(2),
  },
  helpText: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
  conditionalSection: {
    backgroundColor: theme.palette.action.hover,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
  },
});

const STEPS = [
  'step.reporterInformation',
  'step.locationDetails',
  'step.complaintDetails',
  'step.additionalInformation',
  'step.reviewSubmit',
];

class AddTicketPageImproved extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0,
      stateEdited: {
        caseType: 'cas_de_r_clamation',
        isBeneficiary: false,
        isAnonymous: false,
        isBatwa: false,
        isProjectRelated: true,
        isResolved: false,
        status: 'OPEN',
        priority: 'MEDIUM',
      },
      grievantType: null,
      benefitPlan: null,
      isSaved: false,
      expandedSections: {
        reporter: true,
        location: true,
        complaint: true,
        receiver: false,
      },
      validationErrors: {},
    };
  }

  handleNext = () => {
    const { activeStep } = this.state;
    if (this.validateStep(activeStep)) {
      this.setState({ activeStep: activeStep + 1 });
    }
  };

  handleBack = () => {
    const { activeStep } = this.state;
    this.setState({ activeStep: activeStep - 1 });
  };

  validateStep = (step) => {
    const { stateEdited } = this.state;
    const errors = {};
    const req = (key) => <FormattedMessage module={MODULE_NAME} id={`ticket.validation.${key}Required`} />;

    switch (step) {
      case 0: // Reporter Information
        if (!this.state.grievantType) errors.grievantType = req('grievantType');
        if (!stateEdited.isAnonymous) {
          if (!stateEdited.reporterName) errors.reporterName = req('reporterName');
          if (!stateEdited.gender) errors.gender = req('gender');
          if (!stateEdited.reporterPhone) errors.reporterPhone = req('reporterPhone');
          if (!stateEdited.cniNumber) errors.cniNumber = req('cniNumber');
        }
        break;
      case 1: // Location
        if (!stateEdited.province) errors.province = req('province');
        if (!stateEdited.commune) errors.commune = req('commune');
        if (!stateEdited.colline) errors.colline = req('colline');
        break;
      case 2: // Complaint Details
        if (stateEdited.caseType === 'cas_de_r_clamation' && !stateEdited.category) errors.category = req('category');
        if (stateEdited.caseType === 'cas_de_remplacement') {
          if (!stateEdited.replacementMotif) errors.replacementMotif = req('replacementMotif');
          if (!stateEdited.replacedSocialId) errors.replacedSocialId = req('replacedSocialId');
          if (!stateEdited.newNom) errors.newNom = req('newNom');
          if (!stateEdited.newPrenom) errors.newPrenom = req('newPrenom');
        }
        if (stateEdited.caseType === 'cas_de_suppression__retrait_du_programme') {
          if (!stateEdited.suppressionMotif) errors.suppressionMotif = req('suppressionMotif');
        }
        if (!stateEdited.description) errors.description = req('description');
        if (!stateEdited.channel) errors.channel = req('channel');
        if (!stateEdited.dateOfIncident) errors.dateOfIncident = req('dateOfIncident');
        break;
      case 3: // Receiver/Collector Information
        if (!stateEdited.receiverName) errors.receiverName = req('receiverName');
        if (!stateEdited.receiverFunction) errors.receiverFunction = req('receiverFunction');
        if (!stateEdited.receiverPhone) errors.receiverPhone = req('receiverPhone');
        break;
      default:
        break;
    }

    this.setState({ validationErrors: errors });
    return Object.keys(errors).length === 0;
  };

  toggleSection = (section) => {
    this.setState((prevState) => ({
      expandedSections: {
        ...prevState.expandedSections,
        [section]: !prevState.expandedSections[section],
      },
    }));
  };

  updateAttribute = (k, v) => {
    this.setState((state) => ({
      stateEdited: { ...state.stateEdited, [k]: v },
      isSaved: false,
    }));
  };

  updateBenefitPlan = (k, v) => {
    this.setState({ benefitPlan: v });
  };

  updateGrievantType = (v) => {
    this.setState({ grievantType: v });
  };

  buildJsonExt = (edited) => {
    const category = edited.category || '';
    // The main category (first part before >) determines sensitivity
    const mainCategory = category.split(' > ')[0];

    // Auto-derive flags from category — matches module config sensitivity levels
    const sensitiveCategories = ['violence_vbg', 'corruption', 'accident_negligence', 'discrimination_ethnie_religion', 'maladie_mentale'];
    const specialCategories = ['erreur_exclusion', 'erreur_inclusion'];
    const isSensitive = sensitiveCategories.includes(mainCategory);
    const isSpecial = specialCategories.includes(mainCategory);

    // Auto-set flags on the ticket
    if (isSensitive && edited.flags !== 'SENSITIVE') edited.flags = 'SENSITIVE';
    else if (isSpecial && edited.flags !== 'SPECIAL') edited.flags = 'SPECIAL';
    else if (!isSensitive && !isSpecial) edited.flags = null;

    const caseType = edited.caseType || 'cas_de_r_clamation';

    let reclamationType = 'cas_non_sensibles';
    if (isSensitive) reclamationType = 'cas_sensibles';
    else if (isSpecial) reclamationType = 'cas_sp_ciaux';

    const categories = category ? [category.split(' > ').pop()] : [];

    const ext = {
      form_version: 'ui_v1',
      case_type: caseType,
      reporter: {
        is_anonymous: edited.isAnonymous || false,
        name: edited.reporterName || '',
        phone: edited.reporterPhone || '',
        gender: edited.gender || '',
        is_batwa: edited.isBatwa || false,
      },
      categorization: {
        reclamation_type: reclamationType,
        sensitive_categories: isSensitive ? categories : [],
        special_categories: isSpecial ? categories : [],
        non_sensitive_categories: (!isSensitive && !isSpecial) ? categories : [],
      },
      location: {
        province: edited.province?.name || '',
        province_code: edited.province?.code || '',
        commune: edited.commune?.name || '',
        commune_code: edited.commune?.code || '',
        colline: edited.colline?.name || '',
        colline_code: edited.colline?.code || '',
      },
    };

    // Add replacement data if case type is replacement
    if (caseType === 'cas_de_remplacement') {
      ext.replacement = {
        motif: edited.replacementMotif || '',
        replaced_social_id: edited.replacedSocialId || '',
        new_recipient: {
          nom: edited.newNom || '',
          prenom: edited.newPrenom || '',
          sexe: edited.newSexe || '',
        },
      };
      // Set category to uncategorized for replacements
      edited.category = 'uncategorized';
    }

    // Add suppression data if case type is suppression
    if (caseType === 'cas_de_suppression__retrait_du_programme') {
      ext.suppression = {
        motif: edited.suppressionMotif || '',
      };
      edited.category = 'uncategorized';
    }

    return ext;
  };

  save = () => {
    if (this.validateStep(this.state.activeStep)) {
      const edited = this.state.stateEdited;
      // Auto-generate title: colline-date (matching KoBo pattern)
      const collineName = edited.colline?.name || '';
      const dateStr = edited.dateOfIncident || new Date().toISOString().split('T')[0];
      edited.title = `${collineName}-${dateStr}`;

      // Build jsonExt (this also auto-sets flags from category)
      const jsonExt = this.buildJsonExt(edited);

      const ticketData = {
        ...edited,
        colline: collineName,
        jsonExt: JSON.stringify(jsonExt),
      };
      this.props.createTicket(
        ticketData,
        this.props.grievanceConfig,
        <FormattedMessage module={MODULE_NAME} id="ticket.created" values={{ title: edited.title }} />,
      );
      this.setState({ isSaved: true });
    }
  };

  renderReporterSection = () => {
    const { classes } = this.props;
    const { stateEdited, grievantType, benefitPlan, isSaved, expandedSections, validationErrors } = this.state;

    return (
      <Card className={classes.section}>
        <CardContent>
          <div 
            className={classes.sectionTitle}
            onClick={() => this.toggleSection('reporter')}
          >
            <Person className={classes.sectionIcon} />
            <Typography variant="h6">
              <FormattedMessage module={MODULE_NAME} id="ticket.reporterInformation" />
            </Typography>
            {expandedSections.reporter ? <ExpandLess /> : <ExpandMore />}
          </div>
          
          <Collapse in={expandedSections.reporter}>
            <Grid container spacing={2}>
              {/* Reporter Type */}
              <Grid item xs={12} md={4}>
                <GrievantTypePicker
                  value={grievantType}
                  onChange={this.updateGrievantType}
                  readOnly={isSaved}
                  required
                  withNull
                  withLabel
                  error={!!validationErrors.grievantType}
                />
                {validationErrors.grievantType && <Typography variant="caption" color="error">{validationErrors.grievantType}</Typography>}
              </Grid>

              {/* Anonymous Complaint */}
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.isAnonymous}
                      onChange={(e) => this.updateAttribute('isAnonymous', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.isAnonymous" />}
                />
              </Grid>

              {/* Is Beneficiary */}
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.isBeneficiary}
                      onChange={(e) => this.updateAttribute('isBeneficiary', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.isBeneficiary" />}
                />
              </Grid>

              {/* Reporter Name */}
              {!stateEdited.isAnonymous && (
                <Grid item xs={12} md={6}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.reporterName"
                    value={stateEdited.reporterName}
                    onChange={(v) => this.updateAttribute('reporterName', v)}
                    readOnly={isSaved}
                    required
                    error={!!validationErrors.reporterName}
                  />
                </Grid>
              )}

              {/* Phone */}
              {!stateEdited.isAnonymous && (
              <Grid item xs={12} md={6}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.reporterPhone"
                  value={stateEdited.reporterPhone}
                  onChange={(v) => this.updateAttribute('reporterPhone', v)}
                  readOnly={isSaved}
                  required
                  error={!!validationErrors.reporterPhone}
                />
              </Grid>
              )}

              {/* Gender */}
              {!stateEdited.isAnonymous && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required error={!!validationErrors.gender}>
                  <InputLabel>
                    <FormattedMessage module={MODULE_NAME} id="ticket.gender" />
                  </InputLabel>
                  <Select
                    value={stateEdited.gender || ''}
                    onChange={(e) => this.updateAttribute('gender', e.target.value)}
                    disabled={isSaved}
                  >
                    <MenuItem value="M">
                      <FormattedMessage module={MODULE_NAME} id="ticket.gender.male" />
                    </MenuItem>
                    <MenuItem value="F">
                      <FormattedMessage module={MODULE_NAME} id="ticket.gender.female" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              )}

              {/* CNI Number */}
              {!stateEdited.isAnonymous && (
              <Grid item xs={12} md={4}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.cniNumber"
                  value={stateEdited.cniNumber}
                  onChange={(v) => this.updateAttribute('cniNumber', v)}
                  readOnly={isSaved}
                  required
                  error={!!validationErrors.cniNumber}
                />
              </Grid>
              )}

              {/* Is Batwa */}
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.isBatwa}
                      onChange={(e) => this.updateAttribute('isBatwa', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.isBatwa" />}
                />
              </Grid>

              {/* Beneficiary Type if applicable */}
              {stateEdited.isBeneficiary && (
                <Grid item xs={12} md={6}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.beneficiaryType"
                    value={stateEdited.beneficiaryType}
                    onChange={(v) => this.updateAttribute('beneficiaryType', v)}
                    readOnly={isSaved}
                  />
                </Grid>
              )}

              {/* Non-beneficiary details */}
              {!stateEdited.isBeneficiary && (
                <Grid item xs={12}>
                  <TextInput
                    module={MODULE_NAME}
                    label="ticket.nonBeneficiaryDetails"
                    value={stateEdited.nonBeneficiaryDetails}
                    onChange={(v) => this.updateAttribute('nonBeneficiaryDetails', v)}
                    readOnly={isSaved}
                    multiline
                    rows={2}
                  />
                </Grid>
              )}
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  onLocationChange = (level, location) => {
    // Update the selected location at this level and clear lower levels
    const updates = {};
    if (level === 'province') {
      updates.province = location;
      updates.commune = null;
      updates.colline = null;
    } else if (level === 'commune') {
      updates.commune = location;
      updates.colline = null;
    } else if (level === 'colline') {
      updates.colline = location;
    }
    this.setState((state) => ({
      stateEdited: { ...state.stateEdited, ...updates },
      isSaved: false,
    }));
  };

  renderLocationSection = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved, expandedSections, validationErrors } = this.state;

    return (
      <Card className={classes.section}>
        <CardContent>
          <div
            className={classes.sectionTitle}
            onClick={() => this.toggleSection('location')}
          >
            <LocationOn className={classes.sectionIcon} />
            <Typography variant="h6">
              <FormattedMessage module={MODULE_NAME} id="ticket.locationInformation" />
            </Typography>
            {expandedSections.location ? <ExpandLess /> : <ExpandMore />}
          </div>

          <Collapse in={expandedSections.location}>
            <Grid container spacing={2}>
              {/* Province (type D) */}
              <Grid item xs={12} md={4}>
                <PublishedComponent
                  pubRef="location.LocationPicker"
                  locationLevel={0}
                  value={stateEdited.province}
                  onChange={(v) => this.onLocationChange('province', v)}
                  readOnly={isSaved}
                  withLabel
                  required
                  label={formatMessage(this.props.intl, MODULE_NAME, 'ticket.province')}
                />
                {validationErrors.province && <Typography variant="caption" color="error">{validationErrors.province}</Typography>}
              </Grid>

              {/* Commune (type W) */}
              <Grid item xs={12} md={4}>
                <PublishedComponent
                  pubRef="location.LocationPicker"
                  locationLevel={1}
                  parentLocation={stateEdited.province}
                  value={stateEdited.commune}
                  onChange={(v) => this.onLocationChange('commune', v)}
                  readOnly={isSaved || !stateEdited.province}
                  withLabel
                  required
                  label={formatMessage(this.props.intl, MODULE_NAME, 'ticket.commune')}
                />
                {validationErrors.commune && <Typography variant="caption" color="error">{validationErrors.commune}</Typography>}
              </Grid>

              {/* Colline (type V) */}
              <Grid item xs={12} md={4}>
                <PublishedComponent
                  pubRef="location.LocationPicker"
                  locationLevel={2}
                  parentLocation={stateEdited.commune}
                  value={stateEdited.colline}
                  onChange={(v) => this.onLocationChange('colline', v)}
                  readOnly={isSaved || !stateEdited.commune}
                  withLabel
                  required
                  label={formatMessage(this.props.intl, MODULE_NAME, 'ticket.colline')}
                />
                {validationErrors.colline && <Typography variant="caption" color="error">{validationErrors.colline}</Typography>}
              </Grid>

            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  renderComplaintSection = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved, expandedSections, validationErrors } = this.state;

    return (
      <Card className={classes.section}>
        <CardContent>
          <div 
            className={classes.sectionTitle}
            onClick={() => this.toggleSection('complaint')}
          >
            <Assignment className={classes.sectionIcon} />
            <Typography variant="h6">
              <FormattedMessage module={MODULE_NAME} id="ticket.complaintDetails" />
            </Typography>
            {expandedSections.complaint ? <ExpandLess /> : <ExpandMore />}
          </div>
          
          <Collapse in={expandedSections.complaint}>
            <Grid container spacing={2}>
              {/* Case Type — matches KoBo "Quel est le type de cas?" */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>
                    <FormattedMessage module={MODULE_NAME} id="ticket.caseType" />
                  </InputLabel>
                  <Select
                    value={stateEdited.caseType || 'cas_de_r_clamation'}
                    onChange={(e) => {
                      this.updateAttribute('caseType', e.target.value);
                      // Reset category when switching case type
                      if (e.target.value !== 'cas_de_r_clamation') {
                        this.updateAttribute('category', 'uncategorized');
                      }
                    }}
                    disabled={isSaved}
                  >
                    <MenuItem value="cas_de_r_clamation">
                      <FormattedMessage module={MODULE_NAME} id="ticket.caseType.reclamation" />
                    </MenuItem>
                    <MenuItem value="cas_de_remplacement">
                      <FormattedMessage module={MODULE_NAME} id="ticket.caseType.replacement" />
                    </MenuItem>
                    <MenuItem value="cas_de_suppression__retrait_du_programme">
                      <FormattedMessage module={MODULE_NAME} id="ticket.caseType.suppression" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Category — only for réclamation case type */}
              {stateEdited.caseType === 'cas_de_r_clamation' && (
              <Grid item xs={12} md={6}>
                <PublishedComponent
                  pubRef="grievanceSocialProtection.CategoryPicker"
                  value={stateEdited.category || ''}
                  onChange={(v) => this.updateAttribute('category', v || '')}
                  readOnly={isSaved}
                  required
                  label={formatMessage(this.props.intl, MODULE_NAME, 'ticket.category')}
                />
                {validationErrors.category && <Typography variant="caption" color="error">{validationErrors.category}</Typography>}
              </Grid>
              )}

              {/* Replacement motif — only for replacement case type */}
              {stateEdited.caseType === 'cas_de_remplacement' && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!validationErrors.replacementMotif}>
                    <InputLabel><FormattedMessage module={MODULE_NAME} id="ticket.replacementMotif" /></InputLabel>
                    <Select
                      value={stateEdited.replacementMotif || ''}
                      onChange={(e) => this.updateAttribute('replacementMotif', e.target.value)}
                      disabled={isSaved}
                    >
                      <MenuItem value="d_c_s_du_b_n_ficiaire"><FormattedMessage module={MODULE_NAME} id="ticket.replacementMotif.deces" /></MenuItem>
                      <MenuItem value="d_m_nagement_du_b_n_ficiaire"><FormattedMessage module={MODULE_NAME} id="ticket.replacementMotif.emigration" /></MenuItem>
                      <MenuItem value="remariage_du_b_n_ficiaire"><FormattedMessage module={MODULE_NAME} id="ticket.replacementMotif.remariage" /></MenuItem>
                      <MenuItem value="perte_du_statut_de_b_n_ficiaire"><FormattedMessage module={MODULE_NAME} id="ticket.replacementMotif.refus" /></MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextInput module={MODULE_NAME} label="ticket.replacedSocialId"
                    value={stateEdited.replacedSocialId} required
                    onChange={(v) => this.updateAttribute('replacedSocialId', v)}
                    readOnly={isSaved} error={!!validationErrors.replacedSocialId} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextInput module={MODULE_NAME} label="ticket.newRecipientNom"
                    value={stateEdited.newNom} required
                    onChange={(v) => this.updateAttribute('newNom', v)} readOnly={isSaved} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextInput module={MODULE_NAME} label="ticket.newRecipientPrenom"
                    value={stateEdited.newPrenom} required
                    onChange={(v) => this.updateAttribute('newPrenom', v)} readOnly={isSaved} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel><FormattedMessage module={MODULE_NAME} id="ticket.newRecipientSexe" /></InputLabel>
                    <Select value={stateEdited.newSexe || ''} onChange={(e) => this.updateAttribute('newSexe', e.target.value)} disabled={isSaved}>
                      <MenuItem value="M"><FormattedMessage module={MODULE_NAME} id="ticket.gender.male" /></MenuItem>
                      <MenuItem value="F"><FormattedMessage module={MODULE_NAME} id="ticket.gender.female" /></MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
              )}

              {/* Suppression motif — only for suppression case type */}
              {stateEdited.caseType === 'cas_de_suppression__retrait_du_programme' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!validationErrors.suppressionMotif}>
                  <InputLabel><FormattedMessage module={MODULE_NAME} id="ticket.suppressionMotif" /></InputLabel>
                  <Select
                    value={stateEdited.suppressionMotif || ''}
                    onChange={(e) => this.updateAttribute('suppressionMotif', e.target.value)}
                    disabled={isSaved}
                  >
                    <MenuItem value="erreur_d_inclusion"><FormattedMessage module={MODULE_NAME} id="ticket.suppressionMotif.inclusion" /></MenuItem>
                    <MenuItem value="demande_volontaire_du_b_n_ficiaire"><FormattedMessage module={MODULE_NAME} id="ticket.suppressionMotif.volontaire" /></MenuItem>
                    <MenuItem value="double_inscription_d_tect_e"><FormattedMessage module={MODULE_NAME} id="ticket.suppressionMotif.double" /></MenuItem>
                    <MenuItem value="d_c_s_sans_demande_de_remplacement"><FormattedMessage module={MODULE_NAME} id="ticket.suppressionMotif.deces" /></MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              )}

              {/* Channel */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!validationErrors.channel}>
                  <InputLabel>
                    <FormattedMessage module={MODULE_NAME} id="ticket.channel" />
                  </InputLabel>
                  <Select
                    value={stateEdited.channel || ''}
                    onChange={(e) => this.updateAttribute('channel', e.target.value)}
                    disabled={isSaved}
                  >
                    <MenuItem value="telephone">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.phone" />
                    </MenuItem>
                    <MenuItem value="sms">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.sms" />
                    </MenuItem>
                    <MenuItem value="en_personne">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.inPerson" />
                    </MenuItem>
                    <MenuItem value="courrier_simple">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.regularMail" />
                    </MenuItem>
                    <MenuItem value="courrier_electronique">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.email" />
                    </MenuItem>
                    <MenuItem value="ligne_verte">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.hotline" />
                    </MenuItem>
                    <MenuItem value="boite_suggestion">
                      <FormattedMessage module={MODULE_NAME} id="ticket.channel.suggestionBox" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Date of Incident */}
              <Grid item xs={12} md={6}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  module={MODULE_NAME}
                  label="ticket.dateOfIncident"
                  value={stateEdited.dateOfIncident}
                  onChange={(v) => this.updateAttribute('dateOfIncident', v)}
                  readOnly={isSaved}
                  required
                />
                {validationErrors.dateOfIncident && <Typography variant="caption" color="error">{validationErrors.dateOfIncident}</Typography>}
              </Grid>

              {/* Priority */}
              <Grid item xs={12} md={6}>
                <PublishedComponent
                  pubRef="grievanceSocialProtection.TicketPriorityPicker"
                  value={stateEdited.priority}
                  onChange={(v) => this.updateAttribute('priority', v)}
                  readOnly={isSaved}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.description"
                  value={stateEdited.description}
                  onChange={(v) => this.updateAttribute('description', v)}
                  readOnly={isSaved}
                  required
                  error={!!validationErrors.description}
                  multiline
                  rows={4}
                />
              </Grid>

              {/* Conditional Fields based on Category */}
              {this.renderConditionalFields()}
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  renderConditionalFields = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved } = this.state;

    if (!stateEdited.category) return null;

    const category = stateEdited.category.split(' ')[0];

    // VBG specific fields
    if (category === 'violence_vbg') {
      return (
        <Grid item xs={12}>
          <Box className={classes.conditionalSection}>
            <Typography variant="subtitle2" gutterBottom>
              <FormattedMessage module={MODULE_NAME} id="ticket.vbgDetails" />
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.violHospital}
                      onChange={(e) => this.updateAttribute('violHospital', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.violHospital" />}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.violComplaint}
                      onChange={(e) => this.updateAttribute('violComplaint', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.violComplaint" />}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stateEdited.violSupport}
                      onChange={(e) => this.updateAttribute('violSupport', e.target.checked)}
                      disabled={isSaved}
                    />
                  }
                  label={<FormattedMessage module={MODULE_NAME} id="ticket.violSupport" />}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      );
    }

    return null;
  };

  renderReceiverSection = () => {
    const { classes } = this.props;
    const { stateEdited, isSaved, expandedSections, validationErrors } = this.state;

    return (
      <Card className={classes.section}>
        <CardContent>
          <div 
            className={classes.sectionTitle}
            onClick={() => this.toggleSection('receiver')}
          >
            <Phone className={classes.sectionIcon} />
            <Typography variant="h6">
              <FormattedMessage module={MODULE_NAME} id="ticket.receiverInformation" />
            </Typography>
            {expandedSections.receiver ? <ExpandLess /> : <ExpandMore />}
          </div>
          
          <Collapse in={expandedSections.receiver}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.receiverName"
                  value={stateEdited.receiverName}
                  onChange={(v) => this.updateAttribute('receiverName', v)}
                  readOnly={isSaved}
                  required
                  error={!!validationErrors.receiverName}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.receiverFunction"
                  value={stateEdited.receiverFunction}
                  onChange={(v) => this.updateAttribute('receiverFunction', v)}
                  readOnly={isSaved}
                  required
                  error={!!validationErrors.receiverFunction}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextInput
                  module={MODULE_NAME}
                  label="ticket.receiverPhone"
                  value={stateEdited.receiverPhone}
                  onChange={(v) => this.updateAttribute('receiverPhone', v)}
                  readOnly={isSaved}
                  required
                  error={!!validationErrors.receiverPhone}
                />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  getChannelLabel = (channelValue) => {
    const { intl } = this.props;
    const channelMap = {
      'telephone': 'ticket.channel.phone',
      'sms': 'ticket.channel.sms',
      'en_personne': 'ticket.channel.inPerson',
      'courrier_simple': 'ticket.channel.regularMail',
      'courrier_electronique': 'ticket.channel.email',
      'ligne_verte': 'ticket.channel.hotline',
      'boite_suggestion': 'ticket.channel.suggestionBox',
    };
    const translationKey = channelMap[channelValue];
    return translationKey ? formatMessage(intl, MODULE_NAME, translationKey) : channelValue;
  };

  renderSummary = () => {
    const { classes } = this.props;
    const { stateEdited } = this.state;

    return (
      <Card className={classes.section}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FormattedMessage module={MODULE_NAME} id="ticket.summary" />
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">
                <FormattedMessage module={MODULE_NAME} id="ticket.reporterInformation" />
              </Typography>
              <Box mb={2}>
                {stateEdited.isAnonymous && (
                  <Chip label={<FormattedMessage module={MODULE_NAME} id="ticket.chip.anonymous" />} size="small" color="default" />
                )}
                {stateEdited.isBeneficiary && (
                  <Chip label={<FormattedMessage module={MODULE_NAME} id="ticket.chip.beneficiary" />} size="small" color="primary" />
                )}
                {stateEdited.isBatwa && (
                  <Chip label={<FormattedMessage module={MODULE_NAME} id="ticket.chip.batwa" />} size="small" color="secondary" />
                )}
              </Box>
              {stateEdited.reporterName && (
                <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.name" />: {stateEdited.reporterName}</Typography>
              )}
              {stateEdited.reporterPhone && (
                <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.phone" />: {stateEdited.reporterPhone}</Typography>
              )}
              {stateEdited.cniNumber && (
                <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.cni" />: {stateEdited.cniNumber}</Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">
                <FormattedMessage module={MODULE_NAME} id="ticket.complaintDetails" />
              </Typography>
              <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.title" />: {stateEdited.title}</Typography>
              <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.category" />: {stateEdited.category}</Typography>
              <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.channel" />: {this.getChannelLabel(stateEdited.channel)}</Typography>
              <Typography variant="body2"><FormattedMessage module={MODULE_NAME} id="ticket.summary.priority" />: {stateEdited.priority}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  render() {
    const { classes, submittingMutation, mutation } = this.props;
    const { activeStep, stateEdited, isSaved } = this.state;

    return (
      <div className={classes.page}>
        <Paper className={classes.paper}>
          <div className={classes.pageTitle}>
            <Typography variant="h4" style={{ color: 'inherit' }}>
              <FormattedMessage module={MODULE_NAME} id="ticket.newTicket" />
            </Typography>
          </div>

          <Box p={3}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} className={classes.stepper}>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    <FormattedMessage module={MODULE_NAME} id={`ticket.${label}`} />
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Content based on active step */}
            {activeStep === 0 && this.renderReporterSection()}
            {activeStep === 1 && this.renderLocationSection()}
            {activeStep === 2 && this.renderComplaintSection()}
            {activeStep === 3 && this.renderReceiverSection()}
            {activeStep === 4 && this.renderSummary()}

            {/* Navigation buttons */}
            <div className={classes.buttons}>
              <Button
                disabled={activeStep === 0}
                onClick={this.handleBack}
                startIcon={<ArrowBack />}
              >
                <FormattedMessage module={MODULE_NAME} id="ticket.back" />
              </Button>
              
              <div>
                {activeStep < STEPS.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.handleNext}
                    endIcon={<ArrowForward />}
                  >
                    <FormattedMessage module={MODULE_NAME} id="ticket.next" />
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.save}
                    disabled={
                      isSaved ||
                      !stateEdited.category ||
                      !stateEdited.description ||
                      !stateEdited.channel ||
                      !stateEdited.dateOfIncident ||
                      !stateEdited.province ||
                      !stateEdited.commune ||
                      !stateEdited.colline ||
                      !stateEdited.receiverName ||
                      (!stateEdited.isAnonymous && !stateEdited.reporterName)
                    }
                    startIcon={<Save />}
                    className={classes.submitButton}
                  >
                    <FormattedMessage module={MODULE_NAME} id="ticket.save" />
                  </Button>
                )}
                
                {isSaved && (
                  <Chip
                    icon={<CheckCircle />}
                    label={<FormattedMessage module={MODULE_NAME} id="ticket.chip.saved" />}
                    color="primary"
                    className={classes.statusChip}
                  />
                )}
              </div>
            </div>
          </Box>
        </Paper>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  submittingMutation: state.grievanceSocialProtection.submittingMutation,
  mutation: state.grievanceSocialProtection.mutation,
  grievanceConfig: state.grievanceSocialProtection.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ createTicket, journalize }, dispatch);

export default injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AddTicketPageImproved))));