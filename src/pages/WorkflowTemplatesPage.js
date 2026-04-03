import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Helmet, Searcher, useModulesManager, useTranslations, useHistory } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/core/styles';
import { Chip, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { fetchWorkflowTemplates } from '../actions';
import { ROUTE_GRIEVANCE_WORKFLOW_TEMPLATE, RIGHT_GRIEVANCE_WORKFLOW_ADMIN } from '../constants';
import WorkflowTemplateFilter from '../components/grievance-workflow/WorkflowTemplateFilter';

const MODULE_NAME = 'merankabandi';

const CASE_TYPE_GROUPS = [
  { key: 'remplacement', label: 'Remplacement' },
  { key: 'suppression', label: 'Suppression' },
  { key: 'reclamation:sensible', label: 'Réclamation — Cas sensible' },
  { key: 'reclamation:speciale', label: 'Réclamation — Cas spécial' },
  { key: 'reclamation:non_sensible', label: 'Réclamation — Cas non sensible' },
];

function getCaseTypeGroup(caseType) {
  if (!caseType) return '';
  for (const group of CASE_TYPE_GROUPS) {
    if (caseType.startsWith(group.key)) return group.label;
  }
  return '';
}

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
}));

function WorkflowTemplatesPage({
  fetchWorkflowTemplates,
  fetchingWorkflowTemplates,
  workflowTemplates,
  workflowTemplatesPageInfo,
  workflowTemplatesTotalCount,
  rights,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const history = useHistory();

  const headers = () => [
    'workflow.template.name',
    'workflow.template.label',
    'workflow.template.caseTypeGroup',
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

  const workflowTemplateFilter = ({ filters, onChangeFilters }) => (
    <WorkflowTemplateFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  const itemFormatters = () => [
    (t) => t.name,
    (t) => t.label,
    (t) => (
      <Chip
        label={getCaseTypeGroup(t.caseType)}
        size="small"
        variant="outlined"
        color="primary"
      />
    ),
    (t) => t.steps?.edges?.length ?? 0,
    (t) => (
      <Chip
        label={t.isActive ? formatMessage('workflow.template.active') : formatMessage('workflow.template.inactive')}
        color={t.isActive ? 'primary' : 'default'}
        size="small"
      />
    ),
  ];

  const onDoubleClick = (template) => {
    history.push(`/${ROUTE_GRIEVANCE_WORKFLOW_TEMPLATE}/${template.id}`);
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('workflow.templates.title')} />
      <Searcher
        module="merankabandi"
        FilterPane={workflowTemplateFilter}
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
        onDoubleClick={onDoubleClick}
      />
      {rights?.includes(RIGHT_GRIEVANCE_WORKFLOW_ADMIN) && (
        <Fab
          color="primary"
          className={classes.fab}
          onClick={() => history.push(`/${ROUTE_GRIEVANCE_WORKFLOW_TEMPLATE}`)}
        >
          <AddIcon />
        </Fab>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  workflowTemplates: state.merankabandi.workflowTemplates,
  workflowTemplatesPageInfo: state.merankabandi.workflowTemplatesPageInfo,
  fetchingWorkflowTemplates: state.merankabandi.fetchingWorkflowTemplates,
  workflowTemplatesTotalCount: state.merankabandi.workflowTemplatesTotalCount,
  rights: state.core?.user?.i_user?.rights ?? [],
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchWorkflowTemplates,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowTemplatesPage);
