import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/styles';

import {
  Form,
  useHistory,
  useModulesManager,
  useTranslations,
  journalize,
} from '@openimis/fe-core';
import {
  createRoleAssignment,
  deleteRoleAssignment,
  fetchRoleAssignments,
  ACTION_TYPE,
} from '../actions';
import {
  MODULE_NAME,
  RIGHT_GRIEVANCE_WORKFLOW_ADMIN,
} from '../constants';
import RoleAssignmentForm from '../components/grievance-workflow/RoleAssignmentForm';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function RoleAssignmentPage({
  assignmentId,
  rights,
  submittingMutation,
  mutation,
  roleAssignments,
  fetchRoleAssignments,
  createRoleAssignment,
  deleteRoleAssignment,
  journalize: dispatchJournalize,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const [editedAssignment, setEditedAssignment] = useState({});
  const prevSubmittingMutationRef = useRef();

  const back = () => history.goBack();

  useEffect(() => {
    if (assignmentId) {
      fetchRoleAssignments([`id: "${assignmentId}"`]);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (assignmentId && roleAssignments?.length) {
      setEditedAssignment(roleAssignments[0]);
    }
  }, [roleAssignments]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      dispatchJournalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.DELETE_ROLE_ASSIGNMENT) {
        back();
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const mandatoryFieldsEmpty = () => {
    if (editedAssignment?.role && editedAssignment?.userId) return false;
    return true;
  };

  const canSave = () => !mandatoryFieldsEmpty() && !assignmentId;

  const handleSave = () => {
    createRoleAssignment(
      editedAssignment,
      formatMessage('workflow.role.save.create'),
    );
    back();
  };

  return (
    rights?.includes(RIGHT_GRIEVANCE_WORKFLOW_ADMIN) && (
      <div className={classes.page}>
        <Form
          module="merankabandi"
          title={formatMessage('workflow.role.pageTitle')}
          openDirty={!assignmentId}
          edited={editedAssignment}
          onEditedChanged={setEditedAssignment}
          back={back}
          mandatoryFieldsEmpty={mandatoryFieldsEmpty}
          canSave={canSave}
          save={handleSave}
          HeadPanel={RoleAssignmentForm}
          readOnly={!!assignmentId}
          rights={rights}
          saveTooltip={formatMessage('workflow.role.create')}
        />
      </div>
    )
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchRoleAssignments,
  createRoleAssignment,
  deleteRoleAssignment,
  journalize,
}, dispatch);

const mapStateToProps = (state, props) => ({
  assignmentId: props.match?.params?.assignment_id,
  rights: state.core?.user?.i_user?.rights ?? [],
  submittingMutation: state.merankabandi.submittingMutation,
  mutation: state.merankabandi.mutation,
  roleAssignments: state.merankabandi.roleAssignments,
});

export default connect(mapStateToProps, mapDispatchToProps)(RoleAssignmentPage);
