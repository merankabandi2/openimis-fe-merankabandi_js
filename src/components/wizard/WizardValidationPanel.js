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
import { MODULE_NAME, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import { bulkUpdateBeneficiaryStatus } from '../../wizard-actions';

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
    const filters = [
      `benefitPlan_Id: "${benefitPlanId}"`,
      `status: POTENTIAL`,
      `first: ${first}`,
      `offset: ${offset}`,
      `orderBy: ["-json_ext__pmt_score"]`,
    ];
    if (selectedLocation?.uuid && selectedLocation?.type) {
      const levelMap = { D: 0, W: 1, V: 2 };
      const level = levelMap[selectedLocation.type];
      if (level !== undefined) {
        filters.push(`parentLocation: "${selectedLocation.uuid}"`);
        filters.push(`parentLocationLevel: ${level}`);
      }
    }
    const query = `{
      groupBeneficiary(${filters.join(', ')}) {
        edges{node{id group{head{firstName lastName dob}}jsonExt status}}
        totalCount
      }
    }`;
    dispatch(graphql(query, 'MERANKABANDI_WIZARD_VALIDATION'))
      .then((result) => {
        const data = result?.payload?.data?.groupBeneficiary;
        if (data) {
          setBeneficiaries((data.edges || []).map((e) => e.node));
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
        benefitPlanId, ids, 'VALIDATED',
        { community_validation: { status: 'VALIDATED', date: today } },
      ));
    } else {
      promise = dispatch(bulkUpdateBeneficiaryStatus(
        benefitPlanId, ids, 'POTENTIAL',
        { community_validation: { status: 'REJECTED', date: today } },
      ));
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
                <TableCell>{b.group?.head?.lastName}</TableCell>
                <TableCell>{b.group?.head?.firstName}</TableCell>
                <TableCell align="right">{b.jsonExt?.pmt_score ?? '-'}</TableCell>
                <TableCell>
                  <Chip label={b.status} size="small" />
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
