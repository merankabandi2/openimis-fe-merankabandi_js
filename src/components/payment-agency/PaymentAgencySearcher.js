import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import { Grid, IconButton, Tooltip, Chip, FormControlLabel, Checkbox } from '@material-ui/core';
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
  TextInput,
  PublishedComponent,
} from '@openimis/fe-core';
import { fetchPaymentAgencies, deletePaymentAgency } from '../../actions';
import { MODULE_NAME, RIGHT_BENEFIT_PLAN_SEARCH, ROUTE_PAYMENT_AGENCY } from '../../constants';

function PaymentAgencySearcher({
  fetchPaymentAgencies,
  fetchingPaymentAgencies,
  deletePaymentAgency,
  paymentAgencies,
  coreConfirm,
  clearConfirm,
  paymentAgenciesPageInfo,
  paymentAgenciesTotalCount,
  confirmed,
  submittingMutation,
  mutation,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  const [agencyToDelete, setAgencyToDelete] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);
  const prevSubmittingMutationRef = useRef();

  const openDeleteConfirmDialog = () => {
    coreConfirm(
      formatMessage('paymentAgency.delete.confirm.title'),
      formatMessageWithValues('paymentAgency.delete.confirm.message', { name: agencyToDelete.name }),
    );
  };

  useEffect(() => agencyToDelete && openDeleteConfirmDialog(), [agencyToDelete]);

  useEffect(() => {
    if (agencyToDelete && confirmed) {
      deletePaymentAgency(
        agencyToDelete,
        formatMessageWithValues('paymentAgency.mutation.deleteLabel', { name: agencyToDelete.name }),
      );
      setDeletedIds([...deletedIds, agencyToDelete.id]);
    }
    if (agencyToDelete && confirmed !== null) {
      setAgencyToDelete(null);
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

  const PAYMENT_GATEWAY_OPTIONS = [
    { value: '', label: formatMessage('paymentAgency.filter.allGateways') },
    { value: 'lumicash', label: 'Lumicash' },
    { value: 'interbank', label: 'Interbank (IBB)' },
  ];

  const filtersToQueryParams = (state) => {
    const params = [];
    if (state.code) params.push(`code_Icontains: "${state.code}"`);
    if (state.name) params.push(`name_Icontains: "${state.name}"`);
    if (state.paymentGateway) params.push(`paymentGateway: "${state.paymentGateway}"`);
    if (state.isActive !== undefined && state.isActive !== null) {
      params.push(`isActive: ${state.isActive}`);
    }
    return params;
  };

  const headers = () => [
    'paymentAgency.code',
    'paymentAgency.name',
    'paymentAgency.paymentGateway',
    'paymentAgency.contactName',
    'paymentAgency.contactPhone',
    'paymentAgency.isActive',
    '',
  ];

  const sorts = () => [
    ['code', true],
    ['name', true],
    ['paymentGateway', true],
    ['contactName', false],
    ['contactPhone', false],
    ['isActive', true],
  ];

  const fetchData = (params) => fetchPaymentAgencies(params);
  const rowIdentifier = (agency) => agency.id;

  const openAgency = (agency) => rights.includes(RIGHT_BENEFIT_PLAN_SEARCH) && history.push(
    `/${ROUTE_PAYMENT_AGENCY}/${agency?.id}`,
  );

  const onDelete = (agency) => setAgencyToDelete(agency);

  const itemFormatters = () => [
    (agency) => agency.code,
    (agency) => agency.name,
    (agency) => agency.paymentGateway || '-',
    (agency) => agency.contactName || '-',
    (agency) => agency.contactPhone || '-',
    (agency) => (
      <Chip
        label={agency.isActive ? formatMessage('paymentAgency.active') : formatMessage('paymentAgency.inactive')}
        color={agency.isActive ? 'primary' : 'default'}
        size="small"
      />
    ),
    (agency) => (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Tooltip title={formatMessage('tooltip.edit')}>
          <IconButton onClick={() => openAgency(agency)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={formatMessage('tooltip.delete')}>
          <IconButton
            onClick={() => onDelete(agency)}
            disabled={deletedIds.includes(agency.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>
    ),
  ];

  const FilterPane = ({ filters, onChangeFilters }) => (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TextInput
          module={MODULE_NAME}
          label="paymentAgency.filter.code"
          value={filters?.code?.value || ''}
          onChange={(v) => onChangeFilters([{ id: 'code', value: v, filter: v ? `code_Icontains: "${v}"` : null }])}
        />
      </Grid>
      <Grid item xs={3}>
        <TextInput
          module={MODULE_NAME}
          label="paymentAgency.filter.name"
          value={filters?.name?.value || ''}
          onChange={(v) => onChangeFilters([{ id: 'name', value: v, filter: v ? `name_Icontains: "${v}"` : null }])}
        />
      </Grid>
      <Grid item xs={3}>
        <TextInput
          module={MODULE_NAME}
          label="paymentAgency.filter.paymentGateway"
          value={filters?.paymentGateway?.value || ''}
          onChange={(v) => onChangeFilters([{ id: 'paymentGateway', value: v, filter: v ? `paymentGateway_Icontains: "${v}"` : null }])}
        />
      </Grid>
      <Grid item xs={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters?.showInactive?.value || false}
              onChange={(e) => onChangeFilters([{
                id: 'showInactive',
                value: e.target.checked,
                filter: e.target.checked ? null : 'isActive: true',
              }])}
            />
          }
          label={formatMessage('paymentAgency.filter.showInactive')}
        />
      </Grid>
    </Grid>
  );

  return (
    <Searcher
      module="merankabandi"
      FilterPane={FilterPane}
      fetchingItems={fetchingPaymentAgencies}
      items={paymentAgencies}
      itemsPageInfo={paymentAgenciesPageInfo}
      fetch={fetchData}
      rowIdentifier={rowIdentifier}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      onDoubleClick={openAgency}
      tableTitle={formatMessageWithValues('paymentAgency.searcher.results', { totalCount: paymentAgenciesTotalCount })}
      rowsPerPageOptions={[10, 20, 50]}
      defaultPageSize={10}
      defaultFilters={{ showInactive: { value: false, filter: 'isActive: true' } }}
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingPaymentAgencies: state.merankabandi.fetchingPaymentAgencies,
  paymentAgencies: state.merankabandi.paymentAgencies,
  paymentAgenciesPageInfo: state.merankabandi.paymentAgenciesPageInfo,
  paymentAgenciesTotalCount: state.merankabandi.paymentAgenciesTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.merankabandi.submittingMutation,
  mutation: state.merankabandi.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchPaymentAgencies,
  deletePaymentAgency,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PaymentAgencySearcher);
