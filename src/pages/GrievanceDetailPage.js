import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper, Typography, Grid, Chip, Divider, Box, IconButton, Tooltip,
  Stepper, Step, StepLabel, StepContent, Avatar, Card, CardHeader, CardContent,
} from '@material-ui/core';
import {
  Person, LocationOn, Category, Flag, Phone, Assignment, CheckCircle,
  Cancel, HourglassEmpty, SkipNext, Lock, Edit, Print, ArrowBack,
  Comment as CommentIcon, Timeline,
} from '@material-ui/icons';
import {
  Helmet, useModulesManager, useTranslations, useHistory, withHistory,
  withModulesManager, formatMessage, decodeId, journalize, useGraphqlQuery,
} from '@openimis/fe-core';
import { fetchTicket, fetchTicketComments } from '../grievance-actions';
import { fetchGrievanceWorkflows, fetchReplacementRequests } from '../actions';
import GrievanceTaskSearcher from '../components/grievance-workflow/GrievanceTaskSearcher';

const MODULE_NAME = 'merankabandi';
const GRIEVANCE_MODULE = 'grievanceSocialProtection';

const STATUS_CONFIG = {
  RECEIVED: { color: '#9e9e9e', icon: <HourglassEmpty fontSize="small" /> },
  OPEN: { color: '#2196f3', icon: <Assignment fontSize="small" /> },
  IN_PROGRESS: { color: '#ff9800', icon: <HourglassEmpty fontSize="small" /> },
  RESOLVED: { color: '#4caf50', icon: <CheckCircle fontSize="small" /> },
  CLOSED: { color: '#4caf50', icon: <CheckCircle fontSize="small" /> },
};

const TASK_STATUS_CONFIG = {
  PENDING: { color: '#ff9800', icon: <HourglassEmpty fontSize="small" /> },
  IN_PROGRESS: { color: '#2196f3', icon: <Assignment fontSize="small" /> },
  COMPLETED: { color: '#4caf50', icon: <CheckCircle fontSize="small" /> },
  SKIPPED: { color: '#9e9e9e', icon: <SkipNext fontSize="small" /> },
  BLOCKED: { color: '#f44336', icon: <Lock fontSize="small" /> },
};

const PRIORITY_COLORS = {
  Low: '#4caf50',
  Medium: '#ff9800',
  High: '#f44336',
  Critical: '#9c27b0',
};

