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
  createWorkflowTemplate,
  deleteWorkflowTemplate,
  fetchWorkflowTemplates,
  ACTION_TYPE,
} from '../actions';
import {
  MODULE_NAME,
  RIGHT_GRIEVANCE_WORKFLOW_ADMIN,
} from '../constants';
import WorkflowTemplateForm from '../components/grievance-workflow/WorkflowTemplateForm';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function WorkflowTemplatePage({
  templateId,
  rights,
  submittingMutation,
  mutation,
  workflowTemplates,
  fetchWorkflowTemplates,
  createWorkflowTemplate,
  deleteWorkflowTemplate,
  journalize: dispatchJournalize,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const [editedTemplate, setEditedTemplate] = useState({});
  const prevSubmittingMutationRef = useRef();

  const back = () => history.goBack();

  useEffect(() => {
    if (templateId) {
      fetchWorkflowTemplates([`id: "${templateId}"`]);
    }
  }, [templateId]);

  useEffect(() => {
    if (templateId && workflowTemplates?.length) {
      setEditedTemplate(workflowTemplates[0]);
    }
  }, [workflowTemplates]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      dispatchJournalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.DELETE_WORKFLOW_TEMPLATE) {
        back();
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const mandatoryFieldsEmpty = () => {
    if (editedTemplate?.name && editedTemplate?.caseType) return false;
    return true;
  };

  const canSave = () => !mandatoryFieldsEmpty() && !templateId;

  const handleSave = () => {
    createWorkflowTemplate(
      editedTemplate,
      formatMessage('workflow.template.save.create'),
    );
    back();
  };

  return (
    rights?.includes(RIGHT_GRIEVANCE_WORKFLOW_ADMIN) && (
      <div className={classes.page}>
        <Form
          module="merankabandi"
          title={formatMessage('workflow.template.pageTitle')}
          openDirty={!templateId}
          edited={editedTemplate}
          onEditedChanged={setEditedTemplate}
          back={back}
          mandatoryFieldsEmpty={mandatoryFieldsEmpty}
          canSave={canSave}
          save={handleSave}
          HeadPanel={WorkflowTemplateForm}
          readOnly={!!templateId}
          rights={rights}
          saveTooltip={formatMessage('workflow.template.create')}
        />
      </div>
    )
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchWorkflowTemplates,
  createWorkflowTemplate,
  deleteWorkflowTemplate,
  journalize,
}, dispatch);

const mapStateToProps = (state, props) => ({
  templateId: props.match?.params?.template_id,
  rights: state.core?.user?.i_user?.rights ?? [],
  submittingMutation: state.merankabandi.submittingMutation,
  mutation: state.merankabandi.mutation,
  workflowTemplates: state.merankabandi.workflowTemplates,
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowTemplatePage);
