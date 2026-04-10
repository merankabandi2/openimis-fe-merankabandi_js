import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import { Chip, Box, Typography, Paper } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import FaceIcon from '@material-ui/icons/Face';
import WcIcon from '@material-ui/icons/Wc';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import AgricultureIcon from '@material-ui/icons/Eco';
import PetsIcon from '@material-ui/icons/Pets';
import StorefrontIcon from '@material-ui/icons/Storefront';

import {
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
  baseApiUrl, apiHeaders,
  downloadExport,
} from '@openimis/fe-core';
import { fetchMicroProjects } from '../../actions';
import {
  DEFAULT_PAGE_SIZE,
  MODULE_NAME,
  MICRO_PROJECT_ROUTE,
  RIGHT_MICRO_PROJECT_SEARCH,
  ROWS_PER_PAGE_OPTIONS,
} from '../../constants';
import MicroProjectFilter from './MicroProjectFilter';
import ValidationDialog from '../dialogs/ValidationDialog';

function MicroProjectSearcher({
  fetchMicroProjects,
  fetchingMicroProjects,
  fetchedMicroProjects,
  errorMicroProjects,
  microProjects,
  coreConfirm,
  clearConfirm,
  pageInfo,
  totalCount,
  confirmed,
  submittingMutation,
  mutation,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  const prevSubmittingMutationRef = useRef();
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedMicroProject, setSelectedMicroProject] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const exportFields = [
    'report_date',
    'location',
    'male_participants',
    'female_participants',
    'twa_participants',
    'agriculture_beneficiaries',
    'livestock_beneficiaries',
    'livestock_goat_beneficiaries',
    'livestock_pig_beneficiaries',
    'livestock_rabbit_beneficiaries',
    'livestock_poultry_beneficiaries',
    'livestock_cattle_beneficiaries',
    'commerce_services_beneficiaries',
  ];
  const exportFieldsColumns = {
    report_date: 'report_date',
    location: formatMessage('location'),
    male_participants: formatMessage('me.male_participants'),
    female_participants: formatMessage('me.female_participants'),
    twa_participants: formatMessage('me.twa_participants'),
    agriculture_beneficiaries: formatMessage('me.agriculture_beneficiaries'),
    livestock_beneficiaries: formatMessage('me.livestock_beneficiaries'),
    livestock_goat_beneficiaries: formatMessage('me.livestock_goat_beneficiaries'),
    livestock_pig_beneficiaries: formatMessage('me.livestock_pig_beneficiaries'),
    livestock_rabbit_beneficiaries: formatMessage('me.livestock_rabbit_beneficiaries'),
    livestock_poultry_beneficiaries: formatMessage('me.livestock_poultry_beneficiaries'),
    livestock_cattle_beneficiaries: formatMessage('me.livestock_cattle_beneficiaries'),
    commerce_services_beneficiaries: formatMessage('me.commerce_services_beneficiaries'),
  };

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const openValidationDialog = (microProject) => {
    setSelectedMicroProject(microProject);
    setValidationDialogOpen(true);
  };

  const handleValidationClose = () => {
    setValidationDialogOpen(false);
    setSelectedMicroProject(null);
  };

  const handleValidated = () => {
    // Refresh the data after validation
    setRefreshKey(refreshKey + 1);
  };

  const headers = () => [
    'snapshot.reportDate',
    'location',
    'participants.label',
    'projectTypes.label',
    'snapshot.latest',
    'validation.status',
  ];

  const sorts = () => [
    ['report_date', true],
    ['location', true],
  ];

  const fetchData = (params) => fetchMicroProjects(modulesManager, params);

  const rowIdentifier = (microProject) => microProject.id;

  const openMicroProject = (microProject) => rights.includes(RIGHT_MICRO_PROJECT_SEARCH) && history.push(
    `/${modulesManager.getRef(MICRO_PROJECT_ROUTE)}/${microProject?.id}`,
  );

  const renderValidationStatus = (microProject) => {
    const statusMap = {
      PENDING: { icon: <HourglassEmptyIcon />, color: 'default', label: formatMessage('validation.status.pending') },
      VALIDATED: { icon: <CheckCircleIcon />, color: 'primary', label: formatMessage('validation.status.validated') },
      REJECTED: { icon: <CancelIcon />, color: 'secondary', label: formatMessage('validation.status.rejected') },
    };

    const status = statusMap[microProject.validationStatus] || statusMap.PENDING;

    return (
      <Chip
        icon={status.icon}
        label={status.label}
        color={status.color}
        size="small"
        onClick={() => openValidationDialog(microProject)}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  const renderParticipants = (microProject) => (
    <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5}>
      <Chip
        icon={<FaceIcon />}
        label={microProject.maleParticipants}
        size="small"
        style={{ backgroundColor: '#e3f2fd' }}
      />
      <Chip
        icon={<WcIcon />}
        label={microProject.femaleParticipants}
        size="small"
        style={{ backgroundColor: '#fce4ec' }}
      />
      {microProject.twaParticipants > 0 && (
        <Chip
          icon={<AccessibilityIcon />}
          label={`${microProject.twaParticipants} Twa`}
          size="small"
          style={{ backgroundColor: '#f3e5f5' }}
        />
      )}
    </Box>
  );

  const renderProjectTypes = (microProject) => (
    <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5}>
      {microProject.agricultureBeneficiaries > 0 && (
        <Chip
          icon={<AgricultureIcon />}
          label={microProject.agricultureBeneficiaries}
          size="small"
          color="primary"
        />
      )}
      {microProject.livestockBeneficiaries > 0 && (
        <Chip
          icon={<PetsIcon />}
          label={microProject.livestockBeneficiaries}
          size="small"
          color="secondary"
        />
      )}
      {microProject.commerceServicesBeneficiaries > 0 && (
        <Chip
          icon={<StorefrontIcon />}
          label={microProject.commerceServicesBeneficiaries}
          size="small"
          style={{ backgroundColor: '#ff9800', color: 'white' }}
        />
      )}
    </Box>
  );

  // Identify latest snapshot per colline
  const latestPerColline = React.useMemo(() => {
    const latest = {};
    microProjects.forEach((mp) => {
      const locId = mp.location?.id;
      if (!locId) return;
      if (!latest[locId] || mp.reportDate > latest[locId]) {
        latest[locId] = mp.reportDate;
      }
    });
    return latest;
  }, [microProjects]);

  const isLatest = (mp) => {
    const locId = mp.location?.id;
    return locId && latestPerColline[locId] === mp.reportDate;
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  const formatLocation = (loc) => {
    if (!loc) return '';
    const parts = [loc.parent?.parent?.name, loc.parent?.name, loc.name].filter(Boolean);
    return parts.join(' › ');
  };

  const wrap = (mp, val) => isLatest(mp)
    ? <strong>{val}</strong>
    : <span style={{ color: '#999' }}>{val}</span>;

  const itemFormatters = () => [
    (mp) => wrap(mp, formatDate(mp.reportDate)),
    (mp) => wrap(mp, formatLocation(mp.location)),
    (mp) => renderParticipants(mp),
    (mp) => renderProjectTypes(mp),
    (mp) => isLatest(mp)
      ? <Chip label={formatMessage('snapshot.latest')} size="small" color="primary" />
      : null,
    (mp) => renderValidationStatus(mp),
  ];

  const downloadIndicators = async () => {
    const url = `${baseApiUrl}/merankabandi/export/micro-projects/`;
    const response = await fetch(url, { headers: apiHeaders() });
    if (!response.ok) throw response;
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'micro_projets.xlsx';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const onDoubleClick = (microProject) => openMicroProject(microProject);

  const microProjectFilter = ({ filters, onChangeFilters }) => (
    <MicroProjectFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  const defaultFilters = () => ({});

  const renderLegend = () => (
    <Paper style={{ padding: '12px 16px', marginBottom: 16, backgroundColor: '#f5f5f5' }}>
      <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
        {formatMessage('legend.title')}
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="caption" style={{ fontWeight: 500 }}>
            {formatMessage('legend.participants')}:
          </Typography>
          <Chip
            icon={<FaceIcon />}
            label={formatMessage('legend.male')}
            size="small"
            style={{ backgroundColor: '#e3f2fd' }}
          />
          <Chip
            icon={<WcIcon />}
            label={formatMessage('legend.female')}
            size="small"
            style={{ backgroundColor: '#fce4ec' }}
          />
          <Chip
            icon={<AccessibilityIcon />}
            label={formatMessage('legend.twa')}
            size="small"
            style={{ backgroundColor: '#f3e5f5' }}
          />
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="caption" style={{ fontWeight: 500 }}>
            {formatMessage('legend.projectTypes')}:
          </Typography>
          <Chip
            icon={<AgricultureIcon />}
            label={formatMessage('legend.agriculture')}
            size="small"
            color="primary"
          />
          <Chip
            icon={<PetsIcon />}
            label={formatMessage('legend.livestock')}
            size="small"
            color="secondary"
          />
          <Chip
            icon={<StorefrontIcon />}
            label={formatMessage('legend.commerce')}
            size="small"
            style={{ backgroundColor: '#ff9800', color: 'white' }}
          />
        </Box>
      </Box>
    </Paper>
  );

  return (
    <>
      {renderLegend()}
      <Searcher
        module="socialProtection"
        fetch={fetchData}
        items={microProjects}
        itemsPageInfo={pageInfo}
        fetchedItems={fetchedMicroProjects}
        fetchingItems={fetchingMicroProjects}
        errorItems={errorMicroProjects}
        tableTitle={formatMessageWithValues('MicroProjectSearcher.results', { totalCount })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        rowIdentifier={rowIdentifier}
        onDoubleClick={onDoubleClick}
        FilterPane={microProjectFilter}
        defaultFilters={defaultFilters()}
        exportable
        exportFetch={downloadIndicators}
        exportFieldLabel={formatMessage('export.label')}
        key={refreshKey}
      />
      <ValidationDialog
        open={validationDialogOpen}
        onClose={handleValidationClose}
        data={selectedMicroProject}
        type="microproject"
        onValidated={handleValidated}
      />
    </>
  );
}

const mapStateToProps = (state) => ({
  fetchingMicroProjects: state.merankabandi.fetchingMicroProjects,
  fetchedMicroProjects: state.merankabandi.fetchedMicroProjects,
  errorMicroProjects: state.merankabandi.errorMicroProjects,
  microProjects: state.merankabandi.microProjects,
  pageInfo: state.merankabandi.microProjectsPageInfo,
  totalCount: state.merankabandi.microProjectsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.merankabandi.submittingMutation,
  mutation: state.merankabandi.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchMicroProjects,
  journalize,
  clearConfirm,
  coreConfirm,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MicroProjectSearcher);
