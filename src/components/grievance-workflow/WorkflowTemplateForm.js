import React from 'react';
import { injectIntl } from 'react-intl';

import {
  Grid, FormControlLabel, Checkbox, MenuItem, Select, InputLabel, FormControl,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  FormPanel,
  withModulesManager,
  TextInput,
} from '@openimis/fe-core';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
});

// Cascading case type structure: group → subtypes
// Values match seed_workflow_templates.py case_type format
const CASE_TYPE_TREE = {
  remplacement: {
    label: 'Remplacement',
    subtypes: [
      { value: 'd_c_s_du_b_n_ficiaire', label: 'Décès du bénéficiaire' },
      { value: 'd_m_nagement_du_b_n_ficiaire', label: 'Émigration du bénéficiaire' },
      { value: 'remariage_du_b_n_ficiaire', label: 'Remariage du bénéficiaire' },
      { value: 'perte_du_statut_de_b_n_ficiaire', label: 'Refus de statut de bénéficiaire' },
    ],
  },
  suppression: {
    label: 'Suppression',
    subtypes: [
      { value: 'erreur_d_inclusion', label: "Erreur d'inclusion" },
      { value: 'demande_volontaire_du_b_n_ficiaire', label: 'Demande volontaire' },
      { value: 'double_inscription_d_tect_e', label: 'Double inscription' },
      { value: 'd_c_s_sans_demande_de_remplacement', label: 'Décès sans remplacement' },
    ],
  },
  'reclamation:sensible': {
    label: 'Réclamation — Cas sensible',
    subtypes: [
      { value: 'eas_hs__exploitation__abus_sexuel___harc', label: 'EAS/HS' },
      { value: 'pr_l_vements_de_fonds', label: 'Prélèvements de fonds' },
      { value: 'd_tournement_de_fonds___corruption', label: 'Détournement de fonds / Corruption' },
      { value: 'conflit_familial', label: 'Conflit familial' },
      { value: 'accident_grave_ou_n_gligence_professionn', label: 'Accident grave / Négligence' },
    ],
  },
  'reclamation:speciale': {
    label: 'Réclamation — Cas spécial',
    subtypes: [
      { value: 'erreur_d_inclusion_potentielle', label: "Erreur d'inclusion potentielle" },
      { value: 'cibl__mais_pas_collect', label: 'Ciblé mais pas collecté' },
      { value: 'cibl__et_collect', label: 'Ciblé et collecté' },
      { value: 'migration', label: 'Migration / Changement de localité' },
    ],
  },
  'reclamation:non_sensible': {
    label: 'Réclamation — Cas non sensible',
    subtypes: [
      { value: 'probl_me_de_paiement__non_r_ception__mon', label: 'Paiement — Non réception' },
      { value: 'probl_me_de_paiement__retard', label: 'Paiement — Retard' },
      { value: 'probl_me_de_paiement__montant', label: 'Paiement — Montant incorrect' },
      { value: 'carte_sim__bloqu_e__vol_e__perdue__etc', label: 'Carte SIM — Perdue/volée/bloquée' },
      { value: 'probl_mes_de_t_l_phone__vol__endommag__n', label: 'Téléphone — Perdu/volé/endommagé' },
      { value: 'probl_mes_de_t_l_phone__no_tm', label: 'Téléphone — Ne reçoit pas les TM' },
      { value: 'probl_mes_de_t_l_phone__mdp', label: 'Téléphone — Mot de passe oublié' },
      { value: 'probl_mes_de_compte_mobile_money__ecocas', label: 'Compte — Non activé' },
      { value: 'probl_mes_de_compte_mobile_money__bloque', label: 'Compte — Bloqué' },
      { value: 'incoh_rence_des_donn_es_personnelles__nu', label: 'Incohérence des données personnelles' },
      { value: 'demande_d_information', label: "Demande d'information et d'assistance" },
      { value: 'phone_reassignment', label: 'Réattribution de numéro de téléphone' },
    ],
  },
};

// Parse a caseType string like "remplacement:d_c_s_du_b_n_ficiaire" into { group, subtype }
function parseCaseType(caseType) {
  if (!caseType) return { group: '', subtype: '' };

  // Try each group key (longest first to match "reclamation:sensible" before "reclamation")
  const groupKeys = Object.keys(CASE_TYPE_TREE).sort((a, b) => b.length - a.length);
  for (const groupKey of groupKeys) {
    if (caseType.startsWith(groupKey + ':')) {
      return { group: groupKey, subtype: caseType.slice(groupKey.length + 1) };
    }
    if (caseType === groupKey) {
      return { group: groupKey, subtype: '' };
    }
  }
  return { group: '', subtype: '' };
}

