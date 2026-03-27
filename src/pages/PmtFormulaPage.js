import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/styles';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  Form,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';
import {
  clearPmtFormula,
  createPmtFormula,
  deletePmtFormula,
  fetchPmtFormula,
  updatePmtFormula,
  ACTION_TYPE
} from '../actions';
import {
  MODULE_NAME,
  RIGHT_BENEFIT_PLAN_CREATE,
  RIGHT_BENEFIT_PLAN_SEARCH,
} from '../constants';
import PmtFormulaForm from '../components/pmt/PmtFormulaForm';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
}));

function PmtFormulaPage({
  clearPmtFormula,
  createPmtFormula,
  deletePmtFormula,
  updatePmtFormula,
  formulaId,
  fetchPmtFormula,
  rights,
  confirmed,
  submittingMutation,
  mutation,
  pmtFormula,
  coreConfirm,
  clearConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [editedFormula, setEditedFormula] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();

  const back = () => history.goBack();

  useEffect(() => {
    if (formulaId) {
      fetchPmtFormula([`id: "${formulaId}"`]);
    }
  }, [formulaId]);

  useEffect(() => {
    if (confirmed) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.DELETE_PMT_FORMULA) {
        back();
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => setEditedFormula(pmtFormula), [pmtFormula]);

  useEffect(() => () => clearPmtFormula(), []);

  const mandatoryFieldsEmpty = () => {
    if (editedFormula?.name) return false;
    return true;
  };

  const canSave = () => !mandatoryFieldsEmpty();

  const handleSave = () => {
    const label = { name: editedFormula?.name || '' };
    if (pmtFormula?.id) {
      updatePmtFormula(
        editedFormula,
        formatMessageWithValues('pmtFormula.mutation.updateLabel', label),
      );
    } else {
      createPmtFormula(
        editedFormula,
        formatMessageWithValues('pmtFormula.mutation.createLabel', label),
      );
    }
  };

  const deleteFormulaCallback = () => deletePmtFormula(
    pmtFormula,
    formatMessageWithValues('pmtFormula.mutation.deleteLabel', { name: pmtFormula?.name }),
  );

  const openDeleteConfirmDialog = () => {
    setConfirmedAction(() => deleteFormulaCallback);
    coreConfirm(
      formatMessageWithValues('pmtFormula.delete.confirm.title', { name: pmtFormula?.name }),
      formatMessage('pmtFormula.delete.confirm.message'),
    );
  };

  const actions = [
    !!formulaId && {
      doIt: openDeleteConfirmDialog,
      icon: <DeleteIcon />,
      tooltip: formatMessage('tooltip.delete'),
    },
  ];

  const canViewPage = formulaId
    ? rights.includes(RIGHT_BENEFIT_PLAN_SEARCH)
    : rights.includes(RIGHT_BENEFIT_PLAN_CREATE);

  if (!canViewPage) {
    return (
      <div className={classes.page}>
        <h3>{formatMessage('pmtFormula.noPermission')}</h3>
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <Form
        module={MODULE_NAME}
        title={formatMessageWithValues('pmtFormula.page.detailTitle', { name: editedFormula?.name || '' })}
        titleParams={{ name: editedFormula?.name || '' }}
        openDirty
        edited={editedFormula}
        onEditedChanged={setEditedFormula}
        back={back}
        mandatoryFieldsEmpty={mandatoryFieldsEmpty}
        canSave={canSave}
        save={handleSave}
        HeadPanel={PmtFormulaForm}
        rights={rights}
        actions={actions}
        setConfirmedAction={setConfirmedAction}
        saveTooltip={formatMessage('tooltip.save')}
      />
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  clearPmtFormula,
  createPmtFormula,
  deletePmtFormula,
  updatePmtFormula,
  fetchPmtFormula,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

const mapStateToProps = (state, props) => ({
  formulaId: props.match.params.formula_id,
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.merankabandi.submittingMutation,
  mutation: state.merankabandi.mutation,
  pmtFormula: state.merankabandi.pmtFormula,
});

export default connect(mapStateToProps, mapDispatchToProps)(PmtFormulaPage);
