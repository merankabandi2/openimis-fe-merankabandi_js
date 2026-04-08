import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper, Typography, Grid, Chip, Divider, Box, IconButton, Tooltip,
  Stepper, Step, StepLabel, Avatar, Card, CardHeader, CardContent,
  TextField, Button, Select, MenuItem, InputLabel, FormControl,
  LinearProgress, Table, TableBody, TableRow, TableCell, TableHead,
  Tabs, Tab,
} from '@material-ui/core';
import {
  Person, LocationOn, Category, Flag, Assignment, CheckCircle, Phone,
  HourglassEmpty, SkipNext, Lock, Edit, ArrowBack,
  Comment as CommentIcon, Timeline, Send, PlayArrow,
  Add as AddIcon,
} from '@material-ui/icons';
import {
  Helmet, useModulesManager, useTranslations, useHistory, withHistory,
  withModulesManager, formatMessage, decodeId, journalize, useGraphqlQuery,
} from '@openimis/fe-core';
import { fetchTicket, fetchTicketComments, createTicketComment } from '../grievance-actions';
import { fetchGrievanceWorkflows, fetchReplacementRequests, completeGrievanceTask, skipGrievanceTask, fetchAvailableStepTemplates, addTaskToWorkflow } from '../actions';
import AddStepDialog from '../components/grievance/AddStepDialog';

const MODULE_NAME = 'merankabandi';
const GRIEVANCE_MODULE = 'grievanceSocialProtection';

const STATUS_CFG = {
  RECEIVED: { color: '#9e9e9e', label: 'Reçu' },
  OPEN: { color: '#2196f3', label: 'Ouvert' },
  IN_PROGRESS: { color: '#ff9800', label: 'En cours' },
  RESOLVED: { color: '#4caf50', label: 'Résolu' },
  CLOSED: { color: '#4caf50', label: 'Clôturé' },
};

const TASK_CFG = {
  PENDING: { color: '#ff9800', icon: <HourglassEmpty style={{ fontSize: 16 }} /> },
  IN_PROGRESS: { color: '#2196f3', icon: <PlayArrow style={{ fontSize: 16 }} /> },
  COMPLETED: { color: '#4caf50', icon: <CheckCircle style={{ fontSize: 16 }} /> },
  SKIPPED: { color: '#9e9e9e', icon: <SkipNext style={{ fontSize: 16 }} /> },
  BLOCKED: { color: '#bdbdbd', icon: <Lock style={{ fontSize: 16 }} /> },
};

const PRIORITY_COLORS = { Low: '#4caf50', MEDIUM: '#ff9800', Medium: '#ff9800', High: '#f44336', Critical: '#9c27b0' };

const ROLES = ['OT', 'RTM', 'RSI', 'RDO', 'RVBG', 'RIUIRCH'];

