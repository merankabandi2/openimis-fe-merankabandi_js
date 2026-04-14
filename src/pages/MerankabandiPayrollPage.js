import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/styles';
import ReplayIcon from '@material-ui/icons/Replay';

import {
  Form,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
  useGraphqlQuery,
} from '@openimis/fe-core';
import {
  fetchPayroll,
  clearPayroll,
  createPayroll,
  retriggerPayroll,
  PAYROLL_STATUS,
} from '../payroll-actions';
import { fetchTask } from '../actions';
import { PAYROLL_FROM_FAILED_INVOICES_URL_PARAM, PAYROLL_MODULE_NAME } from '../constants';
import { mutationLabel, pageTitle } from '../utils/string-utils';
import MerankabandiPayrollHeadPanel from '../components/payroll/MerankabandiPayrollHeadPanel';
import MerankabandiPayrollTab from '../components/payroll/MerankabandiPayrollTab';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

const PAYROLL_CREATE_ACTION = 'PAYROLL_MUTATION_CREATE_PAYROLL';
const PAYROLL_DELETE_ACTION = 'PAYROLL_MUTATION_DELETE_PAYROLL';

function MerankabandiPayrollPage({
  statePayrollUuid,
  taskPayrollUuid,
  rights,
  user,
  confirmed,
  submittingMutation,
  mutation,
  payroll,
  task,
  fetchPayroll,
  fetchTask,
  createPayroll,
  retriggerPayroll,
  clearPayroll,
  clearConfirm,
  createPayrollFromFailedInvoices,
  journalize,
  benefitPlanId,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations(PAYROLL_MODULE_NAME, modulesManager);

  const [editedPayroll, setEditedPayroll] = useState({});
  const [payrollUuid, setPayrollUuid] = useState(null);
  const [isInTask, setIsInTask] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [isPayrollFromFailedInvoices, setIsPayrollFromFailedInvoices] = useState(false);
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const prevSubmittingMutationRef = useRef();

  const RIGHT_PAYROLL_CREATE = modulesManager.getRef('payroll.payrollCreateRight');

  const back = () => history.goBack();

  // Read query parameters for prefilling from geography page
  const queryParams = new URLSearchParams(history.location?.search || '');
  const communeUuidParam = queryParams.get('communeUuid');

  const COMMUNE_QUERY = `
    query CommuneByUuid($uuid: String!) {
      locations(uuid: $uuid) {
        edges {
          node {
            id
            uuid
            code
            name
            type
            parent { id uuid name type }
          }
        }
      }
    }
  `;

  const { data: communeData } = useGraphqlQuery(
    COMMUNE_QUERY,
    { uuid: communeUuidParam },
    { skip: !communeUuidParam },
  );

  // Prefill province + commune from query params
  useEffect(() => {
    if (prefillApplied || payrollUuid) return;
    const communeNode = communeData?.locations?.edges?.[0]?.node;
    if (communeNode && communeUuidParam) {
      setEditedPayroll((prev) => ({
        ...prev,
        location: communeNode,
        province: communeNode.parent || null,
      }));
      setPrefillApplied(true);
    }
  }, [communeData, communeUuidParam, prefillApplied, payrollUuid]);

  useEffect(() => {
    if (createPayrollFromFailedInvoices === PAYROLL_FROM_FAILED_INVOICES_URL_PARAM) {
      setIsPayrollFromFailedInvoices(true);
    }
  }, [createPayrollFromFailedInvoices, payrollUuid]);

  useEffect(() => {
    setPayrollUuid(statePayrollUuid ?? taskPayrollUuid);
    setIsInTask(!!taskPayrollUuid);
  }, [taskPayrollUuid, statePayrollUuid]);

  useEffect(() => {
    if (payrollUuid) {
      fetchPayroll(modulesManager, [`id: "${payrollUuid}"`]);
    }
  }, [payrollUuid]);

  useEffect(() => {
    if (
      payroll &&
      payrollUuid &&
      [PAYROLL_STATUS.PENDING_VERIFICATION, PAYROLL_STATUS.PENDING_APPROVAL].includes(payroll.status)
    ) {
      const source = (payroll.status === PAYROLL_STATUS.PENDING_VERIFICATION) ? 'payroll_verification' : 'payroll';
      fetchTask(modulesManager, [`entityId: "${payrollUuid}", source: "${source}"`]);
    }
  }, [payroll]);

  useEffect(() => {
    if (confirmed && typeof confirmed === 'function') confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === PAYROLL_DELETE_ACTION) {
        back();
      }
      if (mutation?.clientMutationId && (!payrollUuid || isPayrollFromFailedInvoices)) {
        fetchPayroll(modulesManager, [`clientMutationId: "${mutation.clientMutationId}"`]);
        setIsPayrollFromFailedInvoices(false);
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => {
    if (payroll) {
      setReadOnly(payroll?.id);
      if (isPayrollFromFailedInvoices) {
        setEditedPayroll({
          ...payroll, id: null, name: null, paymentCycle: null, status: null, fromFailedInvoicesPayrollId: payroll?.id,
        });
      } else {
        setEditedPayroll(payroll);
      }
      if (!payrollUuid && payroll?.id && !isPayrollFromFailedInvoices) {
        const payrollRouteRef = modulesManager.getRef('payroll.route.payroll');
        history.replace(`/${payrollRouteRef}/${payroll.id}`);
      }
    }
  }, [payroll]);

  useEffect(() => () => clearPayroll(), []);

  const mandatoryFieldsEmpty = () => {
    if (
      editedPayroll?.paymentPlan &&
      editedPayroll?.paymentCycle &&
      editedPayroll?.dateValidFrom &&
      editedPayroll?.paymentPoint &&
      editedPayroll?.location &&
      !editedPayroll?.isDeleted) return false;
    return true;
  };

  const canSave = () => !mandatoryFieldsEmpty() && (!readOnly || isPayrollFromFailedInvoices);

  const handleSave = () => {
    if (!payrollUuid) {
      const dateValidFrom = new Date(editedPayroll.dateValidFrom);
      const dateValidTo = new Date(dateValidFrom.getTime());
      dateValidTo.setMonth(dateValidTo.getMonth() + 1);

      const datepaiement = dateValidFrom.toLocaleDateString();
      const localite = editedPayroll.location.name;
      editedPayroll.name = `Demande de paiement du ${datepaiement} pour la commune de ${localite}`;
      editedPayroll.dateValidTo = dateValidTo.toISOString();
    }
    createPayroll(
      editedPayroll,
      formatMessageWithValues('payroll.mutation.create', mutationLabel(payroll)),
    );
    if (benefitPlanId) {
      back();
    }
  };

  const actions = [
    payroll?.status === PAYROLL_STATUS.FAILED && {
      icon: <ReplayIcon />,
      tooltip: formatMessage('tooltip.retrigger'),
      doIt: () => {
        retriggerPayroll(
          payroll,
          formatMessageWithValues('payroll.mutation.retriggerLabel', mutationLabel(payroll)),
        );
      },
    },
  ].filter(Boolean);

  return (
    RIGHT_PAYROLL_CREATE && rights.includes(RIGHT_PAYROLL_CREATE) && (
    <div className={classes.page}>
      <Form
        key={payrollUuid}
        module="payroll"
        title={formatMessageWithValues('payrollPage.title', pageTitle(payroll))}
        titleParams={pageTitle(payroll)}
        openDirty={isPayrollFromFailedInvoices ? true : !payrollUuid}
        benefitPlan={editedPayroll}
        edited={editedPayroll}
        onEditedChanged={setEditedPayroll}
        back={!isInTask && back}
        mandatoryFieldsEmpty={mandatoryFieldsEmpty}
        canSave={canSave}
        save={handleSave}
        HeadPanel={MerankabandiPayrollHeadPanel}
        Panels={[MerankabandiPayrollTab]}
        rights={rights}
        user={user}
        actions={actions}
        setConfirmedAction={setConfirmedAction}
        payrollUuid={payrollUuid}
        saveTooltip={formatMessage('tooltip.save')}
        isInTask={!!taskPayrollUuid}
        payroll={payroll}
        task={task}
        readOnly={readOnly}
        isPayrollFromFailedInvoices={isPayrollFromFailedInvoices}
        benefitPlanId={benefitPlanId}
      />
    </div>
    )
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchPayroll,
  createPayroll,
  retriggerPayroll,
  clearPayroll,
  fetchTask,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

const mapStateToProps = (state, props) => ({
  statePayrollUuid: props?.match?.params?.payroll_uuid === 'null' ? null : props?.match?.params.payroll_uuid,
  createPayrollFromFailedInvoices: props?.match?.params?.createPayrollFromFailedInvoices,
  benefitPlanId: props?.match?.params?.benefitPlanId,
  rights: state.core?.user?.i_user?.rights ?? [],
  user: state.core?.user ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.payroll.submittingMutation,
  mutation: state.payroll.mutation,
  payroll: state.payroll.payroll,
  task: state.merankabandi.task,
});

export default connect(mapStateToProps, mapDispatchToProps)(MerankabandiPayrollPage);
