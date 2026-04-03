import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import { IconButton, Tooltip, Chip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import {
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
  clearConfirm,
  coreConfirm,
  journalize,
} from '@openimis/fe-core';
import { fetchPmtFormulas, deletePmtFormula } from '../../actions';
import { MODULE_NAME, RIGHT_BENEFIT_PLAN_SEARCH, ROUTE_PMT_FORMULA } from '../../constants';

function PmtFormulaSearcher({
  fetchPmtFormulas,
  fetchingPmtFormulas,
  deletePmtFormula,
  pmtFormulas,
  coreConfirm,
  clearConfirm,
  pmtFormulasPageInfo,
  pmtFormulasTotalCount,
  confirmed,
  submittingMutation,
  mutation,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  const [formulaToDelete, setFormulaToDelete] = useState(null);
  const [deletedFormulaIds, setDeletedFormulaIds] = useState([]);
  const prevSubmittingMutationRef = useRef();

  const openDeleteConfirmDialog = () => {
    coreConfirm(
      formatMessage('pmtFormula.delete.confirm.title'),
      formatMessageWithValues('pmtFormula.delete.confirm.message', { name: formulaToDelete.name }),
    );
  };

  useEffect(() => formulaToDelete && openDeleteConfirmDialog(), [formulaToDelete]);

  useEffect(() => {
    if (formulaToDelete && confirmed) {
      deletePmtFormula(
        formulaToDelete,
        formatMessageWithValues('pmtFormula.mutation.deleteLabel', { name: formulaToDelete.name }),
      );
      setDeletedFormulaIds([...deletedFormulaIds, formulaToDelete.id]);
    }
    if (formulaToDelete && confirmed !== null) {
      setFormulaToDelete(null);
    }
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const headers = () => [
    'pmtFormula.name',
    'pmtFormula.description',
    'pmtFormula.isActive',
    '',
  ];

  const sorts = () => [
    ['name', true],
    ['description', false],
    ['isActive', true],
  ];

  const fetchData = (params) => fetchPmtFormulas(params);

  const rowIdentifier = (formula) => formula.id;

  const openFormula = (formula) => rights.includes(RIGHT_BENEFIT_PLAN_SEARCH) && history.push(
    `/${ROUTE_PMT_FORMULA}/${formula?.id}`,
  );

  const onDelete = (formula) => setFormulaToDelete(formula);

  const itemFormatters = () => [
    (formula) => formula.name,
    (formula) => formula.description || '-',
    (formula) => (
      <Chip
        label={formula.isActive ? formatMessage('pmtFormula.active') : formatMessage('pmtFormula.inactive')}
        color={formula.isActive ? 'primary' : 'default'}
        size="small"
      />
    ),
    (formula) => (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Tooltip title={formatMessage('tooltip.edit')}>
          <IconButton onClick={() => openFormula(formula)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={formatMessage('tooltip.delete')}>
          <IconButton
            onClick={() => onDelete(formula)}
            disabled={deletedFormulaIds.includes(formula.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>
    ),
  ];

  const onDoubleClick = (formula) => openFormula(formula);

  const isRowDisabled = (_, formula) => deletedFormulaIds.includes(formula.id);

  return (
    <Searcher
      module="merankabandi"
      fetch={fetchData}
      items={pmtFormulas}
      itemsPageInfo={pmtFormulasPageInfo}
      fetchedItems={!fetchingPmtFormulas}
      fetchingItems={fetchingPmtFormulas}
      tableTitle={formatMessageWithValues('pmtFormula.searcherResultsTitle', { count: pmtFormulasTotalCount ?? 0 })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowIdentifier={rowIdentifier}
      onDoubleClick={onDoubleClick}
      rowDisabled={isRowDisabled}
      rowLocked={isRowDisabled}
    />
  );
}

const mapStateToProps = (state) => ({
  pmtFormulas: state.merankabandi.pmtFormulas,
  pmtFormulasPageInfo: state.merankabandi.pmtFormulasPageInfo,
  fetchingPmtFormulas: state.merankabandi.fetchingPmtFormulas,
  pmtFormulasTotalCount: state.merankabandi.pmtFormulasTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.merankabandi.submittingMutation,
  mutation: state.merankabandi.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchPmtFormulas,
  deletePmtFormula,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PmtFormulaSearcher);
