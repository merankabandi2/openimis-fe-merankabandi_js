import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Helmet, Searcher, useModulesManager, useTranslations } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/core/styles';
import { Chip } from '@material-ui/core';
import { fetchWorkflowTemplates } from '../actions';

const MODULE_NAME = 'merankabandi';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function WorkflowTemplatesPage({
  fetchWorkflowTemplates,
  fetchingWorkflowTemplates,
  workflowTemplates,
  workflowTemplatesPageInfo,
  workflowTemplatesTotalCount,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const headers = () => [
    'workflow.template.name',
    'workflow.template.label',
    'workflow.template.caseType',
    'workflow.template.stepsCount',
    'workflow.template.isActive',
  ];

  const sorts = () => [
    ['name', true],
    ['label', true],
    ['caseType', true],
    null,
    ['isActive', true],
  ];

  const itemFormatters = () => [
    (t) => t.name,
    (t) => t.label,
    (t) => t.caseType,
    (t) => t.steps?.edges?.length ?? 0,
    (t) => (
      <Chip
        label={t.isActive ? formatMessage('workflow.template.active') : formatMessage('workflow.template.inactive')}
        color={t.isActive ? 'primary' : 'default'}
        size="small"
      />
    ),
  ];

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('workflow.templates.title')} />
      <Searcher
        module="merankabandi"
        fetch={fetchWorkflowTemplates}
        items={workflowTemplates}
        itemsPageInfo={workflowTemplatesPageInfo}
        fetchedItems={!fetchingWorkflowTemplates}
        fetchingItems={fetchingWorkflowTemplates}
        tableTitle={formatMessageWithValues('workflow.templates.searcherTitle', { count: workflowTemplatesTotalCount ?? 0 })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowIdentifier={(t) => t.id}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  workflowTemplates: state.merankabandi.workflowTemplates,
  workflowTemplatesPageInfo: state.merankabandi.workflowTemplatesPageInfo,
  fetchingWorkflowTemplates: state.merankabandi.fetchingWorkflowTemplates,
  workflowTemplatesTotalCount: state.merankabandi.workflowTemplatesTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchWorkflowTemplates,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowTemplatesPage);
