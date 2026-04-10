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

import {
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
  baseApiUrl,
  apiHeaders,
  downloadExport,
} from '@openimis/fe-core';
import { fetchBehaviorChangePromotions } from '../../actions';
import {
  DEFAULT_PAGE_SIZE,
  MODULE_NAME,
  BEHAVIOR_CHANGE_PROMOTION_ROUTE,
  RIGHT_BEHAVIOR_CHANGE_PROMOTION_SEARCH,
  ROWS_PER_PAGE_OPTIONS,
} from '../../constants';
import BehaviorChangePromotionFilter from './BehaviorChangePromotionFilter';
import ValidationDialog from '../dialogs/ValidationDialog';

function BehaviorChangePromotionSearcher({
  fetchBehaviorChangePromotions,
  fetchingBehaviorChangePromotions,
  fetchedBehaviorChangePromotions,
  errorBehaviorChangePromotions,
  behaviorChangePromotions,
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

  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const handleOpenValidationDialog = (promotion) => {
    setSelectedPromotion(promotion);
    setValidationDialogOpen(true);
  };

  const handleCloseValidationDialog = () => {
    setValidationDialogOpen(false);
    setSelectedPromotion(null);
  };

  const handleValidationComplete = () => {
    handleCloseValidationDialog();
    // Refresh the list
    fetchData({});
  };

  const renderValidationStatus = (promotion) => {
    const statusMap = {
      PENDING: { icon: <HourglassEmptyIcon />, color: 'default', label: formatMessage('validation.status.pending') },
      VALIDATED: { icon: <CheckCircleIcon />, color: 'primary', label: formatMessage('validation.status.validated') },
      REJECTED: { icon: <CancelIcon />, color: 'secondary', label: formatMessage('validation.status.rejected') },
    };

    const status = promotion.validationStatus || 'PENDING';
    const statusConfig = statusMap[status] || statusMap.PENDING;

    return (
      <Chip
        icon={statusConfig.icon}
        label={statusConfig.label}
        color={statusConfig.color}
        size="small"
        onClick={() => handleOpenValidationDialog(promotion)}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  const headers = () => [
    'snapshot.reportDate',
    'location.locationType.0',
    'location.locationType.1',
    'location.locationType.2',
    'snapshot.householdsReached',
    'snapshot.latest',
    'validation.status',
  ];

  const sorts = () => [
    ['report_date', true],
    ['location', true],
    ['male_participants', true],
    ['female_participants', true],
    ['twa_participants', true],
  ];

  const fetchData = (params) => fetchBehaviorChangePromotions(modulesManager, params);

  const rowIdentifier = (behaviorChangePromotion) => behaviorChangePromotion.id;

  const openBehaviorChangePromotion = (behaviorChangePromotion) => rights.includes(RIGHT_BEHAVIOR_CHANGE_PROMOTION_SEARCH) && history.push(
    `/${modulesManager.getRef(BEHAVIOR_CHANGE_PROMOTION_ROUTE)}/${behaviorChangePromotion?.id}`,
  );

  const renderParticipants = (promotion) => (
    <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5}>
      <Chip
        icon={<FaceIcon />}
        label={promotion.maleParticipants}
        size="small"
        style={{ backgroundColor: '#e3f2fd' }}
      />
      <Chip
        icon={<WcIcon />}
        label={promotion.femaleParticipants}
        size="small"
        style={{ backgroundColor: '#fce4ec' }}
      />
      {promotion.twaParticipants > 0 && (
        <Chip
          icon={<AccessibilityIcon />}
          label={`${promotion.twaParticipants} Twa`}
          size="small"
          style={{ backgroundColor: '#f3e5f5' }}
        />
      )}
    </Box>
  );

  // Identify latest snapshot per colline
  const latestPerColline = React.useMemo(() => {
    const latest = {};
    behaviorChangePromotions.forEach((bcp) => {
      const locId = bcp.location?.id;
      if (!locId) return;
      if (!latest[locId] || bcp.reportDate > latest[locId]) {
        latest[locId] = bcp.reportDate;
      }
    });
    return latest;
  }, [behaviorChangePromotions]);

  const isLatest = (bcp) => {
    const locId = bcp.location?.id;
    return locId && latestPerColline[locId] === bcp.reportDate;
  };

  const wrap = (bcp, val) => isLatest(bcp)
    ? <strong>{val}</strong>
    : <span style={{ color: '#999' }}>{val}</span>;

  const itemFormatters = () => [
    (bcp) => wrap(bcp, bcp.reportDate),
    (bcp) => wrap(bcp, bcp.location?.parent?.parent?.name || ''),
    (bcp) => wrap(bcp, bcp.location?.parent?.name || ''),
    (bcp) => wrap(bcp, bcp.location?.name || ''),
    (bcp) => renderParticipants(bcp),
    (bcp) => isLatest(bcp)
      ? <Chip label={formatMessage('snapshot.latest')} size="small" color="primary" />
      : null,
    (bcp) => renderValidationStatus(bcp),
  ];

  const onDoubleClick = (behaviorChangePromotion) => openBehaviorChangePromotion(behaviorChangePromotion);

  const behaviorChangePromotionFilter = ({ filters, onChangeFilters }) => (
    <BehaviorChangePromotionFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  const defaultFilters = () => ({});

  const renderLegend = () => (
    <Paper style={{ padding: '12px 16px', marginBottom: 16, backgroundColor: '#f5f5f5' }}>
      <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
        {formatMessage('legend.title')}
      </Typography>
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
    </Paper>
  );

  const exportFields = [
    'report_date',
    'location',
    'male_participants',
    'female_participants',
    'twa_participants',
  ];

  const exportFieldsColumns = {
    report_date: 'report_date',
    location: formatMessage('location'),
    male_participants: formatMessage('me.male_participants'),
    female_participants: formatMessage('me.female_participants'),
    twa_participants: formatMessage('me.twa_participants'),
  };

  const downloadBehaviorChangePromotions = async () => {
    const url = `${baseApiUrl}/merankabandi/export/behavior-change/`;
    const response = await fetch(url, { headers: apiHeaders() });
    if (!response.ok) throw response;
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'promotions_comportement.xlsx';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      {renderLegend()}
      <Searcher
        module="social_protection"
        fetch={fetchData}
        items={behaviorChangePromotions}
        itemsPageInfo={pageInfo}
        fetchedItems={fetchedBehaviorChangePromotions}
        fetchingItems={fetchingBehaviorChangePromotions}
        errorItems={errorBehaviorChangePromotions}
        tableTitle={formatMessageWithValues('BehaviorChangePromotionSearcher.results', { totalCount })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        rowIdentifier={rowIdentifier}
        onDoubleClick={onDoubleClick}
        FilterPane={behaviorChangePromotionFilter}
        defaultFilters={defaultFilters()}
        exportable
        exportFetch={downloadBehaviorChangePromotions}
        exportFieldLabel={formatMessage('export.label')}
      />
      {selectedPromotion && (
        <ValidationDialog
          open={validationDialogOpen}
          onClose={handleCloseValidationDialog}
          onValidated={handleValidationComplete}
          type="behavior_change"
          data={selectedPromotion}
          detailFields={[
            { key: 'reportDate', label: 'behaviorChangePromotion.report_date' },
            { key: 'location.name', label: 'location' },
            { key: 'maleParticipants', label: 'me.male_participants' },
            { key: 'femaleParticipants', label: 'me.female_participants' },
            { key: 'twaParticipants', label: 'me.twa_participants' },
            { key: 'activities', label: 'behaviorChangePromotion.activities' },
            { key: 'notes', label: 'behaviorChangePromotion.notes' },
          ]}
        />
      )}
    </>
  );
}

const mapStateToProps = (state) => ({
  fetchingBehaviorChangePromotions: state.merankabandi.fetchingBehaviorChangePromotions,
  fetchedBehaviorChangePromotions: state.merankabandi.fetchedBehaviorChangePromotions,
  errorBehaviorChangePromotions: state.merankabandi.errorBehaviorChangePromotions,
  behaviorChangePromotions: state.merankabandi.behaviorChangePromotions,
  pageInfo: state.merankabandi.behaviorChangePromotionsPageInfo,
  totalCount: state.merankabandi.behaviorChangePromotionsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.merankabandi.submittingMutation,
  mutation: state.merankabandi.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchBehaviorChangePromotions,
  journalize,
  clearConfirm,
  coreConfirm,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(BehaviorChangePromotionSearcher);