const useStyles = makeStyles((theme) => ({
  page: { ...theme.page },
  header: {
    padding: theme.spacing(2, 3),
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chips: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
  card: { padding: theme.spacing(2), marginBottom: theme.spacing(2) },
  cardTitle: {
    fontWeight: 600, fontSize: '0.9rem', marginBottom: theme.spacing(1),
    display: 'flex', alignItems: 'center', gap: 6, color: theme.palette.primary.main,
  },
  fieldRow: { display: 'flex', gap: theme.spacing(3), flexWrap: 'wrap', marginBottom: 4 },
  fld: {},
  fldLabel: { color: theme.palette.text.secondary, fontSize: '0.7rem', marginBottom: 1 },
  fldValue: { fontSize: '0.9rem' },
  descText: { whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.6 },
  stepDot: { width: 24, height: 24, fontSize: 12 },
  stepperCompact: { padding: '4px 0' },
  wfHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  eventCard: { marginBottom: 6, '&:last-child': { marginBottom: 0 } },
  eventBody: { padding: '0 12px 8px 12px', '&:last-child': { paddingBottom: 8 } },
  commentForm: { marginTop: theme.spacing(1.5), padding: theme.spacing(1.5), background: theme.palette.grey[50], borderRadius: 8 },
  commentActions: { display: 'flex', gap: 8, marginTop: 8, alignItems: 'flex-end', justifyContent: 'flex-end' },
  empty: { textAlign: 'center', padding: theme.spacing(2), color: theme.palette.text.secondary, fontStyle: 'italic', fontSize: '0.85rem' },
  replCard: { padding: theme.spacing(1.5), marginBottom: 8, background: '#f5f5f5', borderRadius: 8 },
}));

function F({ label, value, classes }) {
  if (!value && value !== 0) return null;
  return (
    <div className={classes.fld}>
      <Typography className={classes.fldLabel}>{label}</Typography>
      <Typography className={classes.fldValue}>{value}</Typography>
    </div>
  );
}

function translateCat(fm, cat) {
  if (!cat) return '';
  return cat.split(' > ').map(p => {
    const t = fm(`grievance.category.${p}`);
    return (t !== `merankabandi.grievance.category.${p}` && t !== `grievance.category.${p}`) ? t : p.replace(/_/g, ' ');
  }).join(' > ');
}

function GrievanceDetailPage({
  match, intl, ticket, fetchingTicket, comments, grievanceWorkflows, replacementRequests,
  submittingMutation, mutation,
  availableStepTemplates, fetchingAvailableStepTemplates,
  fetchTicket: doFetchTicket, fetchTicketComments: doFetchComments,
  fetchGrievanceWorkflows: doFetchWorkflows, fetchReplacementRequests: doFetchReplacements,
  createTicketComment: doCreateComment, journalize: doJournalize,
  completeGrievanceTask: doCompleteTask, skipGrievanceTask: doSkipTask,
  fetchAvailableStepTemplates: doFetchStepTemplates, addTaskToWorkflow: doAddTaskToWorkflow,
}) {
  const classes = useStyles();
  const mm = useModulesManager();
  const { formatMessage: fm } = useTranslations(MODULE_NAME, mm);
  const history = useHistory();
  const ticketUuid = match?.params?.ticket_uuid;

  useEffect(() => { if (ticketUuid) doFetchTicket(mm, [`id: "${ticketUuid}"`]); }, [ticketUuid]);
  useEffect(() => {
    if (ticket?.id) {
      doFetchComments({ id: ticket.id });
      doFetchWorkflows([`ticket_Id: "${ticket.id}"`]);
      doFetchReplacements([`ticket_Id: "${ticket.id}"`]);
    }
  }, [ticket?.id]);

  const [commentText, setCommentText] = useState('');
  const [taggedRole, setTaggedRole] = useState('');
  const [actionText, setActionText] = useState('');
  // Per-task form data: { [taskId]: { field1: value1, ... } }
  const [taskFormData, setTaskFormData] = useState({});

  const decodeRelayId = (id) => {
    try { return atob(id).split(':').pop(); }
    catch { return id; }
  };

  const updateTaskField = (taskId, field, value) => {
    setTaskFormData(prev => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), [field]: value },
    }));
  };

  const handleCompleteTask = (taskId) => {
    const uuid = decodeRelayId(taskId);
    const formData = taskFormData[taskId] || {};
    // Merge all form fields into the result payload
    const payload = {
      ...formData,
      confirmation: 'yes',
      resolution_notes: formData.resolution_notes || formData.notes || 'Completed',
    };
    doCompleteTask(uuid, payload, 'Compléter la tâche');
    setTaskFormData(prev => ({ ...prev, [taskId]: {} }));
  };

  const handleSkipTask = (taskId) => {
    const uuid = decodeRelayId(taskId);
    const reason = (taskFormData[taskId] || {}).notes || 'Passé';
    doSkipTask(uuid, reason, 'Passer la tâche');
  };

  // Map action_type to the fields the UI should show for task completion
  const TASK_FIELDS = {
    verify_social_id: [{ key: 'social_id', label: 'Social ID ou CNI', required: true }],
    verify_individual: [{ key: 'social_id', label: 'Social ID ou CNI', required: true }],
    beneficiary_deactivate: [{ key: 'deactivation_reason', label: 'Motif de désactivation', required: true }],
    location_update: [
      { key: 'new_colline', label: 'Nouvelle colline (code ou nom)', required: true },
    ],
    payment_reissue: [
      { key: 'amount', label: 'Montant (BIF)', required: true },
      { key: 'payment_details', label: 'Détails du paiement' },
    ],
    account_suspend: [{ key: 'account_identifier', label: 'Identifiant du compte' }],
    account_reactivate: [{ key: 'new_phone_number', label: 'Nouveau numéro de téléphone' }],
    phone_number_swap: [
      { key: 'old_phone', label: 'Ancien numéro', required: true },
      { key: 'new_phone', label: 'Nouveau numéro', required: true },
    ],
    sim_attribution: [
      { key: 'new_sim_number', label: 'Numéro de SIM' },
      { key: 'operator', label: 'Opérateur (lumicash/ecocash)' },
    ],
    external_referral: [
      { key: 'referral_type', label: 'Type de référencement' },
      { key: 'referral_details', label: 'Détails' },
    ],
    provide_information: [{ key: 'information_provided', label: 'Information fournie', required: true }],
  };
  const [prevSub, setPrevSub] = useState(false);

  useEffect(() => {
    if (prevSub && !submittingMutation) {
      doJournalize(mutation);
      if (ticket?.id) {
        doFetchTicket(mm, [`id: "${ticketUuid}"`]);
        doFetchComments({ id: ticket.id });
        doFetchWorkflows([`ticket_Id: "${ticket.id}"`]);
      }
    }
    setPrevSub(submittingMutation);
  }, [submittingMutation]);

  const handleSend = () => {
    const text = commentText.trim();
    if (!text || !ticket?.id) return;
    doCreateComment(
      { comment: text, jsonExt: JSON.stringify({ tagged_role: taggedRole || null, action: actionText || null }) },
      { id: ticket.id }, 'User', fm('grievanceDetail.addComment'),
    );
    setCommentText('');
    setTaggedRole('');
    setActionText('');
  };

  const ext = useMemo(() => {
    if (!ticket?.jsonExt) return {};
    try { return typeof ticket.jsonExt === 'string' ? JSON.parse(ticket.jsonExt) : ticket.jsonExt; }
    catch { return {}; }
  }, [ticket?.jsonExt]);

  const reporter = ext.reporter || {};
  const loc = ext.location || {};
  const submission = ext.submission || {};
  const replacement = ext.replacement || {};
  const [bottomTab, setBottomTab] = useState('tasks');
  const [addStepOpen, setAddStepOpen] = useState(false);

  useEffect(() => {
    if (addStepOpen && (!availableStepTemplates || availableStepTemplates.length === 0)) {
      doFetchStepTemplates();
    }
  }, [addStepOpen]);

  // Extract beneficiary identifiers from ticket data
  // Priority: ticket.beneficiary (saved from task) → replacement → reporter
  const beneficiary = ext.beneficiary || {};
  const socialId = beneficiary.social_id || replacement?.replaced_social_id || reporter?.social_id || null;
  const cniNumber = beneficiary.cni || replacement?.replaced_cni || replacement?.replaced_ci || reporter?.cni_number || null;

  const isBeneficiary = reporter?.is_beneficiary === 'oui' || !!socialId || !!cniNumber;

  // Path 1: social_id → Group (code=social_id) → GroupIndividual → Individual
  const { data: groupData } = useGraphqlQuery(
    `query GroupBySocialId($code: String!) {
      groups(code: $code, first: 1) {
        edges { node {
          id code jsonExt
          location { id name parent { name parent { name } } }
          groupindividuals { edges { node {
            individual { id firstName lastName dob jsonExt }
            role recipientType
          }}}
        }}
      }
    }`,
    { code: socialId },
    { skip: !socialId },
  );

  // Path 2: CNI → Individual (json_ext contains CNI) → GroupIndividual → Group
  const { data: individualByCniData } = useGraphqlQuery(
    `query IndByCni($cni: String!) {
      individuals(jsonExt_Icontains: $cni, first: 1) {
        edges { node {
          id firstName lastName dob jsonExt
          groupindividuals(first: 1) { edges { node {
            group { id code jsonExt
              location { id name parent { name parent { name } } }
              groupindividuals { edges { node {
                individual { id firstName lastName dob jsonExt }
                role recipientType
              }}}
            }
          }}}
        }}
      }
    }`,
    { cni: cniNumber },
    { skip: !cniNumber || !!socialId },
  );

  // Resolve group and primary individual from either path
  const group = useMemo(() => {
    if (socialId) return groupData?.groups?.edges?.[0]?.node || null;
    if (cniNumber) return individualByCniData?.individuals?.edges?.[0]?.node?.groupindividuals?.edges?.[0]?.node?.group || null;
    return null;
  }, [groupData, individualByCniData, socialId, cniNumber]);

  const householdMembers = useMemo(() => {
    if (!group) return [];
    return (group.groupindividuals?.edges || []).map(e => {
      const gi = e.node;
      const ind = gi.individual;
      const indExt = typeof ind?.jsonExt === 'string' ? JSON.parse(ind.jsonExt) : (ind?.jsonExt || {});
      return {
        id: ind?.id,
        firstName: ind?.firstName,
        lastName: ind?.lastName,
        dob: ind?.dob,
        gender: indExt?.sexe || '-',
        role: gi?.role || '-',
        recipientType: gi?.recipientType || '-',
      };
    });
  }, [group]);

  // Find primary individual for payment lookup
  const primaryMember = householdMembers.find(m => m.recipientType === 'PRIMARY');
  const primaryIndividualId = primaryMember?.id ? decodeId(primaryMember.id) : null;

  // Fetch benefit consumptions for the primary individual
  const { data: paymentsData } = useGraphqlQuery(
    `query BenefitPayments($individualId: ID!) {
      benefitConsumption(individual_Id: $individualId, orderBy: ["-date_due"], first: 20) {
        edges { node {
          id code amount status dateDue receipt
          payrollbenefitconsumptionSet { edges { node { payroll { name status } } } }
        }}
      }
    }`,
    { individualId: primaryIndividualId },
    { skip: !primaryIndividualId },
  );

  const payments = useMemo(() => {
    return (paymentsData?.benefitConsumption?.edges || []).map(e => e.node);
  }, [paymentsData]);

  // Fetch past tickets for same reporter (by name in json_ext)
  const reporterName = reporter?.name || '';
  const { data: pastTicketsData } = useGraphqlQuery(
    `query PastTickets($name: String!) {
      tickets(jsonExt_Icontains: $name, first: 20, orderBy: ["-dateCreated"]) {
        edges { node {
          id code title status category dateCreated priority
        }}
      }
    }`,
    { name: reporterName },
    { skip: !reporterName || reporterName.length < 3 },
  );

  // Location path
  const collineCode = loc.colline_code || null;
  const { data: locData } = useGraphqlQuery(
    `query LP($code: String!) { locations(code: $code, type: "V") { edges { node { name parent { name parent { name } } } } } }`,
    { code: collineCode }, { skip: !collineCode },
  );
  const locPath = useMemo(() => {
    const n = locData?.locations?.edges?.[0]?.node;
    if (n) {
      const p = [];
      if (n.parent?.parent?.name) p.push(n.parent.parent.name);
      if (n.parent?.name) p.push(n.parent.name);
      if (n.name) p.push(n.name);
      if (p.length) return p.join(' > ');
    }
    const p = [loc.province, loc.commune, loc.colline].filter(Boolean);
    return p.length ? p.join(' > ') : (loc.colline_code ? `[${loc.colline_code}]` : '');
  }, [locData, loc]);

  const sCfg = STATUS_CFG[ticket?.status] || STATUS_CFG.OPEN;

  // Flat task list for bottom table
  const allTasks = useMemo(() => {
    const tasks = [];
    (grievanceWorkflows || []).forEach(wf => {
      (wf.tasks?.edges?.map(e => e.node) || []).forEach((t, idx) => {
        tasks.push({
          ...t,
          workflowLabel: wf.templateLabel,
          stepNumber: idx + 1,
        });
      });
    });
    return tasks;
  }, [grievanceWorkflows]);

  // Unified timeline
  const timeline = useMemo(() => {
    const ev = [];
    (grievanceWorkflows || []).forEach(wf => {
      (wf.tasks?.edges?.map(e => e.node) || []).forEach(t => {
        if (t.status === 'COMPLETED' || t.status === 'SKIPPED') {
          ev.push({
            type: 'task', date: t.completedAt || t.startedAt,
            title: t.stepLabel, sub: `${wf.templateLabel} — ${t.assignedRole}`,
            status: t.status,
          });
        }
      });
    });
    (comments || []).forEach(c => {
      let cExt = null;
      try { cExt = c.jsonExt ? (typeof c.jsonExt === 'string' ? JSON.parse(c.jsonExt) : c.jsonExt) : null; } catch {}
      ev.push({
        type: 'comment', date: c.dateCreated,
        title: `${c.commenterFirstName || ''} ${c.commenterLastName || ''}`.trim() || 'Système',
        body: c.comment, isRes: c.isResolution, ext: cExt,
      });
    });
    ev.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return ev;
  }, [grievanceWorkflows, comments]);

  if (!ticket && !fetchingTicket) {
    return <div className={classes.page}><Typography className={classes.empty}>{fm('grievanceDetail.notFound')}</Typography></div>;
  }

  const fmtDate = d => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch { return d; } };
  const fmtDT = d => { if (!d) return '-'; try { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return d; } };

  return (
    <div className={classes.page}>
      <Helmet title={`Plainte ${ticket?.code || ''}`} />

      {/* ── Header ── */}
      <Paper className={classes.header}>
        <div style={{ flex: 1 }}>
          <Box display="flex" alignItems="center" mb={0.5}>
            <IconButton size="small" onClick={() => history.goBack()} style={{ marginRight: 8 }}><ArrowBack /></IconButton>
            <Typography variant="h5" style={{ fontWeight: 600 }}>{ticket?.code}</Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginLeft: 12 }}>{ticket?.title}</Typography>
          </Box>
          <div className={classes.chips}>
            <Chip label={sCfg.label} style={{ backgroundColor: sCfg.color, color: '#fff', fontWeight: 600 }} size="small" />
            {ticket?.priority && <Chip label={ticket.priority} style={{ backgroundColor: PRIORITY_COLORS[ticket.priority] || '#9e9e9e', color: '#fff' }} size="small" />}
            {ticket?.category && <Chip icon={<Category fontSize="small" />} label={translateCat(fm, ticket.category)} size="small" variant="outlined" />}
            {ticket?.flags && ticket.flags.split(' ').filter(Boolean).map(f => <Chip key={f} icon={<Flag fontSize="small" />} label={f} size="small" variant="outlined" color="secondary" />)}
          </div>
          <Typography variant="caption" color="textSecondary">
            Créé le {fmtDate(ticket?.dateCreated)}{ticket?.dateOfIncident ? ` · Incident: ${fmtDate(ticket.dateOfIncident)}` : ''}
            {locPath ? ` · ${locPath}` : ''}
          </Typography>
        </div>
        <Tooltip title="Modifier"><IconButton onClick={() => history.push(`/ticket/ticket/${ticketUuid}`)}><Edit /></IconButton></Tooltip>
      </Paper>

      <Grid container spacing={2}>
        {/* ── Left: Information ── */}
        <Grid item xs={12} md={7}>
          {/* Description + Reporter + Collecte — merged */}
          <Paper className={classes.card}>
            <Typography className={classes.cardTitle}><Assignment fontSize="small" /> Description</Typography>
            <Typography className={classes.descText}>{ticket?.description || '-'}</Typography>

            <Divider style={{ margin: '12px 0' }} />

            {/* Reporter compact */}
            <Typography className={classes.cardTitle}><Person fontSize="small" /> Plaignant</Typography>
            {(ticket?.isAnonymous || reporter.is_anonymous) ? (
              <Chip label="Anonyme" size="small" style={{ marginBottom: 8 }} />
            ) : (
              <div className={classes.fieldRow}>
                <F label="Nom" value={ticket?.reporterName || reporter.name} classes={classes} />
                <F label="Téléphone" value={ticket?.reporterPhone || reporter.phone} classes={classes} />
                <F label="Sexe" value={ticket?.gender || reporter.gender} classes={classes} />
                <F label="CNI" value={ticket?.cniNumber || reporter.cni_number} classes={classes} />
                {(ticket?.isBatwa || reporter.is_batwa) && <Chip label="Batwa" size="small" variant="outlined" />}
              </div>
            )}

            {/* Collecte compact */}
            {submission.collector_name && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <Typography className={classes.cardTitle}><Phone fontSize="small" /> Collecte</Typography>
                <div className={classes.fieldRow}>
                  <F label="Collecteur" value={submission.collector_name} classes={classes} />
                  <F label="Fonction" value={submission.collector_function} classes={classes} />
                  <F label="Téléphone" value={submission.collector_phone} classes={classes} />
                  <F label="Canal" value={ticket?.channel?.replace(/_/g, ' ')} classes={classes} />
                </div>
              </>
            )}
          </Paper>

          {/* Replacement (conditional) */}
          {(replacementRequests?.length > 0 || replacement.motif) && (
            <Paper className={classes.card}>
              <Typography className={classes.cardTitle}><Person fontSize="small" /> Remplacement</Typography>
              {replacementRequests?.map(rr => (
                <div key={rr.id} className={classes.replCard}>
                  <div className={classes.fieldRow}>
                    <F label="Social ID remplacé" value={rr.replacedSocialId} classes={classes} />
                    <F label="Motif" value={rr.motif?.replace(/_/g, ' ')} classes={classes} />
                    <Chip label={rr.status} size="small" style={{ backgroundColor: rr.status === 'APPROVED' ? '#4caf50' : '#ff9800', color: '#fff' }} />
                  </div>
                  <div className={classes.fieldRow}>
                    <F label="Nouveau nom" value={rr.newNom} classes={classes} />
                    <F label="Prénom" value={rr.newPrenom} classes={classes} />
                    <F label="Téléphone" value={rr.newTelephone} classes={classes} />
                    <F label="CNI" value={rr.newCni} classes={classes} />
                  </div>
                </div>
              ))}
            </Paper>
          )}

          {/* Resolution (conditional) */}
          {(ticket?.resolution || ticket?.status === 'RESOLVED' || ticket?.status === 'CLOSED') && (
            <Paper className={classes.card}>
              <Typography className={classes.cardTitle}><CheckCircle fontSize="small" /> Résolution</Typography>
              <F label="Résolution" value={ticket?.resolution} classes={classes} />
            </Paper>
          )}
        </Grid>

        {/* ── Right: Workflow + Activity ── */}
        <Grid item xs={12} md={5}>
          {/* Workflow stepper */}
          {grievanceWorkflows?.length > 0 && (
            <Paper className={classes.card}>
              {grievanceWorkflows.map(wf => {
                const tasks = wf.tasks?.edges?.map(e => e.node) || [];
                const done = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'SKIPPED').length;
                const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
                return (
                  <div key={wf.id}>
                    <div className={classes.wfHeader}>
                      <Typography variant="subtitle2" style={{ fontWeight: 600 }}>{wf.templateLabel}</Typography>
                      <Box display="flex" alignItems="center">
                        <Chip label={`${done}/${tasks.length}`} size="small" color={done === tasks.length ? 'primary' : 'default'} />
                        {wf.tasks?.edges?.some(e => e.node.status === 'IN_PROGRESS') && (
                          <Tooltip title="Ajouter une étape">
                            <IconButton size="small" onClick={() => setAddStepOpen(true)} style={{ marginLeft: 4, padding: 2 }}>
                              <AddIcon style={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </div>
                    <LinearProgress variant="determinate" value={pct} style={{ height: 6, borderRadius: 3, marginBottom: 8 }} />
                    <Stepper orientation="vertical" className={classes.stepperCompact} activeStep={-1} connector={<div style={{ minHeight: 4 }} />}>
                      {tasks.map(task => {
                        const tc = TASK_CFG[task.status] || TASK_CFG.PENDING;
                        return (
                          <Step key={task.id} completed={task.status === 'COMPLETED'} active={task.status === 'IN_PROGRESS'}>
                            <StepLabel
                              icon={<Avatar className={classes.stepDot} style={{ backgroundColor: tc.color }}>{tc.icon}</Avatar>}
                            >
                              <Typography variant="body2" style={{ fontWeight: task.status === 'IN_PROGRESS' ? 600 : 400, fontSize: '0.85rem' }}>
                                {task.stepLabel}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" style={{ fontSize: '0.7rem' }}>
                                {task.assignedRole}
                                {task.completedAt ? ` · ${fmtDT(task.completedAt)}` : ''}
                              </Typography>
                              {task.status === 'IN_PROGRESS' && task.result?.error && (
                                <Typography variant="caption" style={{ color: '#f44336', display: 'block', marginTop: 4, fontWeight: 600 }}>
                                  ⚠ {task.result.error}
                                </Typography>
                              )}
                              {task.status === 'IN_PROGRESS' && (() => {
                                const fields = TASK_FIELDS[task.actionType] || [];
                                const formData = taskFormData[task.id] || {};
                                const hasRequired = fields.filter(f => f.required).every(f => formData[f.key]);
                                return (
                                <Box mt={0.5}>
                                  {/* Render action-specific fields */}
                                  {fields.map(field => (
                                    <TextField
                                      key={field.key}
                                      size="small" variant="outlined" fullWidth
                                      label={field.label}
                                      required={field.required}
                                      value={formData[field.key] || ''}
                                      onChange={e => updateTaskField(task.id, field.key, e.target.value)}
                                      style={{ marginBottom: 4 }}
                                      inputProps={{ style: { fontSize: '0.8rem', padding: '6px 8px' } }}
                                      InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                                      error={field.required && task.result?.error && !formData[field.key]}
                                    />
                                  ))}
                                  {/* Always show a notes field for manual resolution handlers */}
                                  {fields.length === 0 && (
                                    <TextField
                                      size="small" variant="outlined" fullWidth
                                      label="Notes"
                                      value={formData.notes || ''}
                                      onChange={e => updateTaskField(task.id, 'notes', e.target.value)}
                                      style={{ marginBottom: 4 }}
                                      inputProps={{ style: { fontSize: '0.8rem', padding: '6px 8px' } }}
                                      InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                                    />
                                  )}
                                  <Box display="flex" gap={1}>
                                    <Button
                                      size="small" variant="contained" color="primary"
                                      startIcon={<CheckCircle style={{ fontSize: 14 }} />}
                                      onClick={() => handleCompleteTask(task.id)}
                                      disabled={submittingMutation || (fields.some(f => f.required) && !hasRequired)}
                                      style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                                    >
                                      Compléter
                                    </Button>
                                    {!task.isRequired && (
                                      <Button
                                        size="small" variant="outlined"
                                        startIcon={<SkipNext style={{ fontSize: 14 }} />}
                                        onClick={() => handleSkipTask(task.id)}
                                        disabled={submittingMutation}
                                        style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                                      >
                                        Passer
                                      </Button>
                                    )}
                                  </Box>
                                </Box>
                                );
                              })()}
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

          {/* Activity feed + comment form */}
          <Paper className={classes.card}>
            <Typography className={classes.cardTitle}><CommentIcon fontSize="small" /> Activité</Typography>

            {timeline.length === 0 && <Typography className={classes.empty}>Aucune activité</Typography>}

            {timeline.map((ev, i) => (
              <Card key={i} className={classes.eventCard} variant="outlined">
                <CardHeader
                  style={{ padding: '6px 12px' }}
                  avatar={
                    <Avatar style={{
                      width: 28, height: 28,
                      backgroundColor: ev.type === 'comment'
                        ? (ev.isRes ? '#4caf50' : '#2196f3')
                        : (TASK_CFG[ev.status]?.color || '#9e9e9e'),
                    }}>
                      {ev.type === 'comment'
                        ? (ev.isRes ? <CheckCircle style={{ fontSize: 14 }} /> : <CommentIcon style={{ fontSize: 14 }} />)
                        : (TASK_CFG[ev.status]?.icon || <Assignment style={{ fontSize: 14 }} />)}
                    </Avatar>
                  }
                  title={<Typography variant="body2" style={{ fontWeight: 500, fontSize: '0.85rem' }}>{ev.title}</Typography>}
                  subheader={<Typography variant="caption" color="textSecondary" style={{ fontSize: '0.7rem' }}>{ev.sub || ''} · {fmtDT(ev.date)}</Typography>}
                />
                {(ev.body || ev.ext) && (
                  <CardContent className={classes.eventBody}>
                    {ev.body && <Typography variant="body2" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{ev.body}</Typography>}
                    {ev.ext?.tagged_role && <Chip size="small" variant="outlined" color="primary" label={`@ ${ev.ext.tagged_role}`} style={{ height: 20, fontSize: '0.7rem', marginTop: 4 }} />}
                    {ev.ext?.action && <Chip size="small" variant="outlined" color="secondary" label={ev.ext.action} style={{ height: 20, fontSize: '0.7rem', marginTop: 4, marginLeft: 4 }} />}
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Comment form — role mention only, no user picker */}
            <div className={classes.commentForm}>
              <TextField
                fullWidth variant="outlined" size="small" multiline rows={2}
                placeholder="Écrire un commentaire..."
                value={commentText} onChange={e => setCommentText(e.target.value)}
              />
              <div className={classes.commentActions}>
                <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
                  <InputLabel>Rôle</InputLabel>
                  <Select value={taggedRole} onChange={e => setTaggedRole(e.target.value)} label="Rôle">
                    <MenuItem value=""><em>-</em></MenuItem>
                    {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  variant="outlined" size="small" style={{ minWidth: 140 }}
                  label="Action requise" value={actionText} onChange={e => setActionText(e.target.value)}
                />
                <Button
                  variant="contained" color="primary" size="small" endIcon={<Send />}
                  disabled={!commentText.trim() || submittingMutation}
                  onClick={handleSend}
                >
                  Envoyer
                </Button>
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Bottom Tabbed Data Tables ── */}
      <Paper style={{ marginTop: 16 }}>
        <Tabs
          value={bottomTab}
          onChange={(_, v) => setBottomTab(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          style={{ borderBottom: '1px solid #e0e0e0', minHeight: 36 }}
        >
          <Tab value="tasks" label={`Tâches (${allTasks.length})`} style={{ minHeight: 36, fontSize: '0.8rem', textTransform: 'none' }} />
          {isBeneficiary && <Tab value="household" label={`Membres du ménage (${householdMembers.length})`} style={{ minHeight: 36, fontSize: '0.8rem', textTransform: 'none' }} />}
          {isBeneficiary && <Tab value="payments" label={`Paiements (${payments.length})`} style={{ minHeight: 36, fontSize: '0.8rem', textTransform: 'none' }} />}
          <Tab value="pastTickets" label="Plaintes précédentes" style={{ minHeight: 36, fontSize: '0.8rem', textTransform: 'none' }} />
        </Tabs>

        {/* Tasks Table */}
        {bottomTab === 'tasks' && (
          <Table size="small">
            <TableHead>
              <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>#</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Étape</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Workflow</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Rôle</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Statut</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Date</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allTasks.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" style={{ color: '#999', padding: 16 }}>Aucune tâche</TableCell></TableRow>
              ) : allTasks.map((task, i) => {
                const tCfg = TASK_CFG[task.status] || TASK_CFG.PENDING;
                return (
                  <TableRow key={task.id || i} style={{ backgroundColor: task.status === 'IN_PROGRESS' ? '#e3f2fd' : undefined }}>
                    <TableCell style={{ fontSize: '0.8rem' }}>{task.stepNumber}</TableCell>
                    <TableCell style={{ fontSize: '0.8rem', fontWeight: task.status === 'IN_PROGRESS' ? 600 : 400 }}>
                      {task.stepLabel}
                      {(() => {
                        try {
                          const ext = task.jsonExt
                            ? (typeof task.jsonExt === 'string' ? JSON.parse(task.jsonExt) : task.jsonExt)
                            : {};
                          return ext?.is_additional ? (
                            <Chip size="small" label="ajouté" variant="outlined" color="primary"
                              style={{ fontSize: '0.6rem', height: 16, marginLeft: 4 }} />
                          ) : null;
                        } catch { return null; }
                      })()}
                    </TableCell>
                    <TableCell style={{ fontSize: '0.8rem' }}>{task.workflowLabel}</TableCell>
                    <TableCell style={{ fontSize: '0.8rem' }}>{task.assignedRole}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={tCfg.icon}
                        label={task.status === 'COMPLETED' ? 'Terminé' : task.status === 'IN_PROGRESS' ? 'En cours' : task.status === 'SKIPPED' ? 'Passé' : task.status === 'BLOCKED' ? 'Bloqué' : 'En attente'}
                        style={{ backgroundColor: `${tCfg.color}20`, color: tCfg.color, fontWeight: 500, fontSize: '0.7rem', height: 22 }}
                      />
                    </TableCell>
                    <TableCell style={{ fontSize: '0.75rem', color: '#666' }}>
                      {task.completedAt ? fmtDT(task.completedAt) : task.startedAt ? fmtDT(task.startedAt) : '-'}
                    </TableCell>
                    <TableCell style={{ fontSize: '0.75rem', color: '#666', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.result?.notes || task.result?.error || '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Household Members */}
        {bottomTab === 'household' && (
          <Table size="small">
            <TableHead>
              <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Nom</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Prénom</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Sexe</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Date de naissance</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Rôle</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {householdMembers.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" style={{ color: '#999', padding: 16 }}>
                  {socialId ? 'Aucun membre trouvé pour ce social_id' : 'Aucun bénéficiaire identifié'}
                </TableCell></TableRow>
              ) : householdMembers.map((m, i) => (
                <TableRow key={m.id || i} hover style={{ cursor: 'pointer' }} onClick={() => m.id && history.push(`/individual/individual/${decodeId(m.id)}`)}>
                  <TableCell style={{ fontSize: '0.8rem' }}>{m.lastName}</TableCell>
                  <TableCell style={{ fontSize: '0.8rem' }}>{m.firstName}</TableCell>
                  <TableCell style={{ fontSize: '0.8rem' }}>{m.gender === 'M' ? 'Homme' : m.gender === 'F' ? 'Femme' : m.gender}</TableCell>
                  <TableCell style={{ fontSize: '0.8rem' }}>{m.dob ? fmtDate(m.dob) : '-'}</TableCell>
                  <TableCell style={{ fontSize: '0.8rem' }}>{m.role}</TableCell>
                  <TableCell style={{ fontSize: '0.8rem' }}>
                    {m.recipientType === 'PRIMARY' ? <Chip size="small" label="Chef" color="primary" style={{ height: 20, fontSize: '0.7rem' }} /> : m.recipientType}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Payments */}
        {bottomTab === 'payments' && (
          <Table size="small">
            <TableHead>
              <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Code</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Date</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Montant (BIF)</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Statut</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Reçu</TableCell>
                <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Payroll</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" style={{ color: '#999', padding: 16 }}>Aucun paiement</TableCell></TableRow>
              ) : payments.map((p, i) => {
                const payroll = p.payrollbenefitconsumptionSet?.edges?.[0]?.node?.payroll;
                const statusColor = p.status === 'RECONCILED' ? '#4caf50' : p.status === 'APPROVE_FOR_PAYMENT' ? '#2196f3' : p.status === 'REJECTED' ? '#f44336' : '#ff9800';
                return (
                  <TableRow key={p.id || i}>
                    <TableCell style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{p.code}</TableCell>
                    <TableCell style={{ fontSize: '0.8rem' }}>{p.dateDue ? fmtDate(p.dateDue) : '-'}</TableCell>
                    <TableCell style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.amount ? Number(p.amount).toLocaleString('fr-FR') : '-'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={p.status === 'RECONCILED' ? 'Payé' : p.status === 'APPROVE_FOR_PAYMENT' ? 'En cours' : p.status === 'REJECTED' ? 'Rejeté' : p.status}
                        style={{ backgroundColor: `${statusColor}20`, color: statusColor, fontWeight: 500, fontSize: '0.7rem', height: 22 }} />
                    </TableCell>
                    <TableCell style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{p.receipt || '-'}</TableCell>
                    <TableCell style={{ fontSize: '0.75rem', color: '#666' }}>{payroll?.name?.substring(0, 40) || '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Past Tickets */}
        {bottomTab === 'pastTickets' && (
          <Box p={1}>
            <Typography variant="caption" color="textSecondary" style={{ padding: 8, display: 'block' }}>
              Recherche par nom du plaignant : « {reporterName} »
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Code</TableCell>
                  <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Titre</TableCell>
                  <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Catégorie</TableCell>
                  <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Statut</TableCell>
                  <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Priorité</TableCell>
                  <TableCell style={{ fontWeight: 600, fontSize: '0.8rem' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!pastTicketsData?.tickets?.edges?.length ? (
                  <TableRow><TableCell colSpan={6} align="center" style={{ color: '#999', padding: 16 }}>
                    {reporterName ? 'Aucune plainte précédente trouvée' : 'Nom du plaignant non renseigné'}
                  </TableCell></TableRow>
                ) : pastTicketsData.tickets.edges.filter(e => e.node.id !== ticket?.id).map((e, i) => {
                  const t = e.node;
                  const tsCfg = STATUS_CFG[t.status] || STATUS_CFG.OPEN;
                  return (
                    <TableRow key={t.id || i} hover style={{ cursor: 'pointer' }} onClick={() => history.push(`/grievance/detail/${decodeId(t.id)}`)}>
                      <TableCell style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{t.code}</TableCell>
                      <TableCell style={{ fontSize: '0.8rem' }}>{t.title || '-'}</TableCell>
                      <TableCell style={{ fontSize: '0.8rem' }}>{t.category ? translateCat(fm, t.category) : '-'}</TableCell>
                      <TableCell><Chip size="small" label={tsCfg.label} style={{ backgroundColor: tsCfg.color, color: '#fff', fontSize: '0.7rem', height: 22 }} /></TableCell>
                      <TableCell style={{ fontSize: '0.8rem' }}>{t.priority || '-'}</TableCell>
                      <TableCell style={{ fontSize: '0.8rem' }}>{fmtDate(t.dateCreated)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      <AddStepDialog
        open={addStepOpen}
        onClose={() => setAddStepOpen(false)}
        stepTemplates={availableStepTemplates}
        loading={fetchingAvailableStepTemplates}
        onAdd={(step) => {
          const activeWorkflow = (grievanceWorkflows || []).find(wf =>
            wf.tasks?.edges?.some(e => e.node.status === 'IN_PROGRESS')
          );
          if (activeWorkflow) {
            doAddTaskToWorkflow(
              decodeId(activeWorkflow.id),
              step.id,
              "Ajout d'une étape au workflow",
            );
            setAddStepOpen(false);
          }
        }}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  ticket: state.grievanceSocialProtection?.ticket,
  fetchingTicket: state.grievanceSocialProtection?.fetchingTicket,
  comments: state.grievanceSocialProtection?.ticketComments,
  submittingMutation: state.grievanceSocialProtection?.submittingMutation,
  mutation: state.grievanceSocialProtection?.mutation,
  grievanceWorkflows: state.merankabandi.grievanceWorkflows,
  replacementRequests: state.merankabandi.replacementRequests,
  availableStepTemplates: state.merankabandi.availableStepTemplates || [],
  fetchingAvailableStepTemplates: state.merankabandi.fetchingAvailableStepTemplates,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTicket, fetchTicketComments, createTicketComment,
  fetchGrievanceWorkflows, fetchReplacementRequests, journalize,
  completeGrievanceTask, skipGrievanceTask,
  fetchAvailableStepTemplates, addTaskToWorkflow,
}, dispatch);

export default withHistory(
  withModulesManager(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(GrievanceDetailPage)),
  ),
);