const useStyles = makeStyles((theme) => ({
  page: { ...theme.page, maxWidth: 1200, margin: '0 auto' },
  header: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { flex: 1 },
  headerActions: { display: 'flex', gap: theme.spacing(1) },
  section: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  field: { marginBottom: theme.spacing(1) },
  fieldLabel: { color: theme.palette.text.secondary, fontSize: '0.75rem', marginBottom: 2 },
  fieldValue: { fontSize: '0.95rem' },
  chipRow: { display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap', marginBottom: theme.spacing(1) },
  timeline: { padding: 0 },
  commentCard: { marginBottom: theme.spacing(1) },
  commentHeader: { padding: theme.spacing(1, 2) },
  commentBody: { padding: theme.spacing(0, 2, 1, 2), '&:last-child': { paddingBottom: theme.spacing(1) } },
  stepperRoot: { padding: theme.spacing(1) },
  workflowTitle: {
    display: 'flex', alignItems: 'center', gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  emptyState: {
    textAlign: 'center', padding: theme.spacing(3),
    color: theme.palette.text.secondary, fontStyle: 'italic',
  },
}));

function Field({ label, value, classes }) {
  if (!value && value !== 0) return null;
  return (
    <div className={classes.field}>
      <Typography className={classes.fieldLabel}>{label}</Typography>
      <Typography className={classes.fieldValue}>{value}</Typography>
    </div>
  );
}

function GrievanceDetailPage({
  match, intl,
  ticket, fetchingTicket,
  comments,
  grievanceWorkflows,
  replacementRequests,
  fetchTicket: doFetchTicket,
  fetchTicketComments: doFetchComments,
  fetchGrievanceWorkflows: doFetchWorkflows,
  fetchReplacementRequests: doFetchReplacements,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage: fm } = useTranslations(MODULE_NAME, modulesManager);
  const history = useHistory();
  const ticketUuid = match?.params?.ticket_uuid;

  useEffect(() => {
    if (ticketUuid) {
      doFetchTicket(modulesManager, [`id: "${ticketUuid}"`]);
    }
  }, [ticketUuid]);

  useEffect(() => {
    if (ticket?.id) {
      const decodedId = ticket.id;
      doFetchComments({ id: decodedId });
      doFetchWorkflows([`ticket_Id: "${decodedId}"`]);
      doFetchReplacements([`ticket_Id: "${decodedId}"`]);
    }
  }, [ticket?.id]);

  const jsonExt = useMemo(() => {
    if (!ticket?.jsonExt) return {};
    try {
      return typeof ticket.jsonExt === 'string' ? JSON.parse(ticket.jsonExt) : ticket.jsonExt;
    } catch { return {}; }
  }, [ticket?.jsonExt]);

  const reporter = jsonExt?.reporter || {};
  const location = jsonExt?.location || {};
  const categorization = jsonExt?.categorization || {};
  const replacement = jsonExt?.replacement || {};
  const submission = jsonExt?.submission || {};

  // Resolve location from colline_code via GQL to get full path with parent chain
  const collineCode = location.colline_code || null;
  const { data: locationData } = useGraphqlQuery(
    `query LocationPath($code: String!) {
      locations(code: $code, type: "V") {
        edges {
          node {
            name code type
            parent {
              name code type
              parent {
                name code type
              }
            }
          }
        }
      }
    }`,
    { code: collineCode },
    { skip: !collineCode },
  );

  const locationPath = useMemo(() => {
    // First try resolved GQL data
    const node = locationData?.locations?.edges?.[0]?.node;
    if (node) {
      const parts = [];
      // Build path: Province > Commune > Colline (deepest parent first)
      if (node.parent?.parent?.name) parts.push(node.parent.parent.name);
      if (node.parent?.name) parts.push(node.parent.name);
      if (node.name) parts.push(node.name);
      if (parts.length > 0) return parts.join(' > ');
    }
    // Fallback: try names directly from json_ext (legacy data)
    const parts = [];
    if (location.province) parts.push(location.province);
    if (location.commune) parts.push(location.commune);
    if (location.colline) parts.push(location.colline);
    // Last resort: show the colline code
    if (parts.length === 0 && location.colline_code) parts.push(`[${location.colline_code}]`);
    return parts.join(' > ');
  }, [locationData, location]);

  const statusCfg = STATUS_CONFIG[ticket?.status] || STATUS_CONFIG.OPEN;

  // Build unified timeline from workflows + comments
  const timelineEvents = useMemo(() => {
    const events = [];

    // Add workflow tasks
    (grievanceWorkflows || []).forEach((wf) => {
      const tasks = wf.tasks?.edges?.map((e) => e.node) || [];
      tasks.forEach((task) => {
        events.push({
          type: 'task',
          date: task.completedAt || task.startedAt || wf.startedAt,
          title: task.stepLabel,
          subtitle: `${wf.templateLabel} — ${task.assignedRole}${task.assignedUserName ? ` (${task.assignedUserName})` : ''}`,
          status: task.status,
          result: task.result,
        });
      });
    });

    // Add comments
    (comments || []).forEach((c) => {
      events.push({
        type: 'comment',
        date: c.dateCreated,
        title: `${c.commenterFirstName || ''} ${c.commenterLastName || ''}`.trim() || 'Système',
        subtitle: c.commenterTypeName || '',
        body: c.comment,
        isResolution: c.isResolution,
      });
    });

    // Sort by date descending
    events.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return events;
  }, [grievanceWorkflows, comments]);

  // Early return AFTER all hooks
  if (!ticket && !fetchingTicket) {
    return (
      <div className={classes.page}>
        <Typography className={classes.emptyState}>{fm('grievanceDetail.notFound')}</Typography>
      </div>
    );
  }

  const formatDate = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  const formatDateTime = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
  };

  return (
    <div className={classes.page}>
      <Helmet title={`Plainte ${ticket?.code || ''}`} />

      {/* Header */}
      <Paper className={classes.header}>
        <div className={classes.headerLeft}>
          <Box display="flex" alignItems="center" mb={1}>
            <IconButton size="small" onClick={() => history.goBack()} style={{ marginRight: 8 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5">{ticket?.code}</Typography>
          </Box>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {ticket?.title}
          </Typography>
          <div className={classes.chipRow}>
            <Chip
              icon={statusCfg.icon}
              label={formatMessage(intl, GRIEVANCE_MODULE, `ticket.status.${ticket?.status}`) || ticket?.status}
              style={{ backgroundColor: statusCfg.color, color: '#fff' }}
              size="small"
            />
            {ticket?.priority && (
              <Chip
                label={ticket.priority}
                style={{ backgroundColor: PRIORITY_COLORS[ticket.priority] || '#9e9e9e', color: '#fff' }}
                size="small"
              />
            )}
            {ticket?.category && (
              <Chip icon={<Category fontSize="small" />} label={ticket.category} size="small" variant="outlined" />
            )}
            {ticket?.flags && ticket.flags.split(' ').filter(Boolean).map((flag) => (
              <Chip key={flag} icon={<Flag fontSize="small" />} label={flag} size="small" variant="outlined" color="secondary" />
            ))}
          </div>
          <Typography variant="body2" color="textSecondary">
            {fm('grievanceDetail.created')}: {formatDate(ticket?.dateCreated)}
            {ticket?.dateOfIncident && ` | ${fm('grievanceDetail.incident')}: ${formatDate(ticket.dateOfIncident)}`}
            {ticket?.dueDate && ` | ${fm('grievanceDetail.dueDate')}: ${formatDate(ticket.dueDate)}`}
          </Typography>
        </div>
        <div className={classes.headerActions}>
          <Tooltip title={fm('grievanceDetail.edit')}>
            <IconButton onClick={() => history.push(`/ticket/ticket/${ticketUuid}`)}>
              <Edit />
            </IconButton>
          </Tooltip>
        </div>
      </Paper>

      <Grid container spacing={2}>
        {/* Left column: Case details */}
        <Grid item xs={12} md={7}>
          {/* Description */}
          <Paper className={classes.section}>
            <Typography className={classes.sectionTitle}>
              <Assignment /> {fm('grievanceDetail.description')}
            </Typography>
            <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
              {ticket?.description || '-'}
            </Typography>
          </Paper>

          {/* Reporter */}
          <Paper className={classes.section}>
            <Typography className={classes.sectionTitle}>
              <Person /> {fm('grievanceDetail.reporter')}
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Field label={fm('grievanceDetail.reporterName')} value={ticket?.reporterName || reporter.name} classes={classes} />
              </Grid>
              <Grid item xs={6}>
                <Field label={fm('grievanceDetail.phone')} value={ticket?.reporterPhone || reporter.phone} classes={classes} />
              </Grid>
              <Grid item xs={4}>
                <Field label={fm('grievanceDetail.gender')} value={ticket?.gender || reporter.gender} classes={classes} />
              </Grid>
              <Grid item xs={4}>
                <Field label={fm('grievanceDetail.cni')} value={ticket?.cniNumber || reporter.cni_number} classes={classes} />
              </Grid>
              <Grid item xs={4}>
                <Field label={fm('grievanceDetail.beneficiaryType')} value={ticket?.beneficiaryType || reporter.beneficiary_type} classes={classes} />
              </Grid>
              {ticket?.isAnonymous && (
                <Grid item xs={12}>
                  <Chip label={fm('grievanceDetail.anonymous')} size="small" />
                </Grid>
              )}
              {(ticket?.isBatwa || reporter.is_batwa) && (
                <Grid item xs={12}>
                  <Chip label="Batwa" size="small" variant="outlined" />
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Location */}
          <Paper className={classes.section}>
            <Typography className={classes.sectionTitle}>
              <LocationOn /> {fm('grievanceDetail.location')}
            </Typography>
            {locationPath && (
              <Box mb={1}>
                <Typography variant="body1" style={{ fontWeight: 500 }}>
                  {locationPath}
                </Typography>
              </Box>
            )}
            <Grid container spacing={1}>
              {location.milieu_residence && (
                <Grid item xs={4}><Field label={fm('grievanceDetail.milieu')} value={location.milieu_residence} classes={classes} /></Grid>
              )}
            </Grid>
          </Paper>

          {/* Replacement details (if applicable) */}
          {(replacementRequests?.length > 0 || replacement.motif) && (
            <Paper className={classes.section}>
              <Typography className={classes.sectionTitle}>
                <Person /> {fm('grievanceDetail.replacement')}
              </Typography>
              {replacementRequests?.map((rr) => (
                <Card key={rr.id} variant="outlined" style={{ marginBottom: 8 }}>
                  <CardContent>
                    <Grid container spacing={1}>
                      <Grid item xs={4}><Field label={fm('grievanceDetail.replacedSocialId')} value={rr.replacedSocialId} classes={classes} /></Grid>
                      <Grid item xs={4}><Field label={fm('grievanceDetail.motif')} value={rr.motif} classes={classes} /></Grid>
                      <Grid item xs={4}><Field label={fm('grievanceDetail.replacementStatus')} value={rr.status} classes={classes} /></Grid>
                      <Grid item xs={3}><Field label={fm('grievanceDetail.newNom')} value={rr.newNom} classes={classes} /></Grid>
                      <Grid item xs={3}><Field label={fm('grievanceDetail.newPrenom')} value={rr.newPrenom} classes={classes} /></Grid>
                      <Grid item xs={3}><Field label={fm('grievanceDetail.newPhone')} value={rr.newTelephone} classes={classes} /></Grid>
                      <Grid item xs={3}><Field label={fm('grievanceDetail.newCni')} value={rr.newCni} classes={classes} /></Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          )}

          {/* Resolution */}
          {(ticket?.resolution || ticket?.isResolved) && (
            <Paper className={classes.section}>
              <Typography className={classes.sectionTitle}>
                <CheckCircle /> {fm('grievanceDetail.resolution')}
              </Typography>
              <Field label={fm('grievanceDetail.resolutionText')} value={ticket?.resolution} classes={classes} />
              <Field label={fm('grievanceDetail.resolutionDetails')} value={ticket?.resolutionDetails} classes={classes} />
              <Field label={fm('grievanceDetail.resolvedBy')} value={ticket?.resolverName} classes={classes} />
            </Paper>
          )}
        </Grid>

        {/* Right column: Workflow + Timeline */}
        <Grid item xs={12} md={5}>
          {/* Workflow Progress */}
          {grievanceWorkflows?.length > 0 && (
            <Paper className={classes.section}>
              <Typography className={classes.sectionTitle}>
                <Timeline /> {fm('grievanceDetail.workflowProgress')}
              </Typography>
              {grievanceWorkflows.map((wf) => {
                const tasks = wf.tasks?.edges?.map((e) => e.node) || [];
                const completedCount = tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'SKIPPED').length;
                return (
                  <div key={wf.id} style={{ marginBottom: 16 }}>
                    <div className={classes.workflowTitle}>
                      <Typography variant="subtitle2">{wf.templateLabel}</Typography>
                      <Chip
                        label={`${completedCount}/${tasks.length}`}
                        size="small"
                        color={completedCount === tasks.length ? 'primary' : 'default'}
                      />
                    </div>
                    <Stepper orientation="vertical" className={classes.stepperRoot} activeStep={-1}>
                      {tasks.map((task) => {
                        const taskCfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.PENDING;
                        return (
                          <Step key={task.id} completed={task.status === 'COMPLETED'} active={task.status === 'IN_PROGRESS'}>
                            <StepLabel
                              icon={
                                <Avatar
                                  style={{
                                    width: 28, height: 28,
                                    backgroundColor: taskCfg.color,
                                  }}
                                >
                                  {taskCfg.icon}
                                </Avatar>
                              }
                            >
                              <Typography variant="body2" style={{ fontWeight: task.status === 'IN_PROGRESS' ? 600 : 400 }}>
                                {task.stepLabel}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {task.assignedRole}
                                {task.assignedUserName ? ` — ${task.assignedUserName}` : ''}
                                {task.completedAt ? ` · ${formatDateTime(task.completedAt)}` : ''}
                              </Typography>
                            </StepLabel>
                          </Step>
                        );
                      })}
                    </Stepper>
                  </div>
                );
              })}
            </Paper>
          )}

          {/* Activity Feed: comments + task completions */}
          <Paper className={classes.section}>
            <Typography className={classes.sectionTitle}>
              <CommentIcon /> {fm('grievanceDetail.activityFeed')}
            </Typography>
            {timelineEvents.length === 0 && (
              <Typography className={classes.emptyState}>{fm('grievanceDetail.noActivity')}</Typography>
            )}
            {timelineEvents.map((event, idx) => (
              <Card key={idx} className={classes.commentCard} variant="outlined">
                <CardHeader
                  className={classes.commentHeader}
                  avatar={
                    <Avatar style={{
                      width: 32, height: 32,
                      backgroundColor: event.type === 'comment'
                        ? (event.isResolution ? '#4caf50' : '#2196f3')
                        : (TASK_STATUS_CONFIG[event.status]?.color || '#9e9e9e'),
                    }}>
                      {event.type === 'comment'
                        ? (event.isResolution ? <CheckCircle fontSize="small" /> : <CommentIcon fontSize="small" />)
                        : (TASK_STATUS_CONFIG[event.status]?.icon || <Assignment fontSize="small" />)}
                    </Avatar>
                  }
                  title={
                    <Typography variant="body2" style={{ fontWeight: 500 }}>
                      {event.title}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="caption" color="textSecondary">
                      {event.subtitle} · {formatDateTime(event.date)}
                    </Typography>
                  }
                />
                {event.body && (
                  <CardContent className={classes.commentBody}>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                      {event.body}
                    </Typography>
                  </CardContent>
                )}
              </Card>
            ))}
          </Paper>

          {/* Submission info */}
          {submission.collector_name && (
            <Paper className={classes.section}>
              <Typography className={classes.sectionTitle}>
                <Person /> {fm('grievanceDetail.collection')}
              </Typography>
              <Field label={fm('grievanceDetail.collectorName')} value={submission.collector_name} classes={classes} />
              <Field label={fm('grievanceDetail.collectorFunction')} value={submission.collector_function} classes={classes} />
              <Field label={fm('grievanceDetail.collectorPhone')} value={submission.collector_phone} classes={classes} />
              <Field label={fm('grievanceDetail.channel')} value={ticket?.channel} classes={classes} />
              <Field label={fm('grievanceDetail.collectionDate')} value={formatDate(submission.collection_date)} classes={classes} />
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Task Actions (full width) */}
      {ticket?.id && (
        <Paper className={classes.section}>
          <Typography className={classes.sectionTitle}>
            <Assignment /> {fm('grievanceDetail.taskActions')}
          </Typography>
          <GrievanceTaskSearcher ticketId={ticket.id} />
        </Paper>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  ticket: state.grievanceSocialProtection?.ticket,
  fetchingTicket: state.grievanceSocialProtection?.fetchingTicket,
  comments: state.grievanceSocialProtection?.ticketComments,
  grievanceWorkflows: state.merankabandi.grievanceWorkflows,
  replacementRequests: state.merankabandi.replacementRequests,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTicket,
  fetchTicketComments,
  fetchGrievanceWorkflows,
  fetchReplacementRequests,
  journalize,
}, dispatch);

export default withHistory(
  withModulesManager(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(GrievanceDetailPage)),
  ),
);
