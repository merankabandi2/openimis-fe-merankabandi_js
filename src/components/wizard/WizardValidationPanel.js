import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, Checkbox, TablePagination,
  CircularProgress, Chip,
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { injectIntl } from 'react-intl';
import { graphql, formatMessage, decodeId } from '@openimis/fe-core';
import { MODULE_NAME, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS, SELECTION_STATUS } from '../../constants';
import { bulkUpdateBeneficiaryStatus, promoteFromWaitingList } from '../../wizard-actions';

function WizardValidationPanel({ intl, benefitPlanId, selectedLocation, dispatch }) {
  const [loading, setLoading] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selected, setSelected] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);

  const fetchBeneficiaries = useCallback((currentPage, currentPageSize) => {
    setLoading(true);
    const first = currentPageSize;
    const offset = currentPage * currentPageSize;
    // Query groups with SELECTED or COMMUNITY_VALIDATED status for community validation
    const statusFilter = `"selection_status": "${SELECTION_STATUS.SELECTED}"`;
    const filters = [
      `benefitPlan_Id: "${benefitPlanId}"`,
      `jsonExt_Icontains: "${statusFilter.replace(/"/g, '\\"')}"`,
      `first: ${first}`,
      `offset: ${offset}`,
    ];
    if (selectedLocation?.uuid) {
      filters.push(`location_Parent_Id: "${selectedLocation.uuid}"`);
    }
    const query = `{
      individualGroup(${filters.join(', ')}) {
        edges { node { id group { id head { firstName lastName } jsonExt } } }
        totalCount
      }
    }`;
    dispatch(graphql(query, 'MERANKABANDI_WIZARD_VALIDATION'))
      .then((result) => {
        const data = result?.payload?.data?.individualGroup;
        if (data) {
          setBeneficiaries((data.edges || []).map((e) => ({
            id: e.node.id,
            groupId: e.node.group?.id,
            head: e.node.group?.head,
            jsonExt: e.node.group?.jsonExt || {},
            selectionStatus: (e.node.group?.jsonExt || {}).selection_status || '-',
          })));
          setTotalCount(data.totalCount || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [benefitPlanId, selectedLocation, dispatch]);

  useEffect(() => {
    if (benefitPlanId) fetchBeneficiaries(page, pageSize);
  }, [benefitPlanId, page, pageSize, fetchBeneficiaries]);

  const handleToggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selected.size === beneficiaries.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(beneficiaries.map((b) => b.id)));
    }
  };

  const handleBulkAction = (action) => {
    if (selected.size === 0) return;
    setSubmitting(true);
    const ids = [...selected].map((id) => decodeId(id));
    const today = new Date().toISOString().slice(0, 10);
    let promise;
    if (action === 'VALIDATED') {
      promise = dispatch(bulkUpdateBeneficiaryStatus(
        benefitPlanId, ids, 'POTENTIAL',
        { selection_status: SELECTION_STATUS.COMMUNITY_VALIDATED, community_validation: { status: 'VALIDATED', date: today } },
      ));
    } else {
      // Reject: mark as COMMUNITY_REJECTED, then trigger waiting list promotion
      promise = dispatch(bulkUpdateBeneficiaryStatus(
        benefitPlanId, ids, 'POTENTIAL',
        { selection_status: SELECTION_STATUS.COMMUNITY_REJECTED, community_validation: { status: 'REJECTED', date: today } },
      )).then(() => {
        // For each rejected beneficiary, promote one from waiting list in the same colline
        const rejectedBeneficiaries = beneficiaries.filter((b) => selected.has(b.id));
        const collinePromotions = rejectedBeneficiaries.reduce((acc, b) => {
          const collineId = b.jsonExt?.location_id;
          if (collineId) {
            acc[collineId] = (acc[collineId] || 0) + 1;
          }
          return acc;
        }, {});
        return Promise.all(
          Object.entries(collinePromotions).map(([collineId, count]) =>
            dispatch(promoteFromWaitingList(benefitPlanId, collineId, count)),
          ),
        );
      });
    }
    promise
      .then(() => {
        setSelected(new Set());
        fetchBeneficiaries(page, pageSize);
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="textSecondary">
          {selected.size} {formatMessage(intl, MODULE_NAME, 'wizard.validation.selected')}
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleBulkAction('VALIDATED')}
            disabled={selected.size === 0 || submitting}
            style={{ marginRight: 8 }}
          >
            {formatMessage(intl, MODULE_NAME, 'wizard.action.retain')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<CancelIcon />}
            onClick={() => handleBulkAction('REJECTED')}
            disabled={selected.size === 0 || submitting}
          >
            {formatMessage(intl, MODULE_NAME, 'wizard.action.reject')}
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.size > 0 && selected.size < beneficiaries.length}
                  checked={beneficiaries.length > 0 && selected.size === beneficiaries.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.lastName')}</TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.firstName')}</TableCell>
              <TableCell align="right">{formatMessage(intl, MODULE_NAME, 'wizard.column.pmtScore')}</TableCell>
              <TableCell>{formatMessage(intl, MODULE_NAME, 'wizard.column.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {beneficiaries.map((b) => (
              <TableRow key={b.id} selected={selected.has(b.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.has(b.id)}
                    onChange={() => handleToggle(b.id)}
                  />
                </TableCell>
                <TableCell>{b.head?.lastName}</TableCell>
                <TableCell>{b.head?.firstName}</TableCell>
                <TableCell align="right">{b.jsonExt?.pmt_score ?? '-'}</TableCell>
                <TableCell>
                  <Chip label={b.selectionStatus} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Box>
  );
}

export default injectIntl(WizardValidationPanel);