// Build caseType string from group + subtype
function buildCaseType(group, subtype) {
  if (!group) return '';
  if (!subtype) return group;
  return `${group}:${subtype}`;
}

// Find human-readable label for a full caseType
function getCaseTypeLabel(caseType) {
  const { group, subtype } = parseCaseType(caseType);
  const groupInfo = CASE_TYPE_TREE[group];
  if (!groupInfo) return caseType;
  if (!subtype) return groupInfo.label;
  const subtypeInfo = groupInfo.subtypes.find((s) => s.value === subtype);
  return subtypeInfo ? `${groupInfo.label} — ${subtypeInfo.label}` : caseType;
}

class WorkflowTemplateForm extends FormPanel {
  handleGroupChange = (group) => {
    const { edited } = this.props;
    const { subtype } = parseCaseType(edited?.caseType);
    // Check if current subtype exists in new group
    const groupInfo = CASE_TYPE_TREE[group];
    const validSubtype = groupInfo?.subtypes.find((s) => s.value === subtype) ? subtype : '';
    this.updateAttribute('caseType', buildCaseType(group, validSubtype));
  };

  handleSubtypeChange = (subtype) => {
    const { edited } = this.props;
    const { group } = parseCaseType(edited?.caseType);
    this.updateAttribute('caseType', buildCaseType(group, subtype));
  };

  render() {
    const { edited, classes, readOnly, intl } = this.props;
    const template = { ...edited };
    const { group, subtype } = parseCaseType(template?.caseType);
    const groupInfo = CASE_TYPE_TREE[group];

    return (
      <Grid container className={classes.item}>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            module="merankabandi"
            label="workflow.template.name"
            required
            readOnly={readOnly}
            value={template?.name ?? ''}
            onChange={(name) => this.updateAttribute('name', name)}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            module="merankabandi"
            label="workflow.template.label"
            readOnly={readOnly}
            value={template?.label ?? ''}
            onChange={(label) => this.updateAttribute('label', label)}
          />
        </Grid>

        {/* Cascading case type: Group → Sub-type */}
        <Grid item xs={4} className={classes.item}>
          <FormControl fullWidth required>
            <InputLabel>
              {intl.formatMessage({ id: 'merankabandi.workflow.template.caseTypeGroup' })}
            </InputLabel>
            <Select
              value={group}
              onChange={(e) => this.handleGroupChange(e.target.value)}
              disabled={readOnly}
            >
              <MenuItem value="">
                <em>{intl.formatMessage({ id: 'merankabandi.workflow.filter.all' })}</em>
              </MenuItem>
              {Object.entries(CASE_TYPE_TREE).map(([key, info]) => (
                <MenuItem key={key} value={key}>{info.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <FormControl fullWidth required disabled={!group || readOnly}>
            <InputLabel>
              {intl.formatMessage({ id: 'merankabandi.workflow.template.caseTypeSubtype' })}
            </InputLabel>
            <Select
              value={subtype}
              onChange={(e) => this.handleSubtypeChange(e.target.value)}
              disabled={!group || readOnly}
            >
              <MenuItem value="">
                <em>{intl.formatMessage({ id: 'merankabandi.workflow.filter.all' })}</em>
              </MenuItem>
              {(groupInfo?.subtypes || []).map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4} className={classes.item}>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={template?.isActive ?? true}
                onChange={(e) => this.updateAttribute('isActive', e.target.checked)}
                disabled={readOnly}
              />
            }
            label={intl.formatMessage({ id: 'merankabandi.workflow.template.isActive' })}
          />
        </Grid>

        {/* Show resolved caseType as read-only for reference */}
        {template?.caseType && (
          <Grid item xs={12} className={classes.item}>
            <TextInput
              module="merankabandi"
              label="workflow.template.caseType"
              readOnly
              value={getCaseTypeLabel(template.caseType)}
            />
          </Grid>
        )}

        <Grid item xs={12} className={classes.item}>
          <TextInput
            module="merankabandi"
            label="workflow.template.description"
            readOnly={readOnly}
            value={template?.description ?? ''}
            onChange={(description) => this.updateAttribute('description', description)}
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(WorkflowTemplateForm))));
